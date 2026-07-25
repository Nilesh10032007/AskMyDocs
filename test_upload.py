import requests

url = "http://localhost:8000/api/upload"
file_path = "test_doc.txt"

# Create a dummy text file
with open(file_path, "w") as f:
    f.write("This is a test document for DocuMind AI. It contains important information about nothing.")

with open(file_path, "rb") as f:
    files = {"file": (file_path, f, "text/plain")}
    try:
        response = requests.post(url, files=files)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
