from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router
from services.mock_loader import load_mock_data
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Config Archaeology API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    # Make sure we load the mock data on startup if it hasn't been loaded
    print("Starting up Config Archaeology backend...")
    # NOTE: In a real app we'd conditionally load this
    try:
        await load_mock_data()
    except Exception as e:
        print(f"Error loading mock data: {e}")

@app.get("/")
def root():
    return {"message": "Welcome to Config Archaeology API"}
