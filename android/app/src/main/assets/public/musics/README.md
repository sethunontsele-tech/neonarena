# Neon Arena - Game Musics Folder

Welcome to the **Neon Arena Musics Repository**. This directory is dedicated to storing physical background music loops (`.mp3` or `.wav`) for the game.

## How to Add Your Own Music
1. Place any of your audio files (e.g., `battle_music.mp3`, `lobby_theme.wav`) directly into this `/public/musics/` directory.
2. Update the `/public/musics/manifest.json` file in this directory to register your file under the `tracks` array. Set the `fileUrl` parameter to `/musics/your_file.mp3`.
3. Reload the application and open the **Holographic Music Station & Loader**! The engine will automatically detect and stream your tracks.

## Live File Loading Support
Alternatively, you can drag and drop any local `.mp3` file directly into the **Interactive Loader Panel** inside the game to instantly decode and stream it with a real-time holographic canvas visualizer!
