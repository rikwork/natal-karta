import g4f

print("Testing g4f generation...")
try:
    response = g4f.ChatCompletion.create(
        model=g4f.models.default,
        messages=[{"role": "user", "content": "Hello! Say exactly: 'GPT4Free is working'"}]
    )
    print(f"Response: {response}")
except Exception as e:
    print(f"Error: {e}")
