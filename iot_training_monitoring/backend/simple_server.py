#!/usr/bin/env python3
"""
Simple test server to verify API endpoints work
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from data_processor import DataProcessor
import uvicorn

app = FastAPI(title="Simple IoT Test API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize data processor
data_processor = DataProcessor()

@app.get("/")
async def root():
    return {"message": "Simple IoT Test Server is running!"}

@app.get("/api/overview")
async def get_overview():
    """Get overview statistics"""
    try:
        stats = data_processor.get_overview_stats()
        return stats
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/equipment")
async def get_equipment():
    """Get equipment list"""
    try:
        from database import db
        equipment_df = db.get_equipment()
        return equipment_df.to_dict(orient='records')
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    print("Starting simple test server...")
    uvicorn.run(app, host="127.0.0.1", port=8001)
