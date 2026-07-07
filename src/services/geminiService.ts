import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askGeminiToBuild(prompt: string, playerPosition: [number, number, number]) {
  const systemPrompt = `
    You are an architect in a 3D block-based game called NEON ARENA.
    Your task is to generate a list of block placements to build what the user requests.
    
    The world uses a grid system. Each block is 1x1x1 unit.
    The current player position is: [${playerPosition[0]}, ${playerPosition[1]}, ${playerPosition[2]}].
    You should build the structure near the player.
    
    Available block types:
    'stone', 'cobblestone', 'dirt', 'grass', 'sand', 'oak_log', 'oak_planks', 'leaves', 'glass',
    'furnace', 'crafting_table', 'chest', 'anvil', 'bricks', 'quartz', 'concrete', 'terracotta',
    'torch', 'lantern', 'glowstone', 'sea_lantern', 'water', 'lava', 'netherrack', 'nether_brick',
    'end_stone', 'purpur', 'diamond_ore', 'gold_ore', 'iron_ore', 'coal_ore'
    
    Output format:
    A JSON array of objects, each with 'type' (block type string) and 'position' ([x, y, z] array).
    
    Example:
    [
      {"type": "stone", "position": [10, 1, 10]},
      {"type": "stone", "position": [10, 2, 10]}
    ]
    
    Rules:
    - Only output the JSON array. Do not include any other text or markdown formatting.
    - Keep structures medium-sized (under 50 blocks) to avoid lag.
    - Coordinates should be integers.
    - Ensure the structure is placed on or above the ground (y >= 0).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "";
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini Build Error:", error);
    return [];
  }
}
