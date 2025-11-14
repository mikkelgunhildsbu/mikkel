import requests
import json
import os
from datetime import datetime

def get_leaderboard():
    url = "https://timeguessr.com/getFriendshipLeaderboard"
    
    cookie_string = "_ga=GA1.1.145678433.1762965429; connect.sid=s%3AKWVUWapLSHiCoqb8d8oJpgAV4kDPcZLl.lh0%2B8ZetmcRAnhC9RqNoADBy2FbYZLhhwePAT3B30Sc; hasSeenAppAd=true; usprivacy=1---;"
    
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
    timestamp = datetime.now().strftime("%d-%m-%Y-%W") 

    list_of_entries = []
    
    for idx, entry in enumerate(data.get("friendData", []), start=1):
        entry["date"] = timestamp
        entry["username"] = entry.get("username", "")
        entry["score"] = entry.get("score", 0)
        entry["rank"] = idx
        entry["day_num"] = int(timestamp.split("-")[0])
        entry["week_num"] = int(timestamp.split("-")[3])
        entry["month_num"] = datetime.now().month
        entry["year_num"] = int(timestamp.split("-")[2])
        list_of_entries.append(entry)
    
    print(list_of_entries)
    
    return list_of_entries




if __name__ == "__main__":
    data = get_leaderboard()
    processed_data = data_processiong(data)