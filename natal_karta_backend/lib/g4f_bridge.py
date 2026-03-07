import sys
import json
import g4f

def generate_completion(prompt):
    providers = [
        g4f.Provider.AIBadgr,
        g4f.Provider.BlackboxPro,
        g4f.Provider.GeminiPro,
        g4f.Provider.DeepSeek
    ]
    
    for provider in providers:
        try:
            # print(f"Trying provider: {provider.__name__}", file=sys.stderr)
            response = g4f.ChatCompletion.create(
                model=g4f.models.default,
                provider=provider,
                messages=[{"role": "user", "content": prompt}],
                timeout=60
            )
            if response:
                print(json.dumps({"success": True, "data": response}))
                return
        except Exception as e:
            # print(f"Provider {provider.__name__} failed: {str(e)}", file=sys.stderr)
            continue
            
    # Fallback to default if all specific providers fail
    try:
        response = g4f.ChatCompletion.create(
            model=g4f.models.default,
            messages=[{"role": "user", "content": prompt}],
            timeout=120
        )
        print(json.dumps({"success": True, "data": response}))
    except Exception as e:
        print(json.dumps({"success": False, "error": f"All providers failed. Last error: {str(e)}"}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        generate_completion(sys.argv[1])
    else:
        print(json.dumps({"success": False, "error": "No prompt provided"}))
