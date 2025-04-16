# listen i'm not proud of this the slightest but i'm running out of time and i need to scrap together something that
# works. i will come back to this and do it properly. trust

from fastapi import FastAPI, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
from glob import glob
import shutil


app = FastAPI()


@app.middleware("http")
async def check_api_key(req, next):
    if req.headers.get("x-api-key") != "PhZGgqvAc0YWn663b7QNCVITFATo33DULGpMZWUeWBK56OfC19T":
        return JSONResponse({}, status_code=401)
    return await next(req)


@app.post("/classify")
def classify():
    return {"species": ""}


@app.get("/image/{submission_id}")
def image(submission_id):
    matches = glob(f"images/{submission_id}.*")
    return FileResponse(matches[0])


@app.put("/image/{submission_id}")
def submit_image(submission_id, image: UploadFile):
    path = Path("images")
    path.mkdir(exist_ok=True)
    file_type = image.content_type.split("/")[1]
    file_name = f"{submission_id}.{file_type}"
    with (path / file_name).open("wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    return {}

