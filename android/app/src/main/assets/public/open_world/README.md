# Zenith Custom Open World Asset Folder

Place your own 3D assets in this folder to load them as the custom game world!

## Supported Files
1. **`open_world.obj`** (Required) - The main 3D mesh file.
2. **`open_world.mtl`** (Optional) - The material mapping file.
3. **`.blend` files / texture images** (Optional) - You can store your source `.blend` files or custom texture map assets here.

## How It Works
When you select the **"OPEN WORLD"** map in the Battle Config menu:
- The game will dynamically load `/open_world/open_world.obj` and its corresponding `/open_world/open_world.mtl` file.
- Colliders will be automatically calculated on the mesh so your character can run, jump, and traverse your custom-designed terrain!
- If the folder is empty or files are missing, the game will present a helpful instruction panel inside the game space.
