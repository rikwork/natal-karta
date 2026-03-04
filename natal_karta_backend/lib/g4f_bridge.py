import sys
import json
import g4f

def generate_completion(prompt):
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = g4f.ChatCompletion.create(
                model=g4f.models.default,
                messages=[{"role": "user", "content": prompt}],
                timeout=180
            )
            print(json.dumps({"success": True, "data": response}))
            return
        except Exception as e:
            if attempt == max_retries - 1:
                print(json.dumps({"success": False, "error": f"Failed after {max_retries} attempts. Last error: {str(e)}"}))
            import time
            time.sleep(2)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        generate_completion(sys.argv[1])
    else:
        print(json.dumps({"success": False, "error": "No prompt provided"}))
