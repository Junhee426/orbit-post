from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
app=FastAPI(title="Orbit Post Alpha")
@app.middleware("http")
async def headers(request,call_next):
    # index.html loads /game.js and /style.css without version tags, so browsers revalidate (a cheap 304) instead of mixing old and new files after a deploy.
    response=await call_next(request)
    response.headers.setdefault("Cache-Control","no-cache")
    response.headers.setdefault("X-Content-Type-Options","nosniff")
    return response
@app.get("/healthz",include_in_schema=False)
def healthz():return {"status":"ok"}
app.mount("/",StaticFiles(directory=Path(__file__).parent/"static",html=True),name="static")
