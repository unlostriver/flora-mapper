from ultralytics import YOLO
model = YOLO('runs/detect/train3/weights/last.pt') # e.g., 'best.pt' or 'last.pt'

# Run prediction on a single image
results = model.predict(source='50k/plantnet_50K/images/test/1356022/cc6cefb76f0f740d3e4080a566104598918166dc.jpg',
    save=True,               # Saves annotated images
    save_txt=True,           # Saves labels as .txt (YOLO format)
    save_conf=True,          # Saves confidence scores in labels
    project="results",       # Folder name (default: 'runs/detect/predict')         
    exist_ok=True,           # Overwrite if folder exists
)

result = results[0]

# Show image with both ID and label
for box in result.boxes:
    class_id = int(box.cls)        # Class ID (integer)
    class_name = result.names[class_id]  # Class name (string)
    conf = box.conf.item()         # Confidence score
    print(f"Detected: ID={class_id}, Label='{class_name}', Confidence={conf:.2f}")

# Visualize with modified labels (ID + Name)
result.show(labels=True)  # Default only shows names