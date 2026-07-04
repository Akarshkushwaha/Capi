import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(
    title="💡 Capi (Config Archaeology) API",
    description="Self-improving memory layer for your engineering team's config values, powered by Cognee.",
    version="1.0.0"
)

# Secure CORS Configuration (Prevents OWASP CORS wildcard credential exposure)
import os
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
if allowed_origins_env == "*":
    origins = ["*"]
    allow_creds = False
else:
    origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
    allow_creds = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_creds,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/health")
async def root_health():
    return {"status": "ok", "app": "Capi Config Archaeology"}

if __name__ == "__main__":
    import os
    port = int(os.getenv("PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
