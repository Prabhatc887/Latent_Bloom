
import torch
from diffusers import StableDiffusionImg2ImgPipeline
from PIL import Image
import os

# ------------------------------
# Mount Google Drive to save images
# ------------------------------
from google.colab import drive
drive.mount('/content/drive')

# Change this to where you want to save generated images
SAVE_DIR = "/content/drive/MyDrive/spherical_diffusion/stages"
os.makedirs(SAVE_DIR, exist_ok=True)

# ------------------------------
# Plant growth stages
# ------------------------------
STAGES = [
    "tomato plant seedling stage, 1-2 true leaves, very small, delicate stem",
    "tomato plant early seedling stage, 2-3 true leaves, slightly thicker stem",
    "young tomato plant vegetative stage, 4-5 leaves, stem growing taller",
    "developing tomato plant vegetative stage, 6-7 leaves, small lateral branches",
    "mature tomato plant vegetative stage, dense green foliage, strong stem",
    "tomato plant early flowering stage, few yellow flowers appearing",
    "tomato plant flowering stage, multiple yellow flowers, detailed leaves",
    "tomato plant fruiting stage, green to red tomatoes visible, healthy dense foliage"
]


BASE_PROMPT = (
    "high-resolution realistic photograph of the same tomato plant, detailed leaves and stems, natural outdoor farm environment, sunlight and shadows, realistic texture, same camera angle, same field"
 ", natural growth progression, outdoor lighting"
    "same field, natural growth progression, outdoor lighting"
)

NEGATIVE_PROMPT = (
    "mutation, extra leaves, extra stems, deformed, unrealistic, "
    "cartoon, illustration, blurry, duplicated plant"
)

# ------------------------------
# Device selection: GPU if available
# ------------------------------
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

# ------------------------------
# Load pipeline
# ------------------------------
pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    safety_checker=None,
    torch_dtype=torch.float16 if device == "cuda" else torch.float32
)
pipe.to(device)
pipe.enable_attention_slicing()  # Optional: reduces VRAM slightly

# ------------------------------
# Load initial image
# ------------------------------
# Upload your initial image to Colab or place it in Drive
INIT_IMAGE_PATH = "/content/tomato.png"
if not os.path.exists(INIT_IMAGE_PATH):
    raise FileNotFoundError(f"Initial image not found at {INIT_IMAGE_PATH}")

init_image = Image.open(INIT_IMAGE_PATH).convert("RGB").resize((512, 512))

# ------------------------------
# Image generation
# ------------------------------
stage_images = []
generator = torch.Generator(device=device).manual_seed(42)
stage_strengths = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]

for stage, strength in zip(STAGES, stage_strengths):
    prompt = f"{BASE_PROMPT}, {stage}"
    print(f"Generating stage: {stage} with strength {strength}...")

    with torch.no_grad():
        result = pipe(
            prompt=prompt,
            negative_prompt=NEGATIVE_PROMPT,
            image=init_image,
            strength=strength,
            guidance_scale=7.5,
            num_inference_steps=30,
            generator=generator
        ).images[0]

    stage_images.append(result)

# ------------------------------
# Save results to Google Drive
# ------------------------------
for i, img in enumerate(stage_images):
    save_path = os.path.join(SAVE_DIR, f"stage_{i}.png")
    img.save(save_path)
    print(f"Saved: {save_path}")

print("Saved biologically aligned stage images successfully!")
