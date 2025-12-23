from fastapi import FastAPI, File, UploadFile
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
from PIL import Image
import io
import base64

app = FastAPI()

model = YOLO("best2.pt")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data))


    results = model(image)

    detections = []
    for box in results[0].boxes:
        conf = float(box.conf[0])
        if conf < 0.5: continue
        
        cls_id = int(box.cls[0])
        label = model.names[cls_id].lower()
        
        detections.append({
            "label": label.capitalize(),
            "score": f"{conf*100:.1f}%",
            "type": label
        })

    res_plotted = results[0].plot()[:, :, ::-1]
    res_image = Image.fromarray(res_plotted)
    
    buffered = io.BytesIO()
    res_image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

    return {
        "image": f"data:image/jpeg;base64,{img_str}",
        "data": detections
    }

app.mount("/", StaticFiles(directory="static", html=True), name="static")