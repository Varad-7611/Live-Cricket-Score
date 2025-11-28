import json
import types
import pytest

import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app import app


class FakeResponse:
    def __init__(self, data, status_code=200):
        self._data = data
        self.status_code = status_code

    def json(self):
        return self._data


@pytest.fixture()
def client():
    app.testing = True
    with app.test_client() as c:
        yield c


# ---- Helper to install a URL-aware mock for requests.get used by app ----

def install_mock_get(monkeypatch, mapping, raise_on=None):
    """
    mapping: dict of substring->json_data to return when that substring is in the URL
    raise_on: optional list of substrings; if URL contains any, raise Exception
    """

    def _mock_get(url, headers=None, *args, **kwargs):
        if raise_on and any(key in url for key in raise_on):
            raise Exception("network error")
        for key, payload in mapping.items():
            if key in url:
                return FakeResponse(payload)
        # default empty
        return FakeResponse({})

    monkeypatch.setattr("app.requests.get", _mock_get)


# ---------------------- Tests for index route ----------------------

def test_index_returns_html_ok(client):
    resp = client.get("/")
    assert resp.status_code == 200
    # Flask may set text/html; charset=utf-8
    assert "text/html" in resp.content_type


# ---------------------- Tests for scorecard route ----------------------

def test_scorecard_prefers_hscard_when_has_data(client, monkeypatch):
    # hscard returns non-empty scoreCard; scard should not be needed
    install_mock_get(
        monkeypatch,
        mapping={
            "/hscard": {"scoreCard": [{"innings": 1}], "matchHeader": {"id": 1}},
            "/scard": {"scoreCard": []},  # fallback if called
        },
    )

    resp = client.get("/api/scorecard/12345")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data.get("scoreCard") and len(data["scoreCard"]) == 1
    assert data.get("matchHeader", {}).get("id") == 1


def test_scorecard_falls_back_to_scard_when_hscard_empty(client, monkeypatch):
    install_mock_get(
        monkeypatch,
        mapping={
            "/hscard": {"scoreCard": []},
            "/scard": {"scoreCard": [{"innings": 1}], "matchHeader": {"id": 2}},
        },
    )

    resp = client.get("/api/scorecard/98765")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data.get("scoreCard") and len(data["scoreCard"]) == 1
    assert data.get("matchHeader", {}).get("id") == 2


def test_scorecard_returns_debug_when_no_scorecard_anywhere(client, monkeypatch):
    install_mock_get(
        monkeypatch,
        mapping={
            "/hscard": {"matchHeader": {"series": "Test"}},  # no scoreCard key
            "/scard": {},
        },
    )

    resp = client.get("/api/scorecard/55555")
    assert resp.status_code == 200
    data = resp.get_json()
    # Should return normalized object with debug info
    assert "debug" in data
    assert data.get("scoreCard") == []
    assert isinstance(data.get("matchHeader"), dict)


def test_scorecard_handles_exception_with_500(client, monkeypatch):
    install_mock_get(
        monkeypatch,
        mapping={},
        raise_on=["/hscard"],
    )

    resp = client.get("/api/scorecard/11111")
    assert resp.status_code == 500
    data = resp.get_json()
    assert "error" in data


# ---------------------- Generic proxy endpoints ----------------------
@pytest.mark.parametrize(
    "endpoint, remote_key",
    [
        ("/api/matches", "recent"),
        ("/api/live", "live"),
        ("/api/upcoming", "upcoming"),
    ],
)
def test_collection_endpoints_proxy_json(client, monkeypatch, endpoint, remote_key):
    payload = {"typeMatches": [{"matchType": remote_key.upper()}]}
    # Any URL for these endpoints contains the remote path segment
    install_mock_get(
        monkeypatch,
        mapping={
            "/matches/v1/recent": payload,
            "/matches/v1/live": payload,
            "/matches/v1/upcoming": payload,
        },
    )

    resp = client.get(endpoint)
    assert resp.status_code == 200
    assert resp.get_json() == payload


@pytest.mark.parametrize(
    "endpoint, suffix",
    [
        ("/api/match/24680/details", ""),
        ("/api/match/24680/info", ""),
        ("/api/match/24680/commentary", "/comm"),
    ],
)
def test_match_specific_endpoints_proxy_json(client, monkeypatch, endpoint, suffix):
    # Build mapping to catch any match id + suffix
    expected = {"ok": True, "path": suffix or "/details"}

    def _mock_get(url, headers=None, *args, **kwargs):
        # Return expected for any of these calls
        if "/mcenter/v1/24680" in url and (suffix in url if suffix else True):
            return FakeResponse(expected)
        return FakeResponse({})

    monkeypatch.setattr("app.requests.get", _mock_get)

    resp = client.get(endpoint)
    assert resp.status_code == 200
    assert resp.get_json() == expected


def test_proxy_endpoints_error_path_returns_500(client, monkeypatch):
    # Make all proxy endpoints raise an error
    def _mock_get(url, headers=None, *args, **kwargs):
        raise Exception("boom")

    monkeypatch.setattr("app.requests.get", _mock_get)

    # Try a subset of endpoints
    for ep in [
        "/api/matches",
        "/api/live",
        "/api/upcoming",
        "/api/match/1/details",
        "/api/match/1/info",
        "/api/match/1/commentary",
    ]:
        resp = client.get(ep)
        assert resp.status_code == 500
        assert "error" in resp.get_json()