import requests
import json

# Test data
test_data = {
    "Region": 1,
    "State": 2, 
    "Crop": 3,
    "Month_Num": 6,
    "Avg_Temp": 25,
    "Total_Rainfall": 100,
    "Flood_Risk": 0.2,
    "In_Sowing_Window": 1
}

try:
    # Make POST request to the Flask API
    response = requests.post(
        'http://127.0.0.1:5000/predict',
        json=test_data,
        headers={'Content-Type': 'application/json'}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Prediction: {result}")
    else:
        print(f"Error: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("Error: Could not connect to the Flask server. Make sure it's running on http://127.0.0.1:5000")
except Exception as e:
    print(f"Error: {e}")
