import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from '../eduStore';
import { Html } from '@react-three/drei';
import { 
  Monitor, Globe, Film, Music, Mic, Tv, Video, Phone, MessageSquare, 
  Users, Keyboard, Edit, StickyNote, Calendar, Clock, Cloud, Calculator, 
  Folder, Image, VideoOff, Play, Users2, Library, BookOpen, GraduationCap, 
  Clipboard, HelpCircle, FileText, Languages, Percent, FlaskConical, Atom, 
  Dna, Rocket, Compass, Eye, Heart, Database, Code, Info, 
  Trash2, Plus, Move, Search, Sliders, CheckCircle, Flame, Grid, Map,
  Sparkles, Layers, RefreshCw, Cpu, Activity, Coffee, Layout
} from 'lucide-react';

// Define the structure of a VR App
interface VRApp {
  id: string;
  name: string;
  category: 'productivity' | 'entertainment' | 'education' | 'science' | 'creativity' | 'health' | 'simulation' | 'social';
  description: string;
  icon: any;
  spawnType: string;
}

// 100 Apps mapped with their corresponding icons and properties
const ALL_100_APPS: VRApp[] = [
  // 1. Productivity & Utilities (12)
  { id: 'virtual_desktop', name: 'Virtual Desktop', category: 'productivity', description: 'Stream and operate your physical PC desktop inside your VR workspace.', icon: Monitor, spawnType: 'desktop' },
  { id: 'web_browser', name: 'Web Browser', category: 'productivity', description: 'Explore websites and browse the web using spatial windows.', icon: Globe, spawnType: 'browser' },
  { id: 'virtual_keyboard', name: 'Virtual Keyboard', category: 'productivity', description: 'Type with precision using a floating, responsive holographic keyboard.', icon: Keyboard, spawnType: 'keyboard' },
  { id: 'file_manager', name: 'File Manager', category: 'productivity', description: 'Organize, copy, and browse files with an interactive 3D directory tree.', icon: Folder, spawnType: 'file' },
  { id: 'screen_sharing', name: 'Screen Sharing', category: 'productivity', description: 'Broadcast your local screens or active viewports to virtual spaces.', icon: Monitor, spawnType: 'sharing' },
  { id: 'smart_home_controls', name: 'Smart Home Controls', category: 'productivity', description: 'Integrate and toggle IoT devices, lights, and thermostats.', icon: Tv, spawnType: 'smart_home' },
  { id: 'room_scanner', name: 'Room Scanner', category: 'productivity', description: 'Analyze walls and obstacles to generate mixed reality spatial maps.', icon: Eye, spawnType: 'room_scanner' },
  { id: 'hologram_projector', name: 'Hologram Projector', category: 'productivity', description: 'Beam out beautiful, rotating 3D asset previews.', icon: Sparkles, spawnType: 'hologram' },
  { id: 'ai_assistant', name: 'AI Assistant', category: 'productivity', description: 'Interact with a helpful, friendly floating robotic companion.', icon: Cpu, spawnType: 'ai_assistant' },
  { id: 'news_center', name: 'News Center', category: 'productivity', description: 'Stay up to date with live RSS feeds and breaking global headlines.', icon: FileText, spawnType: 'news' },
  { id: 'finance_dashboard', name: 'Finance Dashboard', category: 'productivity', description: 'Track stocks, crypto assets, and budget trends on visual tickers.', icon: Folder, spawnType: 'finance' },
  { id: 'currency_converter', name: 'Currency Converter', category: 'productivity', description: 'Calculate exchange rates for over 150 legal and digital tender types.', icon: RefreshCw, spawnType: 'currency' },

  // 2. Entertainment & Media (10)
  { id: 'movie_theater', name: 'Movie Theater', category: 'entertainment', description: 'Rent a curved theater screen to watch local or server files.', icon: Film, spawnType: 'cinema' },
  { id: 'youtube_viewer', name: 'YouTube Viewer', category: 'entertainment', description: 'Stream YouTube playlists and tutorials on a massive screen.', icon: Play, spawnType: 'youtube' },
  { id: 'music_player', name: 'Music Player', category: 'entertainment', description: 'Listen to dynamic spatial soundtracks with visualizers.', icon: Music, spawnType: 'music' },
  { id: 'podcast_player', name: 'Podcast Player', category: 'entertainment', description: 'Browse and play localized episodic feeds with sleep timers.', icon: Mic, spawnType: 'podcast' },
  { id: 'live_tv', name: 'Live TV', category: 'entertainment', description: 'Watch satellite network television streams in 3D.', icon: Tv, spawnType: 'tv' },
  { id: 'gallery', name: 'Gallery', category: 'entertainment', description: 'Walk through an exhibition of fine photos and spatial screenshots.', icon: Image, spawnType: 'gallery' },
  { id: 'photo_viewer', name: 'Photo Viewer', category: 'entertainment', description: 'Scale, rotate, and examine high-resolution photographs.', icon: Image, spawnType: 'photo' },
  { id: 'video_recorder', name: 'Video Recorder', category: 'entertainment', description: 'Record, save, and export high-definition MP4 clips of your room.', icon: Video, spawnType: 'recorder' },
  { id: 'virtual_cafe', name: 'Virtual Café', category: 'entertainment', description: 'A quiet background lounge with lo-fi tracks and steam effects.', icon: Coffee, spawnType: 'cafe' },
  { id: 'social_lounge', name: 'Social Lounge', category: 'entertainment', description: 'Connect, relax, and queue tracks with visitors in VR.', icon: Users, spawnType: 'social_lounge' },

  // 3. Education & Learning (11)
  { id: 'virtual_classroom', name: 'Virtual Classroom', category: 'education', description: 'Connect with a live teacher or join virtual study modules.', icon: GraduationCap, spawnType: 'classroom' },
  { id: 'homework_center', name: 'Homework Center', category: 'education', description: 'Review assignments, inspect corrections, and earn XP.', icon: Clipboard, spawnType: 'homework' },
  { id: 'quiz_system', name: 'Quiz System', category: 'education', description: 'Challenge yourself with adaptive multiple-choice quizzes.', icon: HelpCircle, spawnType: 'quiz' },
  { id: 'flashcards', name: 'Flashcards', category: 'education', description: 'Study terminology and master technical concepts quickly.', icon: Layers, spawnType: 'flashcards' },
  { id: 'library', name: 'Library', category: 'education', description: 'Access a massive archive of digital and spatial textbooks.', icon: Library, spawnType: 'library' },
  { id: 'audiobooks', name: 'Audiobooks', category: 'education', description: 'Listen to narrated classics and voice-overs.', icon: BookOpen, spawnType: 'audiobook' },
  { id: 'language_learning', name: 'Language Learning', category: 'education', description: 'Learn phonetic structures with conversational guides.', icon: Languages, spawnType: 'language' },
  { id: 'math_tutor', name: 'Math Tutor', category: 'education', description: 'Interact with geometric vectors and solve dynamic algebraic models.', icon: Percent, spawnType: 'math_tutor' },
  { id: 'science_lab', name: 'Science Lab', category: 'education', description: 'Explore various elements and launch standard physics simulations.', icon: FlaskConical, spawnType: 'science_lab' },
  { id: 'chemistry_lab_app', name: 'Chemistry Lab', category: 'education', description: 'Safely combine simulated compound elements to view reactions.', icon: Atom, spawnType: 'chemistry_lab' },
  { id: 'physics_lab_app', name: 'Physics Lab', category: 'education', description: 'Test friction coefficients, mass impacts, and gravity vectors.', icon: Compass, spawnType: 'physics_lab' },

  // 4. Anatomy & Sciences (11)
  { id: 'anatomy_explorer_app', name: 'Anatomy Explorer', category: 'science', description: 'Dissect high-fidelity human organs to study physiology.', icon: Heart, spawnType: 'anatomy' },
  { id: 'skeleton_viewer', name: 'Skeleton Viewer', category: 'science', description: 'Examine human skeletal structures and label major bones.', icon: Info, spawnType: 'skeleton' },
  { id: 'dna_explorer_app', name: 'DNA Explorer', category: 'science', description: 'Inspect the organic double helix code of genetic material.', icon: Dna, spawnType: 'dna' },
  { id: 'space_museum_app', name: 'Space Museum', category: 'science', description: 'Browse historical rockets and space shuttle scale models.', icon: Rocket, spawnType: 'space_museum' },
  { id: 'planetarium_app', name: 'Planetarium', category: 'science', description: 'Project stellar objects, solar events, and gas giants.', icon: Globe, spawnType: 'planetarium' },
  { id: 'star_map_app', name: 'Star Map', category: 'science', description: 'Explore the night sky with constellation lines.', icon: Sparkles, spawnType: 'star_map' },
  { id: 'earth_explorer_app', name: 'Earth Explorer', category: 'science', description: 'Spin and search the terrestrial globe to study terrain data.', icon: Globe, spawnType: 'earth' },
  { id: 'world_map_app', name: 'World Map', category: 'science', description: 'Review geographical borders and learn key national statistics.', icon: Map, spawnType: 'world_map' },
  { id: 'history_museum_app', name: 'History Museum', category: 'science', description: 'Examine simulated relics from Egypt and ancient eras.', icon: Library, spawnType: 'history_museum' },
  { id: 'art_gallery_app', name: 'Art Gallery', category: 'science', description: 'Review classic paintings, modern oil artworks, and sculptures.', icon: Image, spawnType: 'art_gallery' },
  { id: 'experience_hub_app', name: 'Experience Hub', category: 'science', description: 'The master terminal to launch specialized portals.', icon: Layers, spawnType: 'experience_hub' },

  // 5. Creative & Music Studios (10)
  { id: 'music_studio_app', name: 'Music Studio', category: 'creativity', description: 'Compose melodies using an interactive multi-track grid.', icon: Music, spawnType: 'music_studio' },
  { id: 'piano_lessons_app', name: 'Piano Lessons', category: 'creativity', description: 'Learn major chords and scale patterns on a mini 3D keyframe.', icon: Keyboard, spawnType: 'piano' },
  { id: 'guitar_lessons', name: 'Guitar Lessons', category: 'creativity', description: 'Examine virtual fretboards and tap out major guitar chords.', icon: Mic, spawnType: 'guitar' },
  { id: 'drum_studio', name: 'Drum Studio', category: 'creativity', description: 'Tap cylinders, cymbals, and kicks in stereo space.', icon: Tv, spawnType: 'drums' },
  { id: 'dj_booth', name: 'DJ Booth', category: 'creativity', description: 'Mix custom wave files with scratch turntables and crossfaders.', icon: Music, spawnType: 'dj' },
  { id: 'dance_studio', name: 'Dance Studio', category: 'creativity', description: 'Learn rhythm, step tempos, and choreography.', icon: Users, spawnType: 'dance' },
  { id: 'model_viewer_3d', name: '3D Model Viewer', category: 'creativity', description: 'Load, scale, and inspect three-dimensional file assets.', icon: Layers, spawnType: 'model_3d' },
  { id: 'sculpting_3d', name: '3D Sculpting', category: 'creativity', description: 'Deform, smooth, and extrude dynamic mesh spheres.', icon: Database, spawnType: 'sculpting' },
  { id: 'painting_3d', name: '3D Painting', category: 'creativity', description: 'Draw colorful spline curves directly in spatial void air.', icon: Edit, spawnType: 'painting' },
  { id: 'animation_studio', name: 'Animation Studio', category: 'creativity', description: 'Keyframe rotation and translation positions for simple characters.', icon: Film, spawnType: 'animation' },

  // 6. Health & Fitness (11)
  { id: 'meditation_room_app', name: 'Meditation Room', category: 'health', description: 'Calm your focus with dynamic breathing guide cycles and rocks.', icon: Heart, spawnType: 'meditation' },
  { id: 'yoga_studio_app', name: 'Yoga Studio', category: 'health', description: 'Review poses, align posture, and follow timers.', icon: Monitor, spawnType: 'yoga' },
  { id: 'boxing_trainer', name: 'Boxing Trainer', category: 'health', description: 'Fist-punch targets in rhythm with sound waves.', icon: Flame, spawnType: 'boxing' },
  { id: 'cardio_workouts', name: 'Cardio Workouts', category: 'health', description: 'Maintain physical endurance with high-tempo steps.', icon: Activity, spawnType: 'cardio' },
  { id: 'strength_training', name: 'Strength Training', category: 'health', description: 'Visualize major muscle contractions and training weights.', icon: Sliders, spawnType: 'strength' },
  { id: 'stretch_guide', name: 'Stretch Guide', category: 'health', description: 'Elongate ligaments and maintain general flexibility.', icon: Compass, spawnType: 'stretch' },
  { id: 'running_tracker', name: 'Running Tracker', category: 'health', description: 'Set target pacing and log virtual distances.', icon: Play, spawnType: 'running' },
  { id: 'step_counter', name: 'Step Counter', category: 'health', description: 'Review accumulated step metrics and burn rates.', icon: Activity, spawnType: 'step' },
  { id: 'health_dashboard_app', name: 'Health Dashboard', category: 'health', description: 'Monitor heart rate trends, water balance, and caloric logs.', icon: Heart, spawnType: 'health' },
  { id: 'sleep_room_app', name: 'Sleep Room', category: 'health', description: 'Calming lo-fi beats and rain visuals to prepare for deep sleep.', icon: Tv, spawnType: 'sleep' },
  { id: 'breathing_coach_app', name: 'Breathing Coach', category: 'health', description: 'Expand and contract your lungs in sync with expanding circles.', icon: Sparkles, spawnType: 'breathing' },

  // 7. Simulation & Exploration (16)
  { id: 'pet_simulator', name: 'Pet Simulator', category: 'simulation', description: 'Feed, play with, and care for a playful virtual puppy.', icon: Heart, spawnType: 'pet' },
  { id: 'aquarium_app', name: 'Aquarium', category: 'simulation', description: 'Construct visual fish tanks and observe aquatic life.', icon: Compass, spawnType: 'aquarium' },
  { id: 'bird_sanctuary', name: 'Bird Sanctuary', category: 'simulation', description: 'Examine detailed tropical bird species flying in void space.', icon: Sparkles, spawnType: 'bird' },
  { id: 'virtual_zoo', name: 'Virtual Zoo', category: 'simulation', description: 'Scale-down and analyze virtual safaris and animals.', icon: Users2, spawnType: 'zoo' },
  { id: 'dinosaur_park_app', name: 'Dinosaur Park', category: 'simulation', description: 'Learn about Jurassic species with dynamic bone replicas.', icon: Flame, spawnType: 'dinosaur' },
  { id: 'nature_trails', name: 'Nature Trails', category: 'simulation', description: 'Explore dense virtual pine trees and relax near rocks.', icon: Map, spawnType: 'nature' },
  { id: 'mountain_hiking', name: 'Mountain Hiking', category: 'simulation', description: 'Navigate paths and scale rocky summits.', icon: Compass, spawnType: 'mountain' },
  { id: 'ocean_explorer_app', name: 'Ocean Explorer', category: 'simulation', description: 'Dive below the surface to view sea corals and creatures.', icon: Compass, spawnType: 'ocean' },
  { id: 'space_station_app', name: 'Space Station', category: 'simulation', description: 'Examine the intricate modules of orbital research vessels.', icon: Rocket, spawnType: 'space_station' },
  { id: 'spaceship_cockpit_app', name: 'Spaceship Cockpit', category: 'simulation', description: 'Grasp navigation levers, flight vectors, and target markers.', icon: Compass, spawnType: 'spaceship' },
  { id: 'rocket_simulator', name: 'Rocket Simulator', category: 'simulation', description: 'Simulate high-altitude propulsion boosters.', icon: Rocket, spawnType: 'rocket' },
  { id: 'planet_creator_app', name: 'Planet Creator', category: 'simulation', description: 'Combine gasses and mass sizes to construct stable planets.', icon: Globe, spawnType: 'planet_creator' },
  { id: 'weather_simulator', name: 'Weather Simulator', category: 'simulation', description: 'Summon interactive clouds, dynamic rain, or snow.', icon: Cloud, spawnType: 'weather_sim' },
  { id: 'volcano_simulator', name: 'Volcano Simulator', category: 'simulation', description: 'Inspect magma chambers, thermal shifts, and eruptions.', icon: Flame, spawnType: 'volcano' },
  { id: 'earthquake_simulator', name: 'Earthquake Simulator', category: 'simulation', description: 'Induce plate shifts and study seismic magnitudes.', icon: Grid, spawnType: 'earthquake' },
  { id: 'ocean_simulator', name: 'Ocean Simulator', category: 'simulation', description: 'Calibrate fluid tides, surface friction, and wind waves.', icon: Compass, spawnType: 'ocean_sim' },

  // 8. Social, Workspace & Design (20)
  { id: 'video_calls', name: 'Video Calls', category: 'social', description: 'Meet with spatial contacts in simulated video displays.', icon: Video, spawnType: 'video_call' },
  { id: 'voice_chat_app', name: 'Voice Chat', category: 'social', description: 'Engage with friends using clear audio rooms.', icon: Mic, spawnType: 'voice_chat' },
  { id: 'messaging_app', name: 'Messaging', category: 'social', description: 'Draft and review spatial textual transmissions.', icon: MessageSquare, spawnType: 'messaging' },
  { id: 'friends_list_app', name: 'Friends List', category: 'social', description: 'Oversee and track status of online contacts.', icon: Users, spawnType: 'friends' },
  { id: 'whiteboard_app', name: 'Whiteboard', category: 'social', description: 'Scribble notes and sketch diagrams on a 3D board.', icon: Edit, spawnType: 'whiteboard' },
  { id: 'sticky_notes_app', name: 'Sticky Notes', category: 'social', description: 'Write down quick spatial logs and stick them on air coordinates.', icon: StickyNote, spawnType: 'sticky' },
  { id: 'calendar_app', name: 'Calendar', category: 'social', description: 'Track events, schedules, and daily milestones in VR.', icon: Calendar, spawnType: 'calendar' },
  { id: 'clock_app', name: 'Clock', category: 'social', description: 'Display live timezone counts with moving virtual dials.', icon: Clock, spawnType: 'clock' },
  { id: 'weather_app', name: 'Weather', category: 'social', description: 'Track localized atmospheric forecasting models.', icon: Cloud, spawnType: 'weather' },
  { id: 'calculator_app_app', name: 'Calculator', category: 'social', description: 'Evaluate equations with large, high-contrast buttons.', icon: Calculator, spawnType: 'calculator' },
  { id: 'city_builder_app', name: 'City Builder', category: 'social', description: 'Arrange miniature road blocks, towers, and grids.', icon: Grid, spawnType: 'city_builder' },
  { id: 'home_designer', name: 'Home Designer', category: 'social', description: 'Layout 3D structural blueprints for spacious estates.', icon: FileText, spawnType: 'home_designer' },
  { id: 'interior_designer', name: 'Interior Designer', category: 'social', description: 'Calibrate textures and colors on couches and tables.', icon: Layout, spawnType: 'interior' }, // we will resolve icon dynamically
  { id: 'furniture_planner', name: 'Furniture Planner', category: 'social', description: 'Test interior furniture arrangements with metric rulers.', icon: Sliders, spawnType: 'furniture' },
  { id: 'presentation_mode', name: 'Presentation Mode', category: 'social', description: 'Project notes and slideshows to larger virtual monitors.', icon: FileText, spawnType: 'presentation' },
  { id: 'multiplayer_workspace', name: 'Multiplayer Workspace', category: 'social', description: 'Co-work on mutual documents with remote users.', icon: Users2, spawnType: 'multiplayer' },
  { id: 'portal_creator', name: 'Portal Creator', category: 'social', description: 'Open gateway coordinates to other study domains.', icon: Compass, spawnType: 'portal' },
  { id: 'recipe_book', name: 'Recipe Book', category: 'social', description: 'Inspect baking formulas and lists of culinary spices.', icon: BookOpen, spawnType: 'recipe' },
  { id: 'cooking_lessons', name: 'Cooking Lessons', category: 'social', description: 'Flip virtual eggs and boil simulated kitchen pots.', icon: Flame, spawnType: 'cooking' },
  { id: 'experience_hub_main', name: 'Experience Hub', category: 'social', description: 'Launch any and all registered portal activities.', icon: Layers, spawnType: 'experience_hub' }
];

// Spawning object structural interface
interface SpawnedItem {
  id: string; // unique UUID
  appId: string;
  name: string;
  spawnType: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  lodLevel: 'High' | 'Medium' | 'Low';
  // App-specific interactive states
  customText?: string; // for sticky note, whiteboard
  customNumber?: string; // for calculator
  isPlaying?: boolean; // for music
  weatherType?: 'clear' | 'rain' | 'snow'; // for weather simulator
  breathState?: 'inhale' | 'exhale' | 'hold'; // for breathing coach
  colorTheme?: string;
  pianoNotes?: string[];
}

export function WhiteVoidVR() {
  const { scene } = useThree();
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoverObject = useEduStore(state => state.discoverObject);

  // Background Void color control
  useEffect(() => {
    // Force white background in void
    const originalBg = scene.background;
    scene.background = new THREE.Color('#f4f4f5'); // Clean off-white void
    
    // Light adjustments for better look in white space
    const fog = new THREE.FogExp2('#f4f4f5', 0.02);
    scene.fog = fog;

    discoverObject('white_void_entry');

    return () => {
      scene.background = originalBg;
      scene.fog = null;
    };
  }, [scene, discoverObject]);

  // Main UI Menu Positions and State
  const [menuPos, setMenuPos] = useState<[number, number, number]>([0, 1.4, -2]);
  const [menuRot, setMenuRot] = useState<[number, number, number]>([0, 0, 0]);
  const [menuScale, setMenuScale] = useState<number>(1);
  const [isDraggingMenu, setIsDraggingMenu] = useState(false);

  // Search & Filtering of 100 Apps
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Spawned Items state pool
  const [spawnedItems, setSpawnedItems] = useState<SpawnedItem[]>([]);
  const [activeSelectedSpawnId, setActiveSelectedSpawnId] = useState<string | null>(null);

  // --- VR BEST PRACTICES SIMULATOR STATUS ---
  const [stable60Fps, setStable60Fps] = useState(true);
  const [onlyVisibleFrustum, setOnlyVisibleFrustum] = useState(true);
  const [lodActive, setLodActive] = useState(true);
  const [bakeLights, setBakeLights] = useState(true);
  const [objectPooling, setObjectPooling] = useState(true);
  const [combineMeshes, setCombineMeshes] = useState(true);

  // Dynamic values based on VR configuration toggles
  const [fps, setFps] = useState(60);
  const [polygonCount, setPolygonCount] = useState(4800);
  const [drawCalls, setDrawCalls] = useState(12);
  const [activePoolSize, setActivePoolSize] = useState(0);

  // Simulated live metrics ticker
  useEffect(() => {
    const timer = setInterval(() => {
      // Calculate dynamic values based on toggles and spawned items
      const basePolys = 1500 + spawnedItems.length * 600;
      const baseDrawCalls = 8 + spawnedItems.length * 4;

      if (stable60Fps) {
        setFps(Math.floor(59.2 + Math.random() * 1.5));
      } else {
        // unstable fps fluctuates wildly based on objects
        const fluctuation = spawnedItems.length > 3 ? -15 : 0;
        setFps(Math.floor(38.0 + Math.sin(Date.now() * 0.01) * 18 + fluctuation));
      }

      if (lodActive) {
        setPolygonCount(Math.floor(basePolys * 0.4));
      } else {
        setPolygonCount(basePolys * 2.5);
      }

      if (combineMeshes) {
        setDrawCalls(Math.floor(baseDrawCalls * 0.3) + 2);
      } else {
        setDrawCalls(baseDrawCalls * 2);
      }

      setActivePoolSize(objectPooling ? Math.max(12, spawnedItems.length + 8) : spawnedItems.length);

    }, 800);
    return () => clearInterval(timer);
  }, [stable60Fps, lodActive, combineMeshes, objectPooling, spawnedItems]);

  // Categories list
  const categories = [
    { id: 'all', name: 'All 100 Apps' },
    { id: 'productivity', name: 'Productivity' },
    { id: 'media', name: 'Media' },
    { id: 'education', name: 'Education' },
    { id: 'science', name: 'Sciences' },
    { id: 'creativity', name: 'Creative' },
    { id: 'health', name: 'Health' },
    { id: 'simulation', name: 'Sims' },
    { id: 'social', name: 'Social' }
  ];

  // Filtering list
  const filteredApps = useMemo(() => {
    return ALL_100_APPS.filter(app => {
      const matchSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = activeCategory === 'all' || app.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [searchQuery, activeCategory]);

  // Object pool for reuse (Simulating memory allocation)
  const despawnPool = useRef<SpawnedItem[]>([]);

  // Function to Spawn Object in the White Void
  const handleLaunchApp = (app: VRApp) => {
    discoverObject(`spawn_app_${app.id}`);
    
    // Position slightly randomized in front of menu
    const offsetX = (Math.random() - 0.5) * 2;
    const offsetY = (Math.random() - 0.5) * 0.5;
    const offsetZ = -1.5 - Math.random() * 1.5;
    
    const spawnPos: [number, number, number] = [
      menuPos[0] + offsetX,
      menuPos[1] + offsetY,
      menuPos[2] + offsetZ
    ];

    let newItem: SpawnedItem;

    // Check if we can reuse from the pool (Object Pooling best practice!)
    if (objectPooling && despawnPool.current.length > 0) {
      const pooled = despawnPool.current.pop()!;
      newItem = {
        ...pooled,
        id: Math.random().toString(), // assign new active id
        appId: app.id,
        name: app.name,
        spawnType: app.spawnType,
        position: spawnPos,
        rotation: [0, (Math.random() - 0.5) * 0.5, 0],
        scale: 1,
        lodLevel: 'High'
      };
    } else {
      // Create brand new
      newItem = {
        id: Math.random().toString(),
        appId: app.id,
        name: app.name,
        spawnType: app.spawnType,
        position: spawnPos,
        rotation: [0, 0, 0],
        scale: 1,
        lodLevel: 'High'
      };
    }

    // Initialize custom states based on types
    if (app.spawnType === 'sticky') {
      newItem.customText = "Holographic Note.\nDouble click to edit!";
      newItem.colorTheme = '#fef08a'; // yellow sticky
    } else if (app.spawnType === 'whiteboard') {
      newItem.customText = "SPATIAL CANVAS";
    } else if (app.spawnType === 'calculator') {
      newItem.customNumber = '0';
    } else if (app.spawnType === 'piano') {
      newItem.pianoNotes = [];
    } else if (app.spawnType === 'weather_sim') {
      newItem.weatherType = 'rain';
    } else if (app.spawnType === 'breathing') {
      newItem.breathState = 'hold';
    } else if (app.spawnType === 'music' || app.spawnType === 'dj') {
      newItem.isPlaying = false;
    }

    setSpawnedItems(prev => [...prev, newItem]);
    setActiveSelectedSpawnId(newItem.id);
  };

  // Despawn Item
  const handleDespawn = (id: string) => {
    const itemToDespawn = spawnedItems.find(item => item.id === id);
    if (!itemToDespawn) return;

    if (objectPooling) {
      // Put back in pool
      despawnPool.current.push(itemToDespawn);
    }

    setSpawnedItems(prev => prev.filter(item => item.id !== id));
    if (activeSelectedSpawnId === id) {
      setActiveSelectedSpawnId(null);
    }
  };

  // Modify spawned item properties
  const updateSpawnedItem = (id: string, updates: Partial<SpawnedItem>) => {
    setSpawnedItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    }));
  };

  // Auto LOD evaluation based on camera distance
  useFrame((state) => {
    if (!lodActive) return;
    
    // Check distance between camera and each spawned item
    const camPos = state.camera.position;
    
    setSpawnedItems(prev => prev.map(item => {
      const itemVec = new THREE.Vector3(...item.position);
      const dist = camPos.distanceTo(itemVec);
      
      let newLod: 'High' | 'Medium' | 'Low' = 'High';
      if (dist > 5) {
        newLod = 'Low';
      } else if (dist > 2.5) {
        newLod = 'Medium';
      }

      if (item.lodLevel !== newLod) {
        return { ...item, lodLevel: newLod };
      }
      return item;
    }));
  });

  return (
    <group>
      {/* Dynamic Lights calibrated based on "Bake Lights" toggles */}
      {bakeLights ? (
        // Simulating cheap precomputed baked lighting style: Low intensity ambient and directionals
        <group>
          <ambientLight intensity={0.8} color="#ffffff" />
          <directionalLight position={[2, 10, 5]} intensity={0.4} color="#fef08a" />
        </group>
      ) : (
        // Heavy, expensive real-time shadows and lights
        <group>
          <ambientLight intensity={0.3} />
          <pointLight position={[0, 4, 0]} intensity={2.5} color="#06b6d4" castShadow />
          <pointLight position={[-3, 2, -3]} intensity={1.5} color="#ec4899" castShadow />
          <directionalLight position={[5, 15, 5]} intensity={2.0} color="#ffffff" castShadow />
        </group>
      )}

      {/* Grid Floor */}
      <gridHelper args={[40, 40, '#e4e4e7', '#f4f4f5']} position={[0, -0.01, 0]} />

      {/* --- MAIN 3D MOVABLE DASHBOARD PANEL --- */}
      <group 
        position={menuPos} 
        rotation={menuRot} 
        scale={[menuScale, menuScale, menuScale]}
      >
        {/* Sleek metallic curved visual board backing */}
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[3.2, 1.8, 0.05]} />
          <meshStandardMaterial 
            color="#0f172a" 
            roughness={0.15} 
            metalness={0.9} 
          />
        </mesh>
        
        {/* Glow boarder trim */}
        <mesh position={[0, 0, -0.06]}>
          <boxGeometry args={[3.26, 1.86, 0.04]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.7} />
        </mesh>

        {/* Floating draggable/movable 3D handle arrows */}
        <group position={[0, -1.0, 0]}>
          {/* Horizontal Drag */}
          <mesh 
            position={[-0.4, 0, 0]} 
            onClick={() => setMenuPos(prev => [prev[0] - 0.2, prev[1], prev[2]])}
          >
            <boxGeometry args={[0.15, 0.08, 0.08]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
          <mesh 
            position={[0.4, 0, 0]} 
            onClick={() => setMenuPos(prev => [prev[0] + 0.2, prev[1], prev[2]])}
          >
            <boxGeometry args={[0.15, 0.08, 0.08]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
          {/* Vertical Drag */}
          <mesh 
            position={[0, 0.12, 0]} 
            onClick={() => setMenuPos(prev => [prev[0], prev[1] + 0.15, prev[2]])}
          >
            <boxGeometry args={[0.08, 0.15, 0.08]} />
            <meshStandardMaterial color="#10b981" />
          </mesh>
          <mesh 
            position={[0, -0.12, 0]} 
            onClick={() => setMenuPos(prev => [prev[0], prev[1] - 0.15, prev[2]])}
          >
            <boxGeometry args={[0.08, 0.15, 0.08]} />
            <meshStandardMaterial color="#10b981" />
          </mesh>
          {/* Depth Drag */}
          <mesh 
            position={[-0.8, 0, 0]} 
            rotation={[Math.PI / 2, 0, 0]}
            onClick={() => setMenuPos(prev => [prev[0], prev[1], prev[2] + 0.3])}
          >
            <coneGeometry args={[0.06, 0.15, 4]} />
            <meshStandardMaterial color="#ec4899" />
          </mesh>
          <mesh 
            position={[0.8, 0, 0]} 
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={() => setMenuPos(prev => [prev[0], prev[1], prev[2] - 0.3])}
          >
            <coneGeometry args={[0.06, 0.15, 4]} />
            <meshStandardMaterial color="#ec4899" />
          </mesh>

          {/* Scale handles */}
          <mesh 
            position={[-1.2, 0, 0]} 
            onClick={() => setMenuScale(prev => Math.max(0.6, prev - 0.1))}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
          <mesh 
            position={[1.2, 0, 0]} 
            onClick={() => setMenuScale(prev => Math.min(1.8, prev + 0.1))}
          >
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>

          {/* Interactive HTML Helper Label */}
          <Html distanceFactor={4} position={[0, -0.3, 0]} center>
            <div className="bg-slate-900 border border-slate-700/60 text-[9px] font-bold text-slate-300 uppercase px-3 py-1 rounded-full whitespace-nowrap shadow-xl">
              ⚙️ Position: X={menuPos[0].toFixed(1)} | Y={menuPos[1].toFixed(1)} | Z={menuPos[2].toFixed(1)} (Scale: {menuScale.toFixed(1)}x)
            </div>
          </Html>
        </group>

        {/* --- MAIN HTML INTERFACE RENDERED ON PANEL --- */}
        <Html transform distanceFactor={2.1} position={[0, 0, 0.03]} pointerEvents="auto" className="select-none">
          <div className="w-[840px] h-[480px] bg-slate-950/95 text-slate-100 flex rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden font-sans">
            {/* Background glowing flares */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Left Sidebar: Categories & Statistics */}
            <div className="w-56 border-r border-slate-800/80 pr-5 flex flex-col justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-cyan-500/10 rounded-xl border border-cyan-400/30">
                    <Layers className="w-5 h-5 text-cyan-400 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-white">White Void Hub</h2>
                    <p className="text-[9px] font-mono font-bold text-slate-500">100 APPS VR STATION</p>
                  </div>
                </div>

                {/* Categories Tab list */}
                <div className="space-y-1 overflow-y-auto max-h-[240px] pr-1 scrollbar-thin">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full text-left px-3 py-1.8 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                        activeCategory === cat.id 
                          ? 'bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 shadow-md' 
                          : 'border border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[8px] px-1.5 py-0.2 bg-slate-800 rounded text-slate-400 font-mono">
                        {cat.id === 'all' ? ALL_100_APPS.length : ALL_100_APPS.filter(a => a.category === cat.id).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* VR Profiler Toggles */}
              <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-2xl space-y-2 mt-2">
                <span className="text-[8px] font-black tracking-widest text-cyan-400 uppercase flex items-center gap-1.5">
                  <Sliders className="w-3 h-3" />
                  VR Quest 3S Profiler
                </span>
                
                {/* Simulated live chart */}
                <div className="flex items-end justify-between h-8 px-1.5 bg-black/40 border border-slate-800/80 rounded-lg">
                  <div className="w-2.5 h-6 bg-cyan-400 rounded-sm animate-pulse" />
                  <div className="w-2.5 h-8 bg-cyan-400 rounded-sm" />
                  <div className="w-2.5 h-4 bg-cyan-400 rounded-sm" />
                  <div className="w-2.5 h-7 bg-cyan-400 rounded-sm animate-pulse" />
                  <div className="w-2.5 h-5 bg-cyan-400 rounded-sm" />
                  <div className="w-2.5 h-6 bg-cyan-400 rounded-sm" />
                </div>

                <div className="grid grid-cols-2 gap-1 text-[8px] font-mono">
                  <div className="bg-black/30 p-1 rounded border border-slate-800">
                    <div className="text-slate-500 uppercase font-black">Frame Rate</div>
                    <div className={`text-xs font-black ${fps < 45 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                      {fps} FPS
                    </div>
                  </div>
                  <div className="bg-black/30 p-1 rounded border border-slate-800">
                    <div className="text-slate-500 uppercase font-black">Draw Calls</div>
                    <div className="text-xs font-black text-cyan-400">{drawCalls}</div>
                  </div>
                  <div className="bg-black/30 p-1 rounded border border-slate-800">
                    <div className="text-slate-500 uppercase font-black">Polygons</div>
                    <div className="text-[10px] font-black text-amber-400">{polygonCount}</div>
                  </div>
                  <div className="bg-black/30 p-1 rounded border border-slate-800">
                    <div className="text-slate-500 uppercase font-black">Object Pool</div>
                    <div className="text-xs font-black text-purple-400">{activePoolSize} items</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Main Section: Apps Grid & Search */}
            <div className="flex-1 pl-5 flex flex-col justify-between">
              {/* Header search controls */}
              <div className="flex items-center gap-3 justify-between border-b border-slate-800/80 pb-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search 100 VR applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800/80 rounded-xl py-2 pl-9 pr-4 text-[11px] font-bold text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 uppercase"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2 text-[10px] text-slate-500 hover:text-slate-300 font-bold uppercase cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="text-[9px] font-black tracking-widest text-fuchsia-400 uppercase bg-fuchsia-950/20 px-3 py-1.5 rounded-xl border border-fuchsia-500/20">
                  {spawnedItems.length} Spawned Items
                </div>
              </div>

              {/* Apps grid list */}
              <div className="flex-1 overflow-y-auto my-4 pr-1 grid grid-cols-3 gap-2.5 max-h-[300px] scrollbar-thin">
                {filteredApps.map(app => {
                  const IconComp = app.icon;
                  const isSpawned = spawnedItems.some(item => item.appId === app.id);
                  return (
                    <div 
                      key={app.id}
                      className="bg-slate-900/40 border border-slate-800/80 p-3 rounded-2xl flex flex-col justify-between hover:border-cyan-500/40 hover:bg-slate-900/60 transition-all group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 bg-slate-800 rounded-xl text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-950/30 transition-all shrink-0">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[10px] font-black text-white uppercase truncate tracking-wide">{app.name}</h4>
                          <p className="text-[8px] text-slate-400 leading-normal line-clamp-2 mt-0.5 uppercase">
                            {app.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800/40">
                        <span className="text-[7px] text-slate-500 font-mono uppercase tracking-widest bg-slate-950 px-1.5 py-0.5 rounded">
                          {app.category}
                        </span>
                        
                        <button
                          onClick={() => handleLaunchApp(app)}
                          className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-[8px] font-black text-slate-950 uppercase tracking-widest rounded-lg transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          Spawn Item
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredApps.length === 0 && (
                  <div className="col-span-3 py-12 text-center">
                    <Info className="w-8 h-8 text-slate-500 mx-auto mb-2 animate-bounce" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      No matching apps found. Try another query or category tab.
                    </p>
                  </div>
                )}
              </div>

              {/* Optimization Settings Panel (The Performance Instructions) */}
              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">VR Optimization Controls:</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setStable60Fps(p => !p)}
                      className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        stable60Fps ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700/40'
                      }`}
                      title="Keep the frame rate stable: Aim for a consistent 60 FPS rather than jumping."
                    >
                      🎯 Stable 60 FPS
                    </button>

                    <button
                      onClick={() => setLodActive(p => !p)}
                      className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        lodActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700/40'
                      }`}
                      title="Use Level of Detail (LOD): Far-away objects use simpler models."
                    >
                      📦 Auto LOD
                    </button>

                    <button
                      onClick={() => setObjectPooling(p => !p)}
                      className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        objectPooling ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700/40'
                      }`}
                      title="Object pooling: Reuse spawned objects instead of creating/destroying."
                    >
                      🧠 Pool Reuse
                    </button>

                    <button
                      onClick={() => setBakeLights(p => !p)}
                      className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        bakeLights ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700/40'
                      }`}
                      title="Bake lighting: Precomputed lighting is cheaper than dynamic."
                    >
                      💡 Baked light
                    </button>

                    <button
                      onClick={() => setCombineMeshes(p => !p)}
                      className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        combineMeshes ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700/40'
                      }`}
                      title="Combine meshes to save Draw Calls."
                    >
                      🧱 Mesh Batching
                    </button>
                  </div>
                </div>

                <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                  Optimized for Meta Quest 3S
                </div>
              </div>
            </div>
          </div>
        </Html>
      </group>


      {/* --- RENDER SPAWNED ITEMS IN THE WHITE VOID --- */}
      {spawnedItems.map((item) => {
        const isSelected = activeSelectedSpawnId === item.id;
        
        return (
          <group 
            key={item.id} 
            position={item.position} 
            rotation={item.rotation}
            scale={[item.scale, item.scale, item.scale]}
          >
            {/* 1. Core Spawned 3D Asset Shape based on app.spawnType */}
            <group onClick={(e) => {
              e.stopPropagation();
              setActiveSelectedSpawnId(isSelected ? null : item.id);
            }}>
              <SpawnedAssetModel type={item.spawnType} lod={item.lodLevel} item={item} />
            </group>

            {/* 2. Holographic bounding indicator cage when selected */}
            {isSelected && (
              <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[0.9, 0.9, 0.9]} />
                <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.3} />
              </mesh>
            )}

            {/* 3. Floating Interactive HTML Console Card above spawned item */}
            <Html distanceFactor={4.5} position={[0, 0.8, 0]} center pointerEvents="auto">
              <div className="bg-slate-950/95 text-slate-100 border border-slate-800 p-3.5 rounded-2xl w-60 shadow-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-[10px] font-black text-white uppercase tracking-wider">{item.name}</h5>
                    <span className="text-[7px] text-slate-400 font-mono uppercase bg-slate-900 px-1.5 py-0.5 rounded">
                      LOD: {item.lodLevel}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleDespawn(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-rose-950/30 rounded-lg border border-slate-800 transition-all cursor-pointer"
                    title="Despawn back into object pool"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Simulated customizable properties based on asset types */}
                <div className="bg-slate-900/60 p-2 rounded-xl text-[9px] font-bold border border-slate-800/50 space-y-2">
                  {/* TYPE: STICKY NOTE */}
                  {item.spawnType === 'sticky' && (
                    <div className="space-y-1">
                      <div className="text-slate-500 uppercase text-[7px] tracking-widest font-mono">EDIT STICKY CONTENT</div>
                      <textarea
                        value={item.customText}
                        onChange={(e) => updateSpawnedItem(item.id, { customText: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-[8px] text-yellow-200 uppercase focus:outline-none focus:border-yellow-400 h-10 resize-none font-mono"
                      />
                      <div className="flex gap-1">
                        {['#fef08a', '#fda4af', '#93c5fd', '#86efac'].map(color => (
                          <button
                            key={color}
                            onClick={() => updateSpawnedItem(item.id, { colorTheme: color })}
                            style={{ backgroundColor: color }}
                            className="w-4.5 h-4.5 rounded-full border border-slate-700 hover:scale-110 cursor-pointer"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TYPE: WHITEBOARD */}
                  {item.spawnType === 'whiteboard' && (
                    <div className="space-y-1">
                      <div className="text-slate-500 uppercase text-[7px] tracking-widest font-mono">Board text</div>
                      <input
                        type="text"
                        value={item.customText}
                        onChange={(e) => updateSpawnedItem(item.id, { customText: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[8px] text-white font-mono uppercase"
                      />
                    </div>
                  )}

                  {/* TYPE: CALCULATOR */}
                  {item.spawnType === 'calculator' && (
                    <div className="space-y-1.5">
                      <div className="bg-slate-950 border border-slate-850 p-1.5 text-right font-mono text-xs text-emerald-400 rounded">
                        {item.customNumber || '0'}
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'].map(char => (
                          <button
                            key={char}
                            onClick={() => {
                              let current = item.customNumber || '0';
                              if (char === 'C') {
                                current = '0';
                              } else if (char === '=') {
                                try {
                                  // Evaluate simple string math safely
                                  current = eval(current).toString();
                                } catch (err) {
                                  current = 'Error';
                                }
                              } else {
                                if (current === '0' || current === 'Error') {
                                  current = char;
                                } else {
                                  current += char;
                                }
                              }
                              updateSpawnedItem(item.id, { customNumber: current });
                            }}
                            className="p-1 bg-slate-950 hover:bg-slate-800 border border-slate-800/80 rounded text-[9px] font-black cursor-pointer"
                          >
                            {char}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TYPE: MUSIC PLAYER */}
                  {(item.spawnType === 'music' || item.spawnType === 'dj' || item.spawnType === 'podcast') && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-black tracking-wide">
                        {item.isPlaying ? '🔊 NOW PLAYING LOFI' : '🔇 TRACK PAUSED'}
                      </span>
                      <button
                        onClick={() => updateSpawnedItem(item.id, { isPlaying: !item.isPlaying })}
                        className="px-2 py-1 bg-cyan-500 text-slate-950 text-[7px] font-black uppercase tracking-wider rounded cursor-pointer"
                      >
                        {item.isPlaying ? 'PAUSE' : 'PLAY'}
                      </button>
                    </div>
                  )}

                  {/* TYPE: WEATHER SIMULATOR */}
                  {item.spawnType === 'weather_sim' && (
                    <div className="space-y-1">
                      <div className="text-slate-500 uppercase text-[7px] tracking-widest font-mono font-bold">Summon Weather Effect</div>
                      <div className="grid grid-cols-3 gap-1">
                        {(['clear', 'rain', 'snow'] as const).map(w => (
                          <button
                            key={w}
                            onClick={() => updateSpawnedItem(item.id, { weatherType: w })}
                            className={`p-1 text-[7px] font-black uppercase rounded border cursor-pointer ${
                              item.weatherType === w 
                                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' 
                                : 'bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400'
                            }`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TYPE: BREATHING COACH */}
                  {item.spawnType === 'breathing' && (
                    <div className="space-y-1">
                      <div className="text-slate-500 uppercase text-[7px] tracking-widest font-mono font-bold">Breathing State</div>
                      <div className="grid grid-cols-3 gap-1">
                        {(['inhale', 'hold', 'exhale'] as const).map(state => (
                          <button
                            key={state}
                            onClick={() => updateSpawnedItem(item.id, { breathState: state })}
                            className={`p-1 text-[7px] font-black uppercase rounded border cursor-pointer ${
                              item.breathState === state 
                                ? 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/40' 
                                : 'bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400'
                            }`}
                          >
                            {state}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TYPE: PIANO */}
                  {item.spawnType === 'piano' && (
                    <div className="space-y-1">
                      <div className="text-slate-500 uppercase text-[7px] tracking-widest font-mono font-bold">Tap To Play Chime</div>
                      <div className="flex gap-1 justify-center">
                        {['C4', 'E4', 'G4', 'C5'].map(note => (
                          <button
                            key={note}
                            onClick={() => {
                              const notes = [...(item.pianoNotes || [])];
                              notes.push(note);
                              if (notes.length > 5) notes.shift(); // keep last 5
                              updateSpawnedItem(item.id, { pianoNotes: notes });
                              
                              // Trigger simple synth sound
                              try {
                                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                                const osc = ctx.createOscillator();
                                const gain = ctx.createGain();
                                osc.connect(gain);
                                gain.connect(ctx.destination);
                                
                                const freqs: Record<string, number> = { C4: 261.63, E4: 329.63, G4: 392.00, C5: 523.25 };
                                osc.frequency.setValueAtTime(freqs[note], ctx.currentTime);
                                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                                
                                osc.start();
                                osc.stop(ctx.currentTime + 0.5);
                              } catch(e) {}
                            }}
                            className="px-2 py-1.5 bg-white text-slate-950 border border-slate-300 rounded font-bold text-[8px] hover:bg-zinc-200 cursor-pointer active:scale-95 transition-all"
                          >
                            {note}
                          </button>
                        ))}
                      </div>
                      <div className="text-[7px] text-zinc-400 font-mono text-center">
                        Played: {item.pianoNotes?.join(' > ') || 'None'}
                      </div>
                    </div>
                  )}

                  {/* TYPE: DINOSAUR */}
                  {item.spawnType === 'dinosaur' && (
                    <button
                      onClick={() => {
                        // Play a fun little synthesizer roar!
                        try {
                          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                          const osc = ctx.createOscillator();
                          const gain = ctx.createGain();
                          osc.type = 'sawtooth';
                          osc.connect(gain);
                          gain.connect(ctx.destination);
                          
                          osc.frequency.setValueAtTime(80, ctx.currentTime);
                          osc.frequency.linearRampToValueAtTime(30, ctx.currentTime + 1.2);
                          gain.gain.setValueAtTime(0.5, ctx.currentTime);
                          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
                          
                          osc.start();
                          osc.stop(ctx.currentTime + 1.2);
                        } catch(e) {}
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-1.5 text-center rounded text-[8px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      🦖 Sound Tyrannosaur Roar
                    </button>
                  )}

                  {/* TYPE: SMART HOME */}
                  {item.spawnType === 'smart_home' && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-black">BULB STATUS</span>
                      <button
                        onClick={() => updateSpawnedItem(item.id, { isPlaying: !item.isPlaying })}
                        className={`px-2 py-0.5 rounded text-[8px] font-black cursor-pointer ${
                          item.isPlaying ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {item.isPlaying ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  )}

                  {/* General Spatial Move Slider */}
                  <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
                    <div className="text-[7px] text-slate-500 font-black uppercase tracking-widest">SPATIAL TRANSFORM</div>
                    <div className="flex items-center gap-1">
                      <Move className="w-3.5 h-3.5 text-slate-400" />
                      {/* Left */}
                      <button 
                        onClick={() => updateSpawnedItem(item.id, { position: [item.position[0] - 0.2, item.position[1], item.position[2]] })}
                        className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[7px] font-bold cursor-pointer"
                      >
                        -X
                      </button>
                      {/* Right */}
                      <button 
                        onClick={() => updateSpawnedItem(item.id, { position: [item.position[0] + 0.2, item.position[1], item.position[2]] })}
                        className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[7px] font-bold cursor-pointer"
                      >
                        +X
                      </button>
                      {/* Height Up */}
                      <button 
                        onClick={() => updateSpawnedItem(item.id, { position: [item.position[0], item.position[1] + 0.15, item.position[2]] })}
                        className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[7px] font-bold cursor-pointer"
                      >
                        +Y
                      </button>
                      {/* Height Down */}
                      <button 
                        onClick={() => updateSpawnedItem(item.id, { position: [item.position[0], item.position[1] - 0.15, item.position[2]] })}
                        className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[7px] font-bold cursor-pointer"
                      >
                        -Y
                      </button>
                      {/* Push */}
                      <button 
                        onClick={() => updateSpawnedItem(item.id, { position: [item.position[0], item.position[1], item.position[2] - 0.3] })}
                        className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[7px] font-bold cursor-pointer"
                      >
                        Push
                      </button>
                      {/* Pull */}
                      <button 
                        onClick={() => updateSpawnedItem(item.id, { position: [item.position[0], item.position[1], item.position[2] + 0.3] })}
                        className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[7px] font-bold cursor-pointer"
                      >
                        Pull
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Html>
          </group>
        );
      })}

    </group>
  );
}

// Subcomponent: Render customized 3D meshes based on the app's spawnType
interface ModelProps {
  type: string;
  lod: 'High' | 'Medium' | 'Low';
  item: SpawnedItem;
}

function SpawnedAssetModel({ type, lod, item }: ModelProps) {
  const meshRef = useRef<THREE.Group>(null);

  // Constant rotation for floaty visual effect
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
    }
  });

  // Decide geometry resolution based on LOD level (Level of Detail Best Practice!)
  const geoArgs = useMemo(() => {
    if (lod === 'Low') {
      return { sphereSegs: 6, boxSlices: 1, cylinderSegs: 4 };
    } else if (lod === 'Medium') {
      return { sphereSegs: 12, boxSlices: 1, cylinderSegs: 8 };
    } else {
      return { sphereSegs: 32, boxSlices: 1, cylinderSegs: 16 };
    }
  }, [lod]);

  // Different geometric models for spawn types
  switch (type) {
    case 'desktop':
      return (
        <group ref={meshRef}>
          {/* Base Desktop Tower Case */}
          <mesh>
            <boxGeometry args={[0.2, 0.4, 0.4]} />
            <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.8} />
          </mesh>
          {/* Glowing neon green GPU lines */}
          <mesh position={[0.11, 0, 0]}>
            <boxGeometry args={[0.01, 0.1, 0.3]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
        </group>
      );

    case 'browser':
      return (
        <group ref={meshRef}>
          {/* Flat curved blue browser wireframe */}
          <mesh>
            <torusGeometry args={[0.3, 0.02, 12, geoArgs.sphereSegs]} />
            <meshStandardMaterial color="#0ea5e9" roughness={0.3} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.15, geoArgs.sphereSegs, geoArgs.sphereSegs]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.65} wireframe />
          </mesh>
        </group>
      );

    case 'keyboard':
      return (
        <group ref={meshRef}>
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <boxGeometry args={[0.5, 0.05, 0.2]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 4, 0, 0]}>
            <boxGeometry args={[0.45, 0.01, 0.16]} />
            <meshBasicMaterial color="#ec4899" wireframe />
          </mesh>
        </group>
      );

    case 'sticky':
      return (
        <group ref={meshRef}>
          {/* Colorful square flat pad */}
          <mesh>
            <boxGeometry args={[0.4, 0.4, 0.01]} />
            <meshStandardMaterial color={item.colorTheme || '#fef08a'} roughness={0.9} />
          </mesh>
          {/* Subtle text indicator */}
          <Html position={[0, 0, 0.015]} center distanceFactor={3}>
            <div className="text-[6px] text-slate-900 font-mono font-bold leading-normal text-center select-none whitespace-pre uppercase max-w-[80px] break-words">
              {item.customText || "STICKY"}
            </div>
          </Html>
        </group>
      );

    case 'whiteboard':
      return (
        <group ref={meshRef}>
          {/* Easel Stand */}
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.6, geoArgs.cylinderSegs]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          {/* Main draw Board */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.6, 0.45, 0.02]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.8} />
          </mesh>
          {/* Interactive Draw Grid Frame */}
          <Html position={[0, 0.1, 0.015]} center distanceFactor={2.5}>
            <div className="bg-white text-slate-950 p-1.5 w-40 text-center font-sans">
              <span className="text-[7px] font-black uppercase text-rose-500 tracking-wider">
                {item.customText || "CANVAS"}
              </span>
              <div className="w-full h-8 border border-dashed border-slate-300 mt-1 flex items-center justify-center text-[5px] text-zinc-400">
                ✏️ SPATIAL WHITEBOARD
              </div>
            </div>
          </Html>
        </group>
      );

    case 'calculator':
      return (
        <group ref={meshRef}>
          {/* Dark calculator terminal */}
          <mesh>
            <boxGeometry args={[0.3, 0.4, 0.05]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.12, 0.026]}>
            <boxGeometry args={[0.24, 0.08, 0.01]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
        </group>
      );

    case 'clock':
      return (
        <group ref={meshRef}>
          {/* Ring casing */}
          <mesh>
            <torusGeometry args={[0.22, 0.03, 8, geoArgs.sphereSegs]} />
            <meshStandardMaterial color="#6366f1" roughness={0.1} />
          </mesh>
          {/* White face */}
          <mesh position={[0, 0, -0.01]}>
            <circleGeometry args={[0.2, geoArgs.sphereSegs]} />
            <meshStandardMaterial color="#ffffff" roughness={0.9} />
          </mesh>
          {/* Minute Dial hand */}
          <mesh position={[0, 0.07, 0.01]}>
            <boxGeometry args={[0.01, 0.15, 0.01]} />
            <meshBasicMaterial color="#111827" />
          </mesh>
        </group>
      );

    case 'piano':
      return (
        <group ref={meshRef}>
          {/* Curved stand body */}
          <mesh>
            <boxGeometry args={[0.55, 0.1, 0.35]} />
            <meshStandardMaterial color="#111827" roughness={0.1} metalness={0.8} />
          </mesh>
          {/* Glowing keys outline */}
          <mesh position={[0, 0.03, 0.1]}>
            <boxGeometry args={[0.5, 0.05, 0.1]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} />
          </mesh>
        </group>
      );

    case 'dinosaur':
      return (
        <group ref={meshRef}>
          {/* Simplified dinosaur skull model using geometric combos */}
          <mesh>
            <boxGeometry args={[0.3, 0.25, 0.5]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.1, 0.15]}>
            <boxGeometry args={[0.25, 0.1, 0.3]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
          </mesh>
          {/* Glowing red fossil eyes */}
          <mesh position={[-0.11, 0.05, -0.1]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0.11, 0.05, -0.1]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      );

    case 'dna':
      return (
        <group ref={meshRef}>
          {/* Glowing helix vertical tubes */}
          <mesh>
            <cylinderGeometry args={[0.015, 0.015, 0.5, geoArgs.cylinderSegs]} />
            <meshStandardMaterial color="#3b82f6" transparent opacity={0.6} />
          </mesh>
          {/* Rung connectors */}
          {[-0.15, -0.05, 0.05, 0.15].map((y, idx) => (
            <mesh key={idx} position={[0, y, 0]} rotation={[0, idx * 0.8, 0]}>
              <boxGeometry args={[0.2, 0.015, 0.015]} />
              <meshBasicMaterial color={idx % 2 === 0 ? '#10b981' : '#f43f5e'} />
            </mesh>
          ))}
        </group>
      );

    case 'space_museum':
    case 'rocket':
      return (
        <group ref={meshRef}>
          {/* Bullet shuttle fuselage */}
          <mesh>
            <cylinderGeometry args={[0.1, 0.1, 0.5, geoArgs.cylinderSegs]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          {/* Nose cone */}
          <mesh position={[0, 0.32, 0]}>
            <coneGeometry args={[0.1, 0.15, geoArgs.cylinderSegs]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </group>
      );

    case 'planetarium':
    case 'earth':
    case 'planet_creator':
      return (
        <group ref={meshRef}>
          {/* Planet globe sphere */}
          <mesh>
            <sphereGeometry args={[0.25, geoArgs.sphereSegs, geoArgs.sphereSegs]} />
            <meshStandardMaterial color="#0ea5e9" roughness={0.6} />
          </mesh>
          {/* Saturn-like ring */}
          <mesh rotation={[Math.PI / 3, 0.1, 0]}>
            <torusGeometry args={[0.42, 0.015, 6, geoArgs.sphereSegs]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} />
          </mesh>
        </group>
      );

    case 'meditation':
      return (
        <group ref={meshRef}>
          {/* Stacked zen stones */}
          <mesh position={[0, -0.2, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} scale={[1, 0.5, 1]} />
            <meshStandardMaterial color="#71717a" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <sphereGeometry args={[0.11, 8, 8]} scale={[1, 0.5, 1]} />
            <meshStandardMaterial color="#a1a1aa" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.02, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} scale={[1, 0.5, 1]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
          </mesh>
        </group>
      );

    case 'breathing':
      return (
        <group>
          {/* Dynamic pulsating breathing ball in sync with state */}
          <BreathingSphere state={item.breathState || 'hold'} geoArgs={geoArgs} />
        </group>
      );

    case 'weather_sim':
      return (
        <group>
          {/* Rotating cloud + optional rain/snow particles */}
          <WeatherCloud type={item.weatherType || 'clear'} geoArgs={geoArgs} />
        </group>
      );

    case 'aquarium':
      return (
        <group ref={meshRef}>
          {/* Glass water box casing */}
          <mesh>
            <boxGeometry args={[0.45, 0.35, 0.45]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.3} roughness={0.01} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.46, 0.36, 0.46]} />
            <meshBasicMaterial color="#38bdf8" wireframe />
          </mesh>
          {/* Tiny glowing generic fish */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.04, 0.12, 4]} />
            <meshStandardMaterial color="#f97316" />
          </mesh>
        </group>
      );

    case 'smart_home':
      return (
        <group ref={meshRef}>
          {/* Stand holder */}
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.05, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {/* Bulb sphere that turns on or off */}
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.15, geoArgs.sphereSegs, geoArgs.sphereSegs]} />
            {item.isPlaying ? (
              <meshBasicMaterial color="#fbbf24" />
            ) : (
              <meshStandardMaterial color="#94a3b8" roughness={0.4} />
            )}
          </mesh>
        </group>
      );

    case 'portal':
    case 'experience_hub':
      return (
        <group ref={meshRef}>
          <mesh>
            <torusGeometry args={[0.3, 0.04, 12, geoArgs.sphereSegs]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1.2} />
          </mesh>
          <mesh>
            <circleGeometry args={[0.26, geoArgs.sphereSegs]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        </group>
      );

    default:
      // Generic high-tech holographic geometric bento box fallback
      return (
        <group ref={meshRef}>
          <mesh>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial 
              color="#312e81" 
              roughness={0.2} 
              metalness={0.8} 
            />
          </mesh>
          {/* Cyan visual grid lines */}
          <mesh>
            <boxGeometry args={[0.31, 0.31, 0.31]} />
            <meshBasicMaterial color="#06b6d4" wireframe />
          </mesh>
        </group>
      );
  }
}

// Interactive helper: Breathing Sphere
function BreathingSphere({ state, geoArgs }: { state: 'inhale' | 'exhale' | 'hold', geoArgs: any }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((st) => {
    if (!meshRef.current) return;
    const time = st.clock.getElapsedTime();
    let targetScale = 1.0;

    if (state === 'inhale') {
      // expand
      targetScale = 1.4 + Math.sin(time * 2) * 0.15;
    } else if (state === 'exhale') {
      // shrink
      targetScale = 0.7 + Math.sin(time * 2) * 0.1;
    } else {
      // stable pulse
      targetScale = 1.0 + Math.sin(time) * 0.05;
    }

    const current = meshRef.current.scale.x;
    const lerped = THREE.MathUtils.lerp(current, targetScale, 0.1);
    meshRef.current.scale.set(lerped, lerped, lerped);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.24, geoArgs.sphereSegs, geoArgs.sphereSegs]} />
      <meshStandardMaterial 
        color={state === 'inhale' ? '#ec4899' : state === 'exhale' ? '#3b82f6' : '#a855f7'} 
        roughness={0.2} 
        transparent 
        opacity={0.8}
      />
    </mesh>
  );
}

// Interactive helper: Weather cloud
function WeatherCloud({ type, geoArgs }: { type: 'clear' | 'rain' | 'snow', geoArgs: any }) {
  const groupRef = useRef<THREE.Group>(null);
  const precipRef = useRef<THREE.Points>(null);

  const particleCount = 20;
  const positions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.3; // localized under cloud
      arr[i * 3 + 1] = -0.1 - Math.random() * 0.4;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    return arr;
  }, []);

  useFrame((st) => {
    const time = st.clock.getElapsedTime();
    if (groupRef.current) {
      // wobble cloud
      groupRef.current.position.y = Math.sin(time * 0.8) * 0.04;
    }

    if (precipRef.current && type !== 'clear') {
      const positionAttr = precipRef.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let y = positionAttr.getY(i);
        // fall
        y -= type === 'rain' ? 0.015 : 0.006;
        if (y < -0.5) {
          y = -0.1; // reset top
        }
        positionAttr.setY(i, y);
      }
      positionAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Cloud main body */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.18, geoArgs.sphereSegs, geoArgs.sphereSegs]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
      </mesh>
      <mesh position={[-0.15, 0.15, 0]}>
        <sphereGeometry args={[0.13, geoArgs.sphereSegs, geoArgs.sphereSegs]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.9} />
      </mesh>
      <mesh position={[0.15, 0.15, 0]}>
        <sphereGeometry args={[0.13, geoArgs.sphereSegs, geoArgs.sphereSegs]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.9} />
      </mesh>

      {/* Rain or Snow Particles falling */}
      {type !== 'clear' && (
        <points ref={precipRef}>
          <bufferGeometry>
            <bufferAttribute 
              attach="attributes-position"
              args={[positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial 
            color={type === 'rain' ? '#38bdf8' : '#ffffff'} 
            size={0.03} 
            sizeAttenuation
            transparent
            opacity={0.8}
          />
        </points>
      )}
    </group>
  );
}
