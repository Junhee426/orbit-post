from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
app=FastAPI(title="Orbit Post Alpha")
@app.get("/healthz",include_in_schema=False)
def healthz():return {"status":"ok"}
app.mount("/",StaticFiles(directory=Path(__file__).parent/"static",html=True),name="static")
