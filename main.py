import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(
    title="💡 Capi (Config Archaeology) API",
    description="Self-improving memory layer for your engineering team's config values, powered by Cognee.",
    version="1.0.0"
)

# Enable CORS for frontend dashboard (Next.js local dev on port 3000 / any origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
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
