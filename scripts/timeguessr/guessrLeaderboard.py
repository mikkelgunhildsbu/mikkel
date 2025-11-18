from curses import window
import requests
import json
import os
from datetime import datetime

def get_leaderboard():
    url = "https://timeguessr.com/getFriendshipLeaderboard"

    cookie_string = os.environ.get('TIMEGUESSR_COOKIE', '')

    headers = {
        'Cookie': cookie_string,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Referer': 'https://timeguessr.com/',
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        return data
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching leaderboard: {e}")
        return None
    
"""
from this 
{'friendData': [{'score': 45871, 'username': 'sennis'}, {'score': 39928, 'username': 'eiop'}, {'score': 34476, 'username': 'mikkelg'}]}
to this:

{
  "date": "12.11.2025.45",
  "username": "mikkelg",
  "score": 39928,
  "rank": 2,
  "day_num": "12",
  "week_num": 45,
  "month_num": 11
  "year_num": 2025
}
 
"""
def data_processiong(data):
    timestamp = datetime.now().strftime("%Y-%m-%d") 

    list_of_entries = []
    
    for idx, entry in enumerate(data.get("friendData", []), start=1):
        entry["date"] = timestamp
        entry["username"] = entry.get("username", "")
        entry["score"] = entry.get("score", 0)
        entry["rank"] = idx
        entry["week_num"] = int(datetime.now().strftime("%W")) + 1
        list_of_entries.append(entry)
    
    return list_of_entries
    print(list_of_entries)
    
#    const { date, username, score, rank, week_num} = req.body;

API_URL = os.environ.get('API_URL', 'http://localhost:8080/api/submit-score')
def add_to_db(list_of_entries):
    for entry in list_of_entries:
        try:
            response = requests.post(API_URL, json=entry)
            response.raise_for_status()
            print(f"Successfully added entry for {entry['username']}")
        except requests.exceptions.RequestException as e:
            print(f"Error adding entry for {entry['username']}: {e}")

if __name__ == "__main__":
    data = get_leaderboard()
    processed_data = data_processiong(data)
    print(processed_data)
    add_to_db(processed_data)