import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Imports των routers σου (προσαρμοσε τα paths αν διαφέρουν ελάχιστα)
from app.routers import auth, user, transaction, analytics

app = FastAPI(title="MyMoney API")

# 1. Προσθήκη όλων των Routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(transaction.router)
app.include_router(analytics.router)

# 2. Ρύθμιση Static Files & Frontend
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/")
def read_root():
    index_file = STATIC_DIR / "index.html"
    if not index_file.exists():
        raise HTTPException(
            status_code=404, detail=f"index.html not found at {index_file}"
        )
    return FileResponse(path=str(index_file))