import os
import json
import shutil
from tqdm import tqdm

def prepare_yolo_dataset(data_root, json_path, output_dir="yolo_format"):
    """Prepares YOLO format dataset from the given folder structure"""
    
    # Read JSON labels
    with open(json_path, encoding='utf-8') as f:  # Added encoding here too for reading
        label_dict = json.load(f)
    
    # Get unique classes and create mapping
    classes = sorted(list(set(label_dict.values())))
    class_to_id = {cls: idx for idx, cls in enumerate(classes)}
    
    # Create YOLO directory structure
    yolo_dir = os.path.join(data_root, output_dir)
    os.makedirs(yolo_dir, exist_ok=True)
    
    # Create images and labels directories for each split
    for split in ["train", "val"]:
        os.makedirs(os.path.join(yolo_dir, "images", split), exist_ok=True)
        os.makedirs(os.path.join(yolo_dir, "labels", split), exist_ok=True)
    
    # Process each split
    for split in ["train", "val"]:
        split_path = os.path.join(data_root, split)
        
        # Iterate through each plant ID folder
        for plant_id in tqdm(os.listdir(split_path), desc=f"Processing {split}"):
            plant_dir = os.path.join(split_path, plant_id)
            
            if not os.path.isdir(plant_dir):
                continue
                
            # Get the class name from JSON
            if plant_id in label_dict:
                class_name = label_dict[plant_id]
                class_id = class_to_id[class_name]
            else:
                print(f"Warning: Plant ID {plant_id} not found in JSON, skipping")
                continue
                
            # Process each image in the plant folder
            for img_file in os.listdir(plant_dir):
                if not img_file.lower().endswith(('.jpg', '.jpeg', '.png')):
                    continue
                    
                img_id = os.path.splitext(img_file)[0]
                src_path = os.path.join(plant_dir, img_file)
                
                # Copy image to YOLO images folder
                dst_img_path = os.path.join(yolo_dir, "images", split, f"{plant_id}_{img_file}")
                shutil.copy(src_path, dst_img_path)
                
                # Create YOLO annotation file
                yolo_ann = f"{class_id} 0.5 0.5 1.0 1.0"
                ann_file = os.path.join(yolo_dir, "labels", split, f"{plant_id}_{img_id}.txt")
                with open(ann_file, "w", encoding='utf-8') as f:
                    f.write(yolo_ann)
    
    yaml_content = f"""
path: {os.path.abspath(yolo_dir)}
train: images/train
val: images/val

# Number of classes
nc: {len(classes)}

# Class names
names: {classes}
"""
    
    yaml_path = os.path.join(yolo_dir, "dataset.yaml")
    with open(yaml_path, "w", encoding='utf-8') as f:  # This is the key fix
        f.write(yaml_content.strip())
    
    print(f"\nDataset preparation complete! YOLO format dataset saved to: {yaml_path}")
    print(f"Number of classes: {len(classes)}")
    
    return yaml_path, len(classes)

if __name__ == "__main__":

    DATA_ROOT = "50k/plantnet_50K/images"  
    JSON_PATH = "50k/plantnet_50K/50k_plants.json"  
    
    print("Preparing dataset...")
    yaml_path, num_classes = prepare_yolo_dataset(DATA_ROOT, JSON_PATH)
