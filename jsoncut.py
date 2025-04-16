import json
import os

# Load the original JSON file (mapping plant species IDs to names)
json_path = 'datasets\plantnet_300K\plantnet300K_species_id_2_name.json'
with open(json_path, 'r', encoding='utf-8') as f:
    original_json = json.load(f)

# Define the folder where the 50k images are stored
subset_image_folder = '50k\plantnet_50K\images'

# List all the images in the 50k subset folder
subset_images = []
for root, dirs, files in os.walk(subset_image_folder):
    for file in files:
        if file.endswith(('.jpg', '.png')):  # Only image files
            image_path = os.path.join(root, file)
            # Get the plant ID from the image name or folder structure
            plant_id = image_path.split(os.sep)[-2]  # Assuming folder name is the plant ID
            subset_images.append(plant_id)

# Filter the original JSON to include only the selected 50k images
filtered_json = {plant_id: name for plant_id, name in original_json.items() if plant_id in subset_images}

# Save the filtered JSON for the 50k images
filtered_json_path = '50k/plantnet_50K/50k_plants.json'
with open(filtered_json_path, 'w', encoding='utf-8') as f:
    json.dump(filtered_json, f, ensure_ascii=False, indent=4)

print(f"Filtered JSON for 50k images has been saved to: {filtered_json_path}")
