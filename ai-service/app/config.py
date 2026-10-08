import os

AI_SERVICE_SECRET = os.getenv("AI_SERVICE_SECRET", "dev-secret-key-change-in-prod-ai-ops-2026")
PORT = int(os.getenv("PORT", "8000"))
