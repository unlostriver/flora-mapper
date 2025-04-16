# listen i'm not proud of this the slightest but i'm running out of time and i need to scrap together something that
# works. i will come back to this and do it properly. trust

from fastapi import FastAPI, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
from glob import glob
from PIL import Image
from plantnet.utils import load_model
from torchvision.models import resnet50
import torchvision.transforms as transforms
import numpy as np
import torch
import shutil
import json


app = FastAPI()
model = resnet50(num_classes=1081)
load_model(model, filename="resnet50_weights_best_acc.tar", use_gpu=False)
model.eval()
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])
with open("species.json") as f:
    species = json.load(f)
    species = list(species.values())


@app.middleware("http")
async def check_api_key(req, next):
    if req.method != "GET" and req.headers.get("x-api-key") != "PhZGgqvAc0YWn663b7QNCVITFATo33DULGpMZWUeWBK56OfC19T":
        return JSONResponse({}, status_code=401)
    return await next(req)


@app.post("/classify")
def classify(image: UploadFile):
    image = Image.open(image.file).convert("RGB")
    tensor = preprocess(image)
    batch = tensor.unsqueeze(0)
    with torch.no_grad():
        output = model(batch)[0]
        class_ = np.argmax(output)
    return {"species": species[class_]}


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

