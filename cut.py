import os
import json
import shutil


json_path = '50k/plantnet_50K/50k_plants.json' 
with open(json_path, 'r') as f:
    plant_data = json.load(f)


original_image_folder = '50k\plantnet_50K\images'
subset_image_folder = 'FIXED/plantnet_50K_subset/images'


os.makedirs(subset_image_folder, exist_ok=True)


class_ids = {int(plant_id): idx for idx, plant_id in enumerate(plant_data.keys())}


if not os.path.exists(original_image_folder):
    print(f"Error: The original image folder '{original_image_folder}' does not exist.")
    exit()


for root, dirs, files in os.walk(original_image_folder):
    for file in files:
        if file.endswith(('.jpg', '.png')):  
      
            plant_id = os.path.basename(root)  
            if plant_id in class_ids:
             
                relative_path = os.path.relpath(root, original_image_folder)
                new_image_path = os.path.join(subset_image_folder, relative_path, file)
                os.makedirs(os.path.dirname(new_image_path), exist_ok=True)
                shutil.copy(os.path.join(root, file), new_image_path)
                print(f"Copied {file} to {new_image_path}")  


                label_file_path = new_image_path.replace('.jpg', '.txt').replace('.png', '.txt')
                with open(label_file_path, 'w') as label_file:
                    # Dummy bounding box values assuming full image bounding box
                    x_center = 0.5  # Centered
                    y_center = 0.5  # Centered
                    width = 1.0  # Full width
                    height = 1.0  # Full height
                    class_id = class_ids[int(plant_id)] 
                    label_file.write(f"{class_id} {x_center} {y_center} {width} {height}\n")
                    print(f"Created label file for {file} at {label_file_path}")  

print("Processing completed. All images and labels should now be copied.")
