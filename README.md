# 🏏 Live Cricket Score App — Flask + Cricbuzz API

A complete **Live Cricket Score Web Application** built using:

- **Flask** (Backend)
- **Cricbuzz API** (Live & Historical Match Data)
- **HTML, CSS & JavaScript** (Frontend UI)
- **Pytest** with 12 Passing Test Cases

This project delivers real-time cricket scores, commentary, match details, and previous match scorecards through a fully tested and well-structured Flask API.

---


## 🚀 Features

### 🏏 Cricket Data
- Real-time live match scores  
- Previous match records and scorecards  
- Match details, info & commentary  
- Auto fallback logic from `hscard` → `scard`  
- Handles empty responses gracefully  

### ⚙️ Backend (Flask)
- REST API architecture  
- Proxy requests to Cricbuzz API  
- Clean JSON responses  
- Graceful 500 error handling  

### 🎨 Frontend (HTML, CSS & JS)
- Responsive web layout  
- Live score updates via JavaScript  
- Simple & clean UI using HTML + CSS  
- Smooth dynamic score fetching  

### 🧪 Testing (Pytest)
- 12 test cases  
- Covers routing, proxying, fallback logic, and error handling  
- Uses monkeypatch to mock `requests.get`  
- FakeResponse class for controlled JSON mocking  

---


## 🧪 Pytest — 12 Passing Tests

### 🔍 1. Home Page Test

#### `test_index_returns_html_ok`
Ensures `/` returns HTML with the correct `content-type`.

---

### 🏏 2. Scorecard Logic Tests

| Test Name | Purpose |
|----------|----------|
| `test_scorecard_prefers_hscard_when_has_data` | Uses `hscard` when scoreCard data exists |
| `test_scorecard_falls_back_to_scard_when_hscard_empty` | Falls back to `scard` when `hscard` is empty |
| `test_scorecard_returns_debug_when_no_scorecard_anywhere` | Returns debug JSON when both APIs give no scoreCard |
| `test_scorecard_handles_exception_with_500` | Simulated exception results in clean 500 JSON response |

---

### 📦 3. Collection API Tests

| Test Name | Purpose |
|-----------|----------|
| `test_collection_endpoints_proxy_json` | Tests `/api/matches`, `/api/live`, `/api/upcoming` proxy JSON |

---

### 📝 4. Match-Specific Tests

| Test Name | Purpose |
|-----------|----------|
| `test_match_specific_endpoints_proxy_json` | Tests `/details`, `/info`, `/commentary` endpoints |

---

### ❗ 5. Error Handling Test

| Test Name | Purpose |
|-----------|----------|
| `test_proxy_endpoints_error_path_returns_500` | Ensures all proxy endpoints return 500 on failure |

---

## 🎨 Frontend (HTML, CSS, JavaScript)

The UI is designed using:

- **`index.html`** → Main layout and structure  
- **`style.css`** → Responsive design & styling  
- **`script.js`** → Fetches live scores & updates UI dynamically  

### Frontend Capabilities

- Live match scorecards  
- Match title & status  
- Inning-by-inning breakdown  
- Live commentary (if available)  
- Modern, clean, and responsive interface  

---


## 📸 Screenshot

- Live matches scorecards 
<img width="1869" height="902" alt="Screenshot 2025-11-28 194911" src="https://github.com/user-attachments/assets/6f7e1fdc-e5b7-4368-8aba-bb7531b19bf6" />

- Upcoming Matches
<img width="1853" height="889" alt="Screenshot 2025-11-28 194927" src="https://github.com/user-attachments/assets/d00b5239-559e-45ad-9c24-fc8a932b5c0c" />

- Recent Matches
<img width="1855" height="907" alt="Screenshot 2025-11-28 194939" src="https://github.com/user-attachments/assets/1dba4cd4-1bcb-4a89-9f11-fe311fc40770" />







