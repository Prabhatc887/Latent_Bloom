import torch
import gc
from diffusers import AutoencoderKL
from PIL import Image
from torchvision import transforms
import matplotlib.pyplot as plt
import numpy as np

device = "cuda" if torch.cuda.is_available() else "cpu"
print("Using device:", device)



vae = AutoencoderKL.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    subfolder="vae",
    torch_dtype=torch.float16 if device == "cuda" else torch.float32
).to(device)

vae.eval()



def preprocess(image_path):
    image = Image.open(image_path).convert("RGB").resize((512, 512))
    tensor = transforms.ToTensor()(image)
    tensor = tensor.unsqueeze(0) * 2 - 1   # scale to [-1, 1]
    return tensor.to(device=device, dtype=torch.float16)

images = [
    "/content/baby1.png",
    "/content/baby2.png",
    "/content/baby3.png",
    "/content/baby4.png",
    "/content/child5.png",
    "/content/child6.png",
]

preprocessed_images = [preprocess(img) for img in images]



with torch.no_grad():
    latents = [
        0.18215 * vae.encode(img).latent_dist.sample()
        for img in preprocessed_images
    ]



def interpolate_latents(z1, z2, num_frames=24):
    return [
        (1 - t) * z1 + t * z2
        for t in torch.linspace(0, 1, num_frames, device=device)
    ]

all_interpolated_latents = []
for i in range(len(latents) - 1):
    all_interpolated_latents.extend(
        interpolate_latents(latents[i], latents[i + 1], num_frames=24)
    )


frames = []

with torch.no_grad():
    for idx, latent in enumerate(all_interpolated_latents):
        image = vae.decode(latent / 0.18215).sample
        image = (image / 2 + 0.5).clamp(0, 1)

        frame = image.permute(0, 2, 3, 1).cpu().numpy()[0]
        frames.append(frame)

        # cleanup
        del image, latent
        torch.cuda.empty_cache()
        gc.collect()


        plt.figure(figsize=(10, 10))
        plt.imshow(frame.astype(np.float32))
        plt.axis("off")
        plt.title(f"Frame {idx}")
        plt.show()


