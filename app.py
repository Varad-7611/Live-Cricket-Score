from flask import Flask, jsonify, render_template
from flask_cors import CORS
import requests

app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app)

# API Configuration
RAPIDAPI_KEY = "cricbuzz_api_key_here"
RAPIDAPI_HOST = "cricbuzz-cricket.p.rapidapi.com"

headers = {
    "x-rapidapi-key": RAPIDAPI_KEY,
    "x-rapidapi-host": RAPIDAPI_HOST
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/scorecard/<match_id>')
def get_scorecard(match_id):
    """Get scorecard for a specific match - tries multiple endpoints"""
    try:
        # Try hscard first (high-level scorecard)
        url = f"https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/{match_id}/hscard"
        response = requests.get(url, headers=headers)
        data = response.json()
        
        # If hscard has scoreCard data, return it
        if data and 'scoreCard' in data and len(data.get('scoreCard', [])) > 0:
            return jsonify(data)
        
        # Try scard endpoint (detailed scorecard)
        url2 = f"https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/{match_id}/scard"
        response2 = requests.get(url2, headers=headers)
        data2 = response2.json()
        
        if data2 and 'scoreCard' in data2 and len(data2.get('scoreCard', [])) > 0:
            return jsonify(data2)
            
        # Return original response with debug info
        return jsonify({
            "scoreCard": data.get('scoreCard', []),
            "matchHeader": data.get('matchHeader', {}),
            "debug": "No scorecard data found"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/match/<match_id>/details')
def get_match_details(match_id):
    """Get match details including team squads"""
    try:
        url = f"https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/{match_id}"
        response = requests.get(url, headers=headers)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/matches')
def get_matches():
    """Get current/recent matches"""
    try:
        url = "https://cricbuzz-cricket.p.rapidapi.com/matches/v1/recent"
        response = requests.get(url, headers=headers)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/live')
def get_live_matches():
    """Get live matches"""
    try:
        url = "https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live"
        response = requests.get(url, headers=headers)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/match/<match_id>/commentary')
def get_commentary(match_id):
    """Get match commentary"""
    try:
        url = f"https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/{match_id}/comm"
        response = requests.get(url, headers=headers)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/upcoming')
def get_upcoming_matches():
    """Get upcoming matches"""
    try:
        url = "https://cricbuzz-cricket.p.rapidapi.com/matches/v1/upcoming"
        response = requests.get(url, headers=headers)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/match/<match_id>/info')
def get_match_info(match_id):
    """Get detailed match info including squad"""
    try:
        url = f"https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/{match_id}"
        response = requests.get(url, headers=headers)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
