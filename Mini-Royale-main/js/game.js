// ============================================================
// MINI ROYALE - Advanced Free Fire Style Battle Royale
// ============================================================

// ---- CONSTANTS ----
const MAP_SIZE = 1000;
const HALF_MAP = MAP_SIZE / 2;
const GRAVITY = -30;
const PLAYER_HEIGHT = 3.5;
const CROUCH_HEIGHT = 2.2;
const PLAYER_RADIUS = 1;
const BULLET_SPEED = 220;
const ENEMY_COUNT = 35;
const LOOT_COUNT = 100;
const TREE_COUNT = 200;
const ROCK_COUNT = 80;
const MAX_HP = 150;
const MAX_SHIELD = 100;

// Weapons
const WEAPONS = [
    { name: 'Pistol', damage: 18, fireRate: 0.3, magSize: 15, reserveAmmo: 60, reloadTime: 1.4, spread: 0.025, color: 0xaaaaaa, auto: false, adsZoom: 1.15, adsSpread: 0.012, mode: 'SEMI' },
    { name: 'AR - Assault Rifle', damage: 24, fireRate: 0.09, magSize: 30, reserveAmmo: 120, reloadTime: 2.0, spread: 0.04, color: 0x555555, auto: true, adsZoom: 1.4, adsSpread: 0.015, mode: 'AUTO' },
    { name: 'Shotgun', damage: 14, fireRate: 0.75, magSize: 8, reserveAmmo: 32, reloadTime: 2.8, spread: 0.1, pellets: 7, color: 0x8B4513, auto: false, adsZoom: 1.1, adsSpread: 0.07, mode: 'PUMP' },
];

// ---- GAME STATE ----
let scene, camera, renderer, clock;
let player, enemies = [], bullets = [], lootItems = [], buildings = [], trees = [], rocks = [], grenades = [], particles = [];
let keys = {}, mouseDown = false, rightMouseDown = false;
let yaw = 0, pitch = 0;
let velocityY = 0, isGrounded = true;
let currentWeaponIndex = 1;
let weaponMag, weaponReserve;
let kills = 0, alive = ENEMY_COUNT + 1;
let isReloading = false, reloadTimer = 0, reloadDuration = 0;
let fireTimer = 0;
let playerHealth = MAX_HP;
let playerShield = 50;
let grenadeCount = 3;
let isCrouching = false, isADS = false, isSprinting = false;
let headBob = 0, headBobTimer = 0;
let recoilPitch = 0; // visual recoil offset
let gameStarted = false, gameOver = false;
let gameTime = 0;
let fpWeaponGroup;

// UI timeout IDs (prevent race conditions)
let _hitmarkerTimeout, _dmgFlashTimeout, _dmgDirTimeout, _pickupTimeout;

// Cached DOM elements (avoid getElementById in game loop)
let _dom = {};

// Zone
let zoneRadius = HALF_MAP;
let zoneCenterX = 0, zoneCenterZ = 0;
let zoneShrinkPhase = 0, zoneShrinkTimer = 0;
const ZONE_PHASES = [
    { delay: 80, target: 400, speed: 0.3 },
    { delay: 60, target: 280, speed: 0.35 },
    { delay: 50, target: 160, speed: 0.45 },
    { delay: 40, target: 70,  speed: 0.55 },
    { delay: 25, target: 5,   speed: 0.7 },
];
let zoneDamageTimer = 0;

// Audio context
let audioCtx;
function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

let minimapCtx;
let clouds = [];
let waterMesh;

// Cached shared geometries/materials (avoid GC pressure)
const _bulletGeo = new THREE.SphereGeometry(0.08, 4, 4);
const _bulletMatPlayer = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const _bulletMatEnemy = new THREE.MeshBasicMaterial({ color: 0xff4400 });
const _particleGeo = new THREE.SphereGeometry(0.1, 4, 3);

// Reusable vectors for aim detection (avoid allocation in loop)
const _aimLookDir = new THREE.Vector3();
const _aimAxisX = new THREE.Vector3(1, 0, 0);
const _aimAxisY = new THREE.Vector3(0, 1, 0);

// ---- INIT ----
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7EC8E3);
    scene.fog = new THREE.FogExp2(0x7EC8E3, 0.0012);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1200);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    document.body.appendChild(renderer.domElement);

    clock = new THREE.Clock();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x8899bb, 0.45);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff0dd, 1.2);
    sunLight.position.set(120, 180, 90);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 1200;
    sunLight.shadow.camera.left = -500;
    sunLight.shadow.camera.right = 500;
    sunLight.shadow.camera.top = 500;
    sunLight.shadow.camera.bottom = -500;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x445522, 0.5);
    scene.add(hemiLight);

    // Build world
    createGround();
    createWaterAreas();
    createBuildings();
    createTrees();
    createRocks();
    createLoot();
    createClouds();
    createZoneVisual();

    // Player
    initPlayer();
    createFPWeapon();

    // Enemies
    createEnemies();

    // Minimap
    minimapCtx = document.getElementById('minimap-canvas').getContext('2d');

    // Init weapon
    resetWeaponAmmo();

    // Controls
    setupControls();

    // Start
    animate();
}

// ---- SOUND EFFECTS ----
function playSound(type) {
    try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        if (type === 'shoot') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
        } else if (type === 'hit') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.08);
        } else if (type === 'kill') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
        } else if (type === 'pickup') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15);
        } else if (type === 'explode') {
            const noise = ctx.createBufferSource();
            const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
            noise.buffer = buffer;
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            noise.connect(noiseGain); noiseGain.connect(ctx.destination);
            noise.start(ctx.currentTime); osc.disconnect(); return;
        } else if (type === 'reload') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
        }
    } catch(e) {}
}

// ---- GROUND ----
function createGround() {
    const groundGeo = new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE, 120, 120);
    const verts = groundGeo.attributes.position;
    for (let i = 0; i < verts.count; i++) {
        const x = verts.getX(i);
        const y = verts.getY(i);
        const h = Math.sin(x * 0.015) * Math.cos(y * 0.015) * 3 +
                  Math.sin(x * 0.04 + 2) * Math.cos(y * 0.025) * 1.5 +
                  Math.sin(x * 0.08) * Math.cos(y * 0.06) * 0.5;
        verts.setZ(i, h);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshLambertMaterial({ color: 0x4a7c3f });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Dirt patches
    for (let i = 0; i < 15; i++) {
        const patchGeo = new THREE.CircleGeometry(8 + Math.random() * 12, 8);
        const patchMat = new THREE.MeshLambertMaterial({ color: 0x6b5a3e });
        const patch = new THREE.Mesh(patchGeo, patchMat);
        patch.rotation.x = -Math.PI / 2;
        patch.position.set((Math.random() - 0.5) * MAP_SIZE * 0.8, 0.06, (Math.random() - 0.5) * MAP_SIZE * 0.8);
        scene.add(patch);
    }

    // Roads
    createRoad(0, 0, MAP_SIZE, 8, 0);
    createRoad(0, 0, MAP_SIZE, 8, Math.PI / 2);
    createRoad(160, 120, 440, 6, Math.PI / 4);
    createRoad(-200, -160, 400, 6, -Math.PI / 6);
    createRoad(-300, 100, 320, 5, Math.PI / 3);
    createRoad(250, -100, 350, 6, Math.PI / 5);

    // Road markings
    for (let r = 0; r < 2; r++) {
        const rot = r === 0 ? 0 : Math.PI / 2;
        for (let i = -40; i <= 40; i++) {
            const dashGeo = new THREE.PlaneGeometry(6, 0.3);
            const dashMat = new THREE.MeshLambertMaterial({ color: 0xcccc44 });
            const dash = new THREE.Mesh(dashGeo, dashMat);
            dash.rotation.x = -Math.PI / 2;
            dash.rotation.z = rot;
            if (r === 0) dash.position.set(i * 12, 0.07, 0);
            else dash.position.set(0, 0.07, i * 12);
            scene.add(dash);
        }
    }
}

function createRoad(x, z, length, width, rotation) {
    const geo = new THREE.PlaneGeometry(length, width);
    const mat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const road = new THREE.Mesh(geo, mat);
    road.rotation.x = -Math.PI / 2;
    road.rotation.z = rotation;
    road.position.set(x, 0.05, z);
    road.receiveShadow = true;
    scene.add(road);
}

// ---- WATER ----
function createWaterAreas() {
    const waterPositions = [
        { x: -360, z: 360, r: 45 },
        { x: 380, z: -320, r: 35 },
        { x: 100, z: 360, r: 28 },
        { x: -300, z: -100, r: 30 },
        { x: 200, z: 280, r: 25 },
    ];
    waterPositions.forEach(wp => {
        const geo = new THREE.CircleGeometry(wp.r, 24);
        const mat = new THREE.MeshLambertMaterial({ color: 0x2277aa, transparent: true, opacity: 0.7 });
        const water = new THREE.Mesh(geo, mat);
        water.rotation.x = -Math.PI / 2;
        water.position.set(wp.x, 0.15, wp.z);
        scene.add(water);
        const shoreGeo = new THREE.RingGeometry(wp.r, wp.r + 3, 24);
        const shoreMat = new THREE.MeshLambertMaterial({ color: 0xc2b280, side: THREE.DoubleSide });
        const shore = new THREE.Mesh(shoreGeo, shoreMat);
        shore.rotation.x = -Math.PI / 2;
        shore.position.set(wp.x, 0.08, wp.z);
        scene.add(shore);
    });
}

// ---- CLOUDS ----
function createClouds() {
    for (let i = 0; i < 25; i++) {
        const cloudGroup = new THREE.Group();
        const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
        const blobCount = 3 + Math.floor(Math.random() * 4);
        for (let j = 0; j < blobCount; j++) {
            const r = 6 + Math.random() * 10;
            const geo = new THREE.SphereGeometry(r, 7, 5);
            const blob = new THREE.Mesh(geo, cloudMat);
            blob.position.set((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 10);
            blob.scale.y = 0.4;
            cloudGroup.add(blob);
        }
        cloudGroup.position.set(
            (Math.random() - 0.5) * MAP_SIZE * 1.5,
            80 + Math.random() * 60,
            (Math.random() - 0.5) * MAP_SIZE * 1.5
        );
        cloudGroup.userData.speed = 0.5 + Math.random() * 1.5;
        scene.add(cloudGroup);
        clouds.push(cloudGroup);
    }
}


// ---- MOBILE DETECTION ----
// Use any-pointer/any-hover: if ANY input device has fine pointer or hover, treat as desktop.
// Touchscreen laptops have trackpad (fine pointer + hover), so they're excluded.
// Only true phones/tablets have exclusively coarse pointers with no hover.
const hasFinePointer = window.matchMedia('(any-pointer: fine)').matches;
const hasHover = window.matchMedia('(any-hover: hover)').matches;
const isMobile = !hasFinePointer && !hasHover;
if (isMobile) {
    document.documentElement.classList.add('touch-device');
    // Lock landscape orientation
    try {
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {});
        }
    } catch(e) {}
}

// Mobile input state
let mobileMove = { x: 0, y: 0 };
let joystickActive = false;
let lookTouchId = null;
let lastLookX = 0, lastLookY = 0;
let mobileFiring = false;

// ---- BUILDINGS ----
function createBuildings() {
    const buildingConfigs = [
        // Central town
        { x: 30, z: 30, w: 16, h: 12, d: 14, color: 0xd4a574, roofColor: 0x8B4513 },
        { x: 55, z: 25, w: 10, h: 8, d: 10, color: 0xe8c9a0, roofColor: 0xa0522d },
        { x: 35, z: 55, w: 12, h: 10, d: 12, color: 0xc4956a, roofColor: 0x8B4513 },
        { x: 60, z: 55, w: 20, h: 14, d: 16, color: 0xbbb8b0, roofColor: 0x696969 },
        { x: -20, z: 50, w: 10, h: 8, d: 10, color: 0xd0b890, roofColor: 0xa0522d },
        { x: 0, z: -80, w: 14, h: 11, d: 12, color: 0xa89880, roofColor: 0x8B4513 },
        // NW village
        { x: -120, z: 240, w: 24, h: 16, d: 18, color: 0xa0a0a0, roofColor: 0x555555 },
        { x: -60, z: 250, w: 10, h: 7, d: 10, color: 0xd4a574, roofColor: 0x8B4513 },
        { x: -110, z: 300, w: 14, h: 10, d: 12, color: 0xc8b090, roofColor: 0x8B4513 },
        { x: -160, z: 270, w: 12, h: 9, d: 10, color: 0xe0d0b0, roofColor: 0xa0522d },
        // NE outpost
        { x: 280, z: 200, w: 18, h: 12, d: 14, color: 0xb8a080, roofColor: 0x654321 },
        { x: 320, z: 220, w: 12, h: 9, d: 10, color: 0xd0c0a0, roofColor: 0x8B4513 },
        { x: 260, z: 230, w: 8, h: 6, d: 8, color: 0xe0d0b0, roofColor: 0xa0522d },
        // SE compound
        { x: 300, z: -200, w: 22, h: 15, d: 18, color: 0x909090, roofColor: 0x444444 },
        { x: 340, z: -180, w: 14, h: 10, d: 12, color: 0xc4956a, roofColor: 0x8B4513 },
        { x: 270, z: -220, w: 12, h: 8, d: 10, color: 0xd4a574, roofColor: 0x8B4513 },
        // SW hamlet
        { x: -240, z: -200, w: 22, h: 15, d: 18, color: 0x909090, roofColor: 0x444444 },
        { x: -180, z: -220, w: 14, h: 10, d: 12, color: 0xc4956a, roofColor: 0x8B4513 },
        { x: -280, z: -160, w: 12, h: 8, d: 10, color: 0xd4a574, roofColor: 0x8B4513 },
        { x: -220, z: -140, w: 10, h: 7, d: 10, color: 0xe8d8c0, roofColor: 0x8B4513 },
        // West settlement
        { x: -340, z: 120, w: 16, h: 11, d: 14, color: 0xb0a090, roofColor: 0x654321 },
        { x: -380, z: 100, w: 12, h: 9, d: 10, color: 0xc0b0a0, roofColor: 0x8B4513 },
        { x: -320, z: 80, w: 10, h: 7, d: 10, color: 0xe0c8a0, roofColor: 0x8B4513 },
        // East settlement
        { x: 360, z: 40, w: 14, h: 10, d: 12, color: 0xc0b0a0, roofColor: 0x8B4513 },
        { x: 380, z: -30, w: 16, h: 11, d: 14, color: 0xb8a888, roofColor: 0x654321 },
        // South outpost
        { x: -50, z: -340, w: 20, h: 13, d: 16, color: 0x999999, roofColor: 0x555555 },
        { x: 80, z: -280, w: 14, h: 9, d: 12, color: 0xd4a574, roofColor: 0x8B4513 },
        { x: -100, z: -300, w: 10, h: 7, d: 10, color: 0xe0c8a0, roofColor: 0x8B4513 },
        // North outpost
        { x: 100, z: 320, w: 14, h: 10, d: 12, color: 0xc0b0a0, roofColor: 0x8B4513 },
        { x: 150, z: 350, w: 18, h: 12, d: 14, color: 0xb0a090, roofColor: 0x654321 },
        // Far corners - isolated buildings
        { x: -400, z: -350, w: 16, h: 10, d: 14, color: 0xb8a888, roofColor: 0x654321 },
        { x: 400, z: 350, w: 14, h: 9, d: 12, color: 0xd4a574, roofColor: 0x8B4513 },
        { x: -400, z: 350, w: 12, h: 8, d: 10, color: 0xc8b090, roofColor: 0x8B4513 },
        { x: 400, z: -350, w: 12, h: 8, d: 10, color: 0xe8c9a0, roofColor: 0xa0522d },
        // Mid-ring buildings
        { x: 200, z: 100, w: 10, h: 7, d: 10, color: 0xe0c8a0, roofColor: 0x8B4513 },
        { x: -200, z: -50, w: 16, h: 11, d: 14, color: 0xb0a090, roofColor: 0x654321 },
        { x: 150, z: -120, w: 12, h: 8, d: 10, color: 0xd4a574, roofColor: 0x8B4513 },
        { x: -170, z: 120, w: 14, h: 10, d: 12, color: 0xc4956a, roofColor: 0x8B4513 },
    ];
    buildingConfigs.forEach(cfg => {
        createBuilding(cfg.x, cfg.z, cfg.w, cfg.h, cfg.d, cfg.color, cfg.roofColor);
    });
}

function createBuilding(x, z, w, h, d, color, roofColor) {
    const group = new THREE.Group();
    const wallMat = new THREE.MeshLambertMaterial({ color });
    const wallThickness = 0.4;
    const doorWidth = 3;
    const doorHeight = 5;

    // Floor inside building
    const floorGeo = new THREE.PlaneGeometry(w - wallThickness * 2, d - wallThickness * 2);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0.06, 0);
    floor.receiveShadow = true;
    group.add(floor);

    // Back wall (full, no door)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(w, h, wallThickness), wallMat);
    backWall.position.set(0, h / 2, -d / 2);
    backWall.castShadow = true; backWall.receiveShadow = true;
    group.add(backWall);

    // Left wall (full)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, h, d), wallMat);
    leftWall.position.set(-w / 2, h / 2, 0);
    leftWall.castShadow = true; leftWall.receiveShadow = true;
    group.add(leftWall);

    // Right wall (full)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, h, d), wallMat);
    rightWall.position.set(w / 2, h / 2, 0);
    rightWall.castShadow = true; rightWall.receiveShadow = true;
    group.add(rightWall);

    // Front wall with door gap - split into left and right sections + top section above door
    const frontLeftW = (w - doorWidth) / 2;
    const frontLeftWall = new THREE.Mesh(new THREE.BoxGeometry(frontLeftW, h, wallThickness), wallMat);
    frontLeftWall.position.set(-w / 2 + frontLeftW / 2, h / 2, d / 2);
    frontLeftWall.castShadow = true; frontLeftWall.receiveShadow = true;
    group.add(frontLeftWall);

    const frontRightWall = new THREE.Mesh(new THREE.BoxGeometry(frontLeftW, h, wallThickness), wallMat);
    frontRightWall.position.set(w / 2 - frontLeftW / 2, h / 2, d / 2);
    frontRightWall.castShadow = true; frontRightWall.receiveShadow = true;
    group.add(frontRightWall);

    const aboveDoorH = h - doorHeight;
    if (aboveDoorH > 0) {
        const aboveDoor = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, aboveDoorH, wallThickness), wallMat);
        aboveDoor.position.set(0, doorHeight + aboveDoorH / 2, d / 2);
        aboveDoor.castShadow = true;
        group.add(aboveDoor);
    }

    // Roof
    const roofGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.75, 4, 4);
    const roofMat = new THREE.MeshLambertMaterial({ color: roofColor });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, h + 2, 0);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // Windows on side walls
    const winMat = new THREE.MeshLambertMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5 });
    for (let side of [-1, 1]) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), winMat);
        win.position.set(side * w / 2 + side * 0.05, h * 0.6, 0);
        win.rotation.y = Math.PI / 2;
        group.add(win);
    }

    group.position.set(x, 0, z);
    scene.add(group);

    // Store wall segments for collision (each wall is a line segment with thickness)
    const halfDoor = doorWidth / 2;
    buildings.push({
        x, z, w, h, d,
        walls: [
            // Back wall
            { x1: x - w/2, z1: z - d/2, x2: x + w/2, z2: z - d/2 },
            // Left wall
            { x1: x - w/2, z1: z - d/2, x2: x - w/2, z2: z + d/2 },
            // Right wall
            { x1: x + w/2, z1: z - d/2, x2: x + w/2, z2: z + d/2 },
            // Front wall left of door
            { x1: x - w/2, z1: z + d/2, x2: x - halfDoor, z2: z + d/2 },
            // Front wall right of door
            { x1: x + halfDoor, z1: z + d/2, x2: x + w/2, z2: z + d/2 },
        ]
    });
}

// ---- ROCKS ----
function createRocks() {
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    for (let i = 0; i < ROCK_COUNT; i++) {
        const rx = (Math.random() - 0.5) * MAP_SIZE * 0.9;
        const rz = (Math.random() - 0.5) * MAP_SIZE * 0.9;
        if (checkBuildingCollision(rx, rz, 5)) continue;
        const size = 1 + Math.random() * 3;
        const geo = new THREE.DodecahedronGeometry(size, 0);
        const mesh = new THREE.Mesh(geo, rockMat.clone());
        mesh.material.color.setHex(0x666666 + Math.floor(Math.random() * 0x333333));
        mesh.position.set(rx, size * 0.45, rz);
        mesh.rotation.set(Math.random(), Math.random(), Math.random());
        mesh.scale.set(1, 0.5 + Math.random() * 0.5, 1);
        mesh.castShadow = true; mesh.receiveShadow = true;
        scene.add(mesh);
        rocks.push({ x: rx, z: rz, radius: size });
    }
}

// ---- TREES ----
function createTrees() {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B5A2B });
    for (let i = 0; i < TREE_COUNT; i++) {
        const tx = (Math.random() - 0.5) * MAP_SIZE * 0.95;
        const tz = (Math.random() - 0.5) * MAP_SIZE * 0.95;
        if (checkBuildingCollision(tx, tz, 4)) continue;
        const group = new THREE.Group();
        const trunkH = 4 + Math.random() * 4;
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, trunkH, 6), trunkMat);
        trunk.position.y = trunkH / 2;
        trunk.castShadow = true;
        group.add(trunk);
        const isPine = Math.random() > 0.5;
        if (isPine) {
            for (let j = 0; j < 3; j++) {
                const coneR = 3 - j * 0.7;
                const cone = new THREE.Mesh(
                    new THREE.ConeGeometry(coneR, 3.5, 6),
                    new THREE.MeshLambertMaterial({ color: 0x1a5e1a + Math.floor(Math.random() * 0x0a2a0a) })
                );
                cone.position.y = trunkH - 0.5 + j * 2;
                cone.castShadow = true;
                group.add(cone);
            }
        } else {
            const leafGeo = new THREE.SphereGeometry(2.5 + Math.random() * 1.5, 6, 5);
            const leafMat = new THREE.MeshLambertMaterial({ color: 0x228822 + Math.floor(Math.random() * 0x114411) });
            const leaves = new THREE.Mesh(leafGeo, leafMat);
            leaves.position.y = trunkH + 1;
            leaves.castShadow = true;
            group.add(leaves);
        }
        group.position.set(tx, 0, tz);
        scene.add(group);
        trees.push({ x: tx, z: tz, radius: 1.2 });
    }
}

// ---- LOOT ----
function createLoot() {
    const types = [
        { type: 'health', label: '+30 HP', color: 0x00ff44, emoji: '❤' },
        { type: 'ammo', label: '+30 Ammo', color: 0xffff00, emoji: '🔫' },
        { type: 'shield', label: '+25 Shield', color: 0x4488ff, emoji: '🛡' },
        { type: 'grenade', label: '+1 Grenade', color: 0xff8800, emoji: '💣' },
    ];
    for (let i = 0; i < LOOT_COUNT; i++) {
        const t = types[Math.floor(Math.random() * types.length)];
        const x = (Math.random() - 0.5) * MAP_SIZE * 0.85;
        const z = (Math.random() - 0.5) * MAP_SIZE * 0.85;
        const geo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        const mat = new THREE.MeshLambertMaterial({ color: t.color, emissive: t.color, emissiveIntensity: 0.3 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, 1.2, z);
        scene.add(mesh);
        // Glow beam
        const beamGeo = new THREE.CylinderGeometry(0.05, 0.5, 6, 6);
        const beamMat = new THREE.MeshBasicMaterial({ color: t.color, transparent: true, opacity: 0.15 });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(x, 4, z);
        scene.add(beam);
        lootItems.push({ x, z, type: t.type, label: t.label, mesh, beam, active: true });
    }
}

// ---- ZONE VISUAL ----
function createZoneVisual() {
    const geo = new THREE.RingGeometry(zoneRadius - 1, zoneRadius + 1, 64);
    const mat = new THREE.MeshBasicMaterial({ color: 0x3366ff, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.5;
    scene.add(ring);
    scene.userData.zoneRing = ring;
    // Wall cylinder - tall red wall
    const wallGeo = new THREE.CylinderGeometry(zoneRadius, zoneRadius, 200, 64, 1, true);
    const wallMat = new THREE.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(zoneCenterX, 100, zoneCenterZ);
    scene.add(wall);
    scene.userData.zoneWall = wall;
}

function updateZoneVisual() {
    const ring = scene.userData.zoneRing;
    const wall = scene.userData.zoneWall;
    if (ring) {
        scene.remove(ring);
        const geo = new THREE.RingGeometry(zoneRadius - 1, zoneRadius + 1, 64);
        const newRing = new THREE.Mesh(geo, ring.material);
        newRing.rotation.x = -Math.PI / 2;
        newRing.position.set(zoneCenterX, 0.5, zoneCenterZ);
        scene.add(newRing);
        scene.userData.zoneRing = newRing;
    }
    if (wall) {
        scene.remove(wall);
        const wallGeo = new THREE.CylinderGeometry(zoneRadius, zoneRadius, 200, 64, 1, true);
        const newWall = new THREE.Mesh(wallGeo, wall.material);
        newWall.position.set(zoneCenterX, 100, zoneCenterZ);
        scene.add(newWall);
        scene.userData.zoneWall = newWall;
    }
}

// ---- PLAYER ----
function initPlayer() {
    player = { x: 0, z: 0, y: PLAYER_HEIGHT };
    playerHealth = MAX_HP;
    playerShield = 0;
}

// ---- FIRST PERSON WEAPON ----
function createFPWeapon() {
    fpWeaponGroup = new THREE.Group();
    // Gun body
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.7),
        new THREE.MeshLambertMaterial({ color: 0x444444 })
    );
    body.position.set(0.3, -0.2, -0.5);
    fpWeaponGroup.add(body);
    // Barrel
    const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6),
        new THREE.MeshLambertMaterial({ color: 0x333333 })
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.3, -0.18, -0.9);
    fpWeaponGroup.add(barrel);
    // Grip
    const grip = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.2, 0.08),
        new THREE.MeshLambertMaterial({ color: 0x3a2a1a })
    );
    grip.position.set(0.3, -0.35, -0.35);
    fpWeaponGroup.add(grip);
    // Muzzle flash
    const flashGeo = new THREE.SphereGeometry(0.12, 6, 4);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0 });
    const flash = new THREE.Mesh(flashGeo, flashMat);
    flash.position.set(0.3, -0.18, -1.05);
    fpWeaponGroup.add(flash);
    fpWeaponGroup.userData.flash = flash;
    camera.add(fpWeaponGroup);
}

// ---- NAME SPRITES ----
function makeNameSprite(name) {
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    var ctx = canvas.getContext('2d');
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(name, 128, 32);
    var tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    var sprite = new THREE.Sprite(mat);
    sprite.scale.set(4, 1, 1);
    return sprite;
}

// ---- ENEMIES ----
function createEnemies() {
    const names = ['Shadow','Ghost','Viper','Hawk','Wolf','Raven','Storm','Blade','Fox','Cobra','Eagle','Tiger','Snake','Bear','Lynx','Shark','Crow','Bull','Puma','Falcon',
        'Blaze','Frost','Reaper','Ace','Doom','Spark','Dagger','Scar','Bolt','Claw','Wraith','Ridge','Havoc','Fang','Rift','Jett'];
    for (let i = 0; i < ENEMY_COUNT; i++) {
        const ex = (Math.random() - 0.5) * MAP_SIZE * 0.8;
        const ez = (Math.random() - 0.5) * MAP_SIZE * 0.8;
        const group = new THREE.Group();
        // Body
        const bodyColor = Math.random() * 0xffffff;
        const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor });
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.8, 0.9), bodyMat);
        body.position.y = 2.3;
        group.add(body);
        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), new THREE.MeshLambertMaterial({ color: 0xf5c6a0 }));
        head.position.y = 3.6;
        group.add(head);
        // Legs
        const legMat = new THREE.MeshLambertMaterial({ color: 0x2a2a4a });
        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.3, 0.45), legMat);
        legL.position.set(-0.3, 0.65, 0);
        group.add(legL);
        const legR = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.3, 0.45), legMat);
        legR.position.set(0.3, 0.65, 0);
        group.add(legR);
        // Arms
        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.4, 0.35), bodyMat);
        armL.position.set(-1, 2.3, 0);
        group.add(armL);
        const armR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.4, 0.35), bodyMat);
        armR.position.set(1, 2.3, 0);
        group.add(armR);
        // Hat
        if (Math.random() > 0.4) {
            const hat = new THREE.Mesh(
                new THREE.CylinderGeometry(0.55, 0.6, 0.4, 8),
                new THREE.MeshLambertMaterial({ color: Math.random() > 0.5 ? 0x333333 : 0x8B0000 })
            );
            hat.position.y = 4.05;
            group.add(hat);
        }
        // Name label sprite
        const botName = names[i] || ('Bot_' + (i + 1));
        const nameSprite = makeNameSprite(botName);
        nameSprite.position.y = 5.0;
        group.add(nameSprite);
        group.position.set(ex, 0, ez);
        scene.add(group);
        const weaponIdx = Math.floor(Math.random() * WEAPONS.length);
        enemies.push({
            mesh: group, x: ex, z: ez,
            health: MAX_HP,
            name: botName,
            speed: 5 + Math.random() * 4,
            sightRange: 35 + Math.random() * 25,
            accuracy: 0.14 + Math.random() * 0.1,
            damage: WEAPONS[weaponIdx].damage * 0.35,
            fireRate: WEAPONS[weaponIdx].fireRate * 2.5,
            fireTimer: Math.random() * 2,
            state: 'wander',
            stateTimer: Math.random() * 5,
            targetX: ex, targetZ: ez,
            animTimer: Math.random() * 10,
            alive: true,
        });
    }
}

// ---- CONTROLS ----
function setupControls() {
    // Keyboard
    document.addEventListener('keydown', e => {
        if (!gameStarted || gameOver) return;
        keys[e.code] = true;
        if (e.code === 'Digit1') switchWeapon(0);
        if (e.code === 'Digit2') switchWeapon(1);
        if (e.code === 'Digit3') switchWeapon(2);
        if (e.code === 'KeyR') startReload();
        if (e.code === 'KeyE') tryPickup();
        if (e.code === 'KeyG') throwGrenade();
        if (e.code === 'KeyC') toggleCrouch();
    });
    document.addEventListener('keyup', e => { keys[e.code] = false; });

    // Mouse + keyboard always registered (works on desktop & touchscreen laptops)
    document.addEventListener('mousedown', e => {
        if (!gameStarted || gameOver) return;
        if (e.button === 0) mouseDown = true;
        if (e.button === 2) { rightMouseDown = true; toggleADS(true); }
    });
    document.addEventListener('mouseup', e => {
        if (e.button === 0) mouseDown = false;
        if (e.button === 2) { rightMouseDown = false; toggleADS(false); }
    });
    document.addEventListener('mousemove', e => {
        if (!gameStarted || gameOver || !document.pointerLockElement) return;
        yaw -= e.movementX * 0.002;
        pitch -= e.movementY * 0.002;
        pitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, pitch));
    });
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Mobile touch controls (only on real mobile devices)
    if (isMobile) {
        setupMobileControls();
    }

    // Start + restart
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', () => {
        document.getElementById('game-over').style.opacity = '0';
        setTimeout(() => location.reload(), 200);
    });

    // Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ---- MOBILE CONTROLS ----
function setupMobileControls() {
    const joystickZone = document.getElementById('joystick-zone');
    const joystickThumb = document.getElementById('joystick-thumb');
    let joystickTouchId = null;
    const joyCenter = { x: 75, y: 75 };
    const joyMaxDist = 50;

    // Movement joystick
    joystickZone.addEventListener('touchstart', e => {
        e.preventDefault();
        const t = e.changedTouches[0];
        joystickTouchId = t.identifier;
        joystickActive = true;
    }, { passive: false });

    joystickZone.addEventListener('touchmove', e => {
        e.preventDefault();
        for (const t of e.changedTouches) {
            if (t.identifier === joystickTouchId) {
                const rect = joystickZone.getBoundingClientRect();
                let dx = t.clientX - rect.left - joyCenter.x;
                let dy = t.clientY - rect.top - joyCenter.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > joyMaxDist) { dx = dx / dist * joyMaxDist; dy = dy / dist * joyMaxDist; }
                joystickThumb.style.left = (joyCenter.x + dx) + 'px';
                joystickThumb.style.top = (joyCenter.y + dy) + 'px';
                joystickThumb.style.transform = 'translate(-50%,-50%)';
                mobileMove.x = dx / joyMaxDist;
                mobileMove.y = dy / joyMaxDist;
            }
        }
    }, { passive: false });

    const resetJoystick = (e) => {
        for (const t of e.changedTouches) {
            if (t.identifier === joystickTouchId) {
                joystickTouchId = null;
                joystickActive = false;
                mobileMove.x = 0; mobileMove.y = 0;
                joystickThumb.style.left = '50%';
                joystickThumb.style.top = '50%';
                joystickThumb.style.transform = 'translate(-50%,-50%)';
            }
        }
    };
    joystickZone.addEventListener('touchend', resetJoystick, { passive: false });
    joystickZone.addEventListener('touchcancel', resetJoystick, { passive: false });

    // Look zone (camera)
    const lookZone = document.getElementById('look-zone');
    lookZone.addEventListener('touchstart', e => {
        if (lookTouchId !== null) return;
        const t = e.changedTouches[0];
        lookTouchId = t.identifier;
        lastLookX = t.clientX;
        lastLookY = t.clientY;
    }, { passive: true });

    lookZone.addEventListener('touchmove', e => {
        for (const t of e.changedTouches) {
            if (t.identifier === lookTouchId) {
                const dx = t.clientX - lastLookX;
                const dy = t.clientY - lastLookY;
                yaw -= dx * 0.004;
                pitch -= dy * 0.004;
                pitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, pitch));
                lastLookX = t.clientX;
                lastLookY = t.clientY;
            }
        }
    }, { passive: true });

    const resetLook = (e) => {
        for (const t of e.changedTouches) {
            if (t.identifier === lookTouchId) lookTouchId = null;
        }
    };
    lookZone.addEventListener('touchend', resetLook);
    lookZone.addEventListener('touchcancel', resetLook);

    // Fire button — supports fire + look (drag to aim while holding fire)
    const btnFire = document.getElementById('btn-fire');
    let fireTouchId = null;
    let fireLastX = 0, fireLastY = 0;

    btnFire.addEventListener('touchstart', e => {
        e.preventDefault();
        const t = e.changedTouches[0];
        fireTouchId = t.identifier;
        fireLastX = t.clientX;
        fireLastY = t.clientY;
        mobileFiring = true;
        mouseDown = true;
        btnFire.classList.add('firing');
    }, { passive: false });

    btnFire.addEventListener('touchmove', e => {
        e.preventDefault();
        for (const t of e.changedTouches) {
            if (t.identifier === fireTouchId) {
                const dx = t.clientX - fireLastX;
                const dy = t.clientY - fireLastY;
                yaw -= dx * 0.004;
                pitch -= dy * 0.004;
                pitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, pitch));
                fireLastX = t.clientX;
                fireLastY = t.clientY;
            }
        }
    }, { passive: false });

    const resetFire = (e) => {
        for (const t of e.changedTouches) {
            if (t.identifier === fireTouchId) {
                fireTouchId = null;
                mobileFiring = false;
                mouseDown = false;
                btnFire.classList.remove('firing');
            }
        }
    };
    btnFire.addEventListener('touchend', resetFire, { passive: false });
    btnFire.addEventListener('touchcancel', resetFire, { passive: false });

    // ADS button
    const btnAds = document.getElementById('btn-ads');
    btnAds.addEventListener('touchstart', e => { e.preventDefault(); toggleADS(!isADS); btnAds.classList.toggle('active', isADS); }, { passive: false });

    // Jump button
    document.getElementById('btn-jump').addEventListener('touchstart', e => { e.preventDefault(); if (isGrounded) { velocityY = 10; isGrounded = false; } }, { passive: false });

    // Crouch button
    const btnCrouch = document.getElementById('btn-crouch');
    btnCrouch.addEventListener('touchstart', e => { e.preventDefault(); toggleCrouch(); btnCrouch.classList.toggle('active', isCrouching); }, { passive: false });

    // Reload button
    document.getElementById('btn-reload').addEventListener('touchstart', e => { e.preventDefault(); startReload(); }, { passive: false });

    // Grenade button
    document.getElementById('btn-grenade').addEventListener('touchstart', e => { e.preventDefault(); throwGrenade(); }, { passive: false });

    // Pickup button
    document.getElementById('btn-pickup').addEventListener('touchstart', e => { e.preventDefault(); tryPickup(); }, { passive: false });

    // Run/Sprint button (toggle like Free Fire)
    const btnRun = document.getElementById('btn-run');
    btnRun.addEventListener('touchstart', e => {
        e.preventDefault();
        isSprinting = !isSprinting;
        if (isSprinting) isCrouching = false;
        btnRun.classList.toggle('active', isSprinting);
        document.getElementById('btn-crouch').classList.remove('active');
        document.getElementById('stance-indicator').textContent = isSprinting ? 'Sprinting' : 'Standing';
    }, { passive: false });

    // Weapon strip
    document.querySelectorAll('.ws-btn').forEach(btn => {
        btn.addEventListener('touchstart', e => {
            e.preventDefault();
            const idx = parseInt(btn.dataset.wep);
            switchWeapon(idx);
            document.querySelectorAll('.ws-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }, { passive: false });
    });

    // Layout editor
    setupLayoutEditor();
}

// ---- LAYOUT EDITOR ----
function setupLayoutEditor() {
    var editBtn = document.getElementById('btn-edit-layout');
    var saveBtn = document.getElementById('layout-save');
    var resetBtn = document.getElementById('layout-reset');
    var editing = false;
    var dragTarget = null;
    var dragOffX = 0, dragOffY = 0;
    var draggables = ['btn-fire','btn-ads','btn-jump','btn-crouch','btn-reload','btn-grenade','btn-run','joystick-zone','weapon-strip'];

    // Load saved positions
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem('mr-layout')); } catch(e) {}
    if (saved) {
        for (var id in saved) {
            var el = document.getElementById(id);
            if (el && saved[id]) {
                el.style.left = saved[id].left;
                el.style.top = saved[id].top;
                el.style.right = 'auto';
                el.style.bottom = 'auto';
                el.style.transform = 'none';
            }
        }
    }

    editBtn.addEventListener('touchstart', function(ev) {
        ev.preventDefault();
        editing = !editing;
        editBtn.classList.toggle('editing', editing);
        document.body.classList.toggle('layout-editing', editing);
        saveBtn.style.display = editing ? 'block' : 'none';
    }, { passive: false });

    saveBtn.addEventListener('touchstart', function(ev) {
        ev.preventDefault();
        var positions = {};
        draggables.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) {
                positions[id] = { left: el.style.left, top: el.style.top };
            }
        });
        localStorage.setItem('mr-layout', JSON.stringify(positions));
        editing = false;
        editBtn.classList.remove('editing');
        document.body.classList.remove('layout-editing');
        saveBtn.style.display = 'none';
    }, { passive: false });

    resetBtn.addEventListener('touchstart', function(ev) {
        ev.preventDefault();
        localStorage.removeItem('mr-layout');
        draggables.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) {
                el.style.left = '';
                el.style.top = '';
                el.style.right = '';
                el.style.bottom = '';
                el.style.transform = '';
            }
        });
        editing = false;
        editBtn.classList.remove('editing');
        document.body.classList.remove('layout-editing');
        saveBtn.style.display = 'none';
    }, { passive: false });

    document.addEventListener('touchstart', function(ev) {
        if (!editing) return;
        var t = ev.touches[0];
        for (var i = 0; i < draggables.length; i++) {
            var el = document.getElementById(draggables[i]);
            if (!el) continue;
            var r = el.getBoundingClientRect();
            if (t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom) {
                dragTarget = el;
                dragOffX = t.clientX - r.left;
                dragOffY = t.clientY - r.top;
                ev.preventDefault();
                return;
            }
        }
    }, { passive: false });

    document.addEventListener('touchmove', function(ev) {
        if (!editing || !dragTarget) return;
        ev.preventDefault();
        var t = ev.touches[0];
        dragTarget.style.left = (t.clientX - dragOffX) + 'px';
        dragTarget.style.top = (t.clientY - dragOffY) + 'px';
        dragTarget.style.right = 'auto';
        dragTarget.style.bottom = 'auto';
        dragTarget.style.transform = 'none';
    }, { passive: false });

    document.addEventListener('touchend', function() {
        dragTarget = null;
    });
}

function startGame() {
    var startScreen = document.getElementById('start-screen');
    startScreen.classList.add('hidden');
    setTimeout(function() { startScreen.style.display = 'none'; }, 400);
    gameStarted = true;
    // Cache DOM elements for game loop
    _dom.reloadBar = document.getElementById('reload-bar');
    _dom.aimLock = document.getElementById('aim-lock');
    _dom.compass = document.getElementById('compass');
    _dom.healthVal = document.getElementById('health-val');
    _dom.shieldVal = document.getElementById('shield-val');
    _dom.healthBar = document.getElementById('health-bar');
    _dom.shieldBar = document.getElementById('shield-bar');
    _dom.btnPickup = document.getElementById('btn-pickup');
    _dom.interactPrompt = document.getElementById('interact-prompt');
    getAudioCtx();
    if (!isMobile) {
        renderer.domElement.requestPointerLock();
    } else {
        var el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen({navigationUI:'hide'}).catch(function(){});
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    }
}

// ---- WEAPONS ----
function resetWeaponAmmo() {
    const w = WEAPONS[currentWeaponIndex];
    weaponMag = w.magSize;
    weaponReserve = w.reserveAmmo;
    updateAmmoHUD();
}

function switchWeapon(index) {
    if (index === currentWeaponIndex || isReloading) return;
    currentWeaponIndex = index;
    resetWeaponAmmo();
    document.getElementById('weapon-name').textContent = WEAPONS[index].name;
    document.getElementById('weapon-mode').textContent = WEAPONS[index].mode;
    if (isADS) toggleADS(false);
}

function startReload() {
    if (isReloading) return;
    const w = WEAPONS[currentWeaponIndex];
    if (weaponMag >= w.magSize || weaponReserve <= 0) return;
    isReloading = true;
    reloadTimer = w.reloadTime;
    reloadDuration = w.reloadTime;
    document.getElementById('reload-bar-wrap').style.display = 'block';
    playSound('reload');
}

function finishReload() {
    const w = WEAPONS[currentWeaponIndex];
    const needed = w.magSize - weaponMag;
    const available = Math.min(needed, weaponReserve);
    weaponMag += available;
    weaponReserve -= available;
    isReloading = false;
    document.getElementById('reload-bar-wrap').style.display = 'none';
    document.getElementById('reload-bar').style.width = '0%';
    updateAmmoHUD();
}

function updateAmmoHUD() {
    document.getElementById('ammo-val').textContent = weaponMag + '/' + weaponReserve;
    const w = WEAPONS[currentWeaponIndex];
    document.getElementById('ammo-val').classList.toggle('low-ammo', weaponMag <= Math.ceil(w.magSize * 0.25) && weaponMag > 0);
}

// ---- ADS / CROUCH ----
function toggleADS(on) {
    if (on === undefined) on = !isADS;
    isADS = on;
    const w = WEAPONS[currentWeaponIndex];
    if (isADS) {
        camera.fov = 75 / w.adsZoom;
        document.getElementById('ads-overlay').classList.add('active');
        if (fpWeaponGroup) fpWeaponGroup.visible = false;
    } else {
        camera.fov = 75;
        document.getElementById('ads-overlay').classList.remove('active');
        if (fpWeaponGroup) fpWeaponGroup.visible = true;
    }
    camera.updateProjectionMatrix();
}

function toggleCrouch() {
    isCrouching = !isCrouching;
    if (isCrouching) { isSprinting = false; document.getElementById('btn-run').classList.remove('active'); }
    document.getElementById('stance-indicator').textContent = isCrouching ? 'Crouching' : 'Standing';
}

// ---- SHOOTING ----
function playerShoot() {
    if (isReloading || weaponMag <= 0) {
        if (weaponMag <= 0) startReload();
        return;
    }
    const w = WEAPONS[currentWeaponIndex];
    const spread = isADS ? w.adsSpread : w.spread;
    const pellets = w.pellets || 1;

    for (let p = 0; p < pellets; p++) {
        const dir = new THREE.Vector3(0, 0, -1);
        dir.applyAxisAngle(new THREE.Vector3(1, 0, 0), pitch + (Math.random() - 0.5) * spread);
        dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw + (Math.random() - 0.5) * spread);
        const bulletMesh = new THREE.Mesh(_bulletGeo, _bulletMatPlayer);
        bulletMesh.position.copy(camera.position);
        scene.add(bulletMesh);
        bullets.push({ mesh: bulletMesh, dir: dir.clone(), speed: BULLET_SPEED, damage: w.damage, owner: 'player', life: 2 });
    }
    // Muzzle flash
    if (fpWeaponGroup && fpWeaponGroup.userData.flash) {
        const fl = fpWeaponGroup.userData.flash;
        fl.material.opacity = 1;
        setTimeout(() => { fl.material.opacity = 0; }, 50);
    }
    weaponMag--;
    updateAmmoHUD();
    playSound('shoot');
    // Camera recoil kick
    const w2 = WEAPONS[currentWeaponIndex];
    recoilPitch += (isADS ? 0.003 : 0.006) * (w2.name === 'Shotgun' ? 2.5 : 1);
    pitch += (isADS ? 0.003 : 0.006) * (w2.name === 'Shotgun' ? 2.5 : 1);
    yaw += (Math.random() - 0.5) * 0.002;
    if (weaponMag <= 0) startReload();
}

function showHitmarker() {
    const hm = document.getElementById('hitmarker');
    hm.style.opacity = '1';
    clearTimeout(_hitmarkerTimeout);
    _hitmarkerTimeout = setTimeout(() => { hm.style.opacity = '0'; }, 120);
}

function enemyShoot(enemy) {
    const dx = player.x - enemy.x;
    const dy = player.y - 2;
    const dz = player.z - enemy.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const dir = new THREE.Vector3(
        dx / dist + (Math.random() - 0.5) * enemy.accuracy,
        dy / dist + (Math.random() - 0.5) * enemy.accuracy,
        dz / dist + (Math.random() - 0.5) * enemy.accuracy
    ).normalize();
    const bulletMesh = new THREE.Mesh(_bulletGeo, _bulletMatEnemy);
    bulletMesh.position.set(enemy.x, 2.5, enemy.z);
    scene.add(bulletMesh);
    bullets.push({ mesh: bulletMesh, dir, speed: BULLET_SPEED * 0.55, damage: enemy.damage, owner: 'enemy', life: 2, sourceX: enemy.x, sourceZ: enemy.z });
}

// ---- GRENADE ----
function throwGrenade() {
    if (grenadeCount <= 0) return;
    grenadeCount--;
    document.getElementById('grenade-val').textContent = grenadeCount;
    const dir = new THREE.Vector3(0, 0.3, -1);
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    dir.normalize();
    const geo = new THREE.SphereGeometry(0.3, 8, 6);
    const mat = new THREE.MeshLambertMaterial({ color: 0x556633 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(camera.position);
    scene.add(mesh);
    grenades.push({
        mesh,
        vel: { x: dir.x * 30, y: 12, z: dir.z * 30 },
        timer: 2.5,
    });
}

function explodeGrenade(g) {
    scene.remove(g.mesh);
    playSound('explode');
    // Spawn visual explosion
    spawnExplosion(g.mesh.position.x, g.mesh.position.y, g.mesh.position.z);
    // Damage nearby
    const gx = g.mesh.position.x, gz = g.mesh.position.z;
    for (const e of enemies) {
        if (!e.alive) continue;
        const dx = e.x - gx, dz = e.z - gz;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 15) {
            const dmg = Math.round(80 * (1 - dist / 15));
            e.health -= dmg;
            if (e.health <= 0) killEnemy(e);
            else { e.state = 'combat'; e.stateTimer = 5; }
        }
    }
    // Damage player
    const pdx = player.x - gx, pdz = player.z - gz;
    const pDist = Math.sqrt(pdx * pdx + pdz * pdz);
    if (pDist < 15) {
        const dmg = Math.round(60 * (1 - pDist / 15));
        applyDamageToPlayer(dmg, gx, gz);
    }
}

// ---- PARTICLES ----
function spawnParticles(x, y, z, color, count) {
    for (let i = 0; i < count; i++) {
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
        const mesh = new THREE.Mesh(_particleGeo, mat);
        mesh.position.set(x, y, z);
        scene.add(mesh);
        particles.push({
            mesh,
            vel: { x: (Math.random()-0.5)*12, y: Math.random()*8+2, z: (Math.random()-0.5)*12 },
            life: 0.5 + Math.random() * 0.5,
        });
    }
}

function spawnExplosion(x, y, z) {
    // Flash sphere
    const flashGeo = new THREE.SphereGeometry(4, 8, 6);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.7 });
    const flash = new THREE.Mesh(flashGeo, flashMat);
    flash.position.set(x, y, z);
    scene.add(flash);
    setTimeout(() => scene.remove(flash), 200);
    spawnParticles(x, y, z, 0xff4400, 15);
    spawnParticles(x, y, z, 0xffaa00, 10);
}

// ---- PICKUP ----
function tryPickup() {
    for (const loot of lootItems) {
        if (!loot.active) continue;
        const dx = player.x - loot.x;
        const dz = player.z - loot.z;
        if (dx * dx + dz * dz < 16) {
            loot.active = false;
            scene.remove(loot.mesh);
            scene.remove(loot.beam);
            if (loot.type === 'health') {
                playerHealth = Math.min(MAX_HP, playerHealth + 30);
            } else if (loot.type === 'ammo') {
                weaponReserve += 30;
                updateAmmoHUD();
            } else if (loot.type === 'shield') {
                playerShield = Math.min(MAX_SHIELD, playerShield + 25);
            } else if (loot.type === 'grenade') {
                grenadeCount++;
                document.getElementById('grenade-val').textContent = grenadeCount;
            }
            showPickupMsg(loot.label);
            playSound('pickup');
            updateBarsHUD();
            break;
        }
    }
}

function showPickupMsg(text) {
    const el = document.getElementById('pickup-msg');
    el.textContent = text;
    el.style.opacity = '1';
    clearTimeout(_pickupTimeout);
    _pickupTimeout = setTimeout(() => { el.style.opacity = '0'; }, 1500);
}

// ---- DAMAGE ----
function applyDamageToPlayer(amount, srcX, srcZ) {
    // Shield absorbs first
    if (playerShield > 0) {
        const absorbed = Math.min(playerShield, amount);
        playerShield -= absorbed;
        amount -= absorbed;
    }
    playerHealth -= amount;
    showDamageFlash();
    showDamageDirection(srcX, srcZ);
    updateBarsHUD();
    if (playerHealth <= 0) endGame(false);
}

function showDamageFlash() {
    const el = document.getElementById('damage-flash');
    el.style.opacity = '1';
    clearTimeout(_dmgFlashTimeout);
    _dmgFlashTimeout = setTimeout(() => { el.style.opacity = '0'; }, 150);
}

function showDamageDirection(srcX, srcZ) {
    if (srcX === undefined) return;
    const dx = srcX - player.x;
    const dz = srcZ - player.z;
    const angle = Math.atan2(dx, dz);
    const rel = angle - yaw;
    const norm = ((rel % (Math.PI*2)) + Math.PI*3) % (Math.PI*2) - Math.PI;
    const arrows = {
        top: document.querySelector('.dmg-top'),
        bot: document.querySelector('.dmg-bot'),
        left: document.querySelector('.dmg-left'),
        right: document.querySelector('.dmg-right'),
    };
    Object.values(arrows).forEach(a => { a.style.opacity = '0'; });
    if (norm > -Math.PI * 0.75 && norm < -Math.PI * 0.25) arrows.left.style.opacity = '1';
    else if (norm > Math.PI * 0.25 && norm < Math.PI * 0.75) arrows.right.style.opacity = '1';
    else if (Math.abs(norm) < Math.PI * 0.35) arrows.top.style.opacity = '1';
    else arrows.bot.style.opacity = '1';
    clearTimeout(_dmgDirTimeout);
    _dmgDirTimeout = setTimeout(() => Object.values(arrows).forEach(a => { a.style.opacity = '0'; }), 800);
}

// ---- COLLISION ----
function checkBuildingCollision(x, z, radius) {
    for (const b of buildings) {
        for (const wall of b.walls) {
            // Point-to-line-segment distance
            const dx = wall.x2 - wall.x1;
            const dz = wall.z2 - wall.z1;
            const len2 = dx * dx + dz * dz;
            let t = len2 > 0 ? ((x - wall.x1) * dx + (z - wall.z1) * dz) / len2 : 0;
            t = Math.max(0, Math.min(1, t));
            const closestX = wall.x1 + t * dx;
            const closestZ = wall.z1 + t * dz;
            const distX = x - closestX;
            const distZ = z - closestZ;
            const wallThick = 0.4;
            if (distX * distX + distZ * distZ < (radius + wallThick) * (radius + wallThick)) return true;
        }
    }
    return false;
}

function checkTreeCollision(x, z, radius) {
    for (const t of trees) {
        const dx = x - t.x;
        const dz = z - t.z;
        if (dx * dx + dz * dz < (radius + t.radius) * (radius + t.radius)) return true;
    }
    return false;
}

function checkRockCollision(x, z, radius) {
    for (const r of rocks) {
        const dx = x - r.x;
        const dz = z - r.z;
        if (dx * dx + dz * dz < (radius + r.radius) * (radius + r.radius)) return true;
    }
    return false;
}

function checkAllCollision(x, z, radius) {
    return checkBuildingCollision(x, z, radius) || checkTreeCollision(x, z, radius) || checkRockCollision(x, z, radius);
}

// ---- UPDATE ----
function update(dt) {
    if (!gameStarted || gameOver) return;
    gameTime += dt;
    updatePlayer(dt);
    updateBullets(dt);
    updateEnemies(dt);
    updateZone(dt);
    updateGrenades(dt);
    updateParticles(dt);
    updateClouds(dt);

    // Reload
    if (isReloading) {
        reloadTimer -= dt;
        const pct = 1 - (reloadTimer / reloadDuration);
        _dom.reloadBar.style.width = (pct * 100) + '%';
        if (reloadTimer <= 0) finishReload();
    }

    // Shooting
    fireTimer -= dt;
    if (mouseDown && fireTimer <= 0 && !isReloading) {
        const w = WEAPONS[currentWeaponIndex];
        if (w.auto || fireTimer <= -0.1) {
            playerShoot();
            fireTimer = w.fireRate;
        }
    }

    // Loot animation
    lootItems.forEach(l => {
        if (l.active) {
            l.mesh.rotation.y += dt * 2;
            l.mesh.position.y = 1.2 + Math.sin(Date.now() * 0.003) * 0.3;
        }
    });

    // Mobile pickup button visibility
    if (isMobile) {
        let nearLoot = false;
        for (const l of lootItems) {
            if (!l.active) continue;
            const dx = player.x - l.x, dz = player.z - l.z;
            if (dx*dx + dz*dz < 25) { nearLoot = true; break; }
        }
        _dom.btnPickup.classList.toggle('visible', nearLoot);
    }

    // Interact prompt (desktop)
    if (!isMobile) {
        let nearLoot = false;
        for (const l of lootItems) {
            if (!l.active) continue;
            const dx = player.x - l.x, dz = player.z - l.z;
            if (dx*dx + dz*dz < 25) { nearLoot = true; break; }
        }
        _dom.interactPrompt.style.opacity = nearLoot ? '1' : '0';
    }

    // Compass
    updateCompass();

    // Aim lock detection - red crosshair when pointing at enemy
    var aimLocked = false;
    _aimLookDir.set(0, 0, -1);
    _aimLookDir.applyAxisAngle(_aimAxisX, pitch);
    _aimLookDir.applyAxisAngle(_aimAxisY, yaw);
    for (var ei = 0; ei < enemies.length; ei++) {
        var en = enemies[ei];
        if (!en.alive) continue;
        var tox = en.x - player.x;
        var toy = 2.5 - player.y;
        var toz = en.z - player.z;
        var toDist = Math.sqrt(tox * tox + toy * toy + toz * toz);
        if (toDist > 80) continue;
        var dot = (tox * _aimLookDir.x + toy * _aimLookDir.y + toz * _aimLookDir.z) / toDist;
        if (dot > 0.97) { aimLocked = true; break; }
    }
    _dom.aimLock.classList.toggle('locked', aimLocked);

    // HUD
    updateBarsHUD();
    drawMinimap();

    // FP weapon bob
    if (fpWeaponGroup && fpWeaponGroup.visible) {
        headBobTimer += dt * (keys['ShiftLeft'] || keys['ShiftRight'] ? 12 : 7);
        const moving = (keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD']) || (isMobile && joystickActive);
        if (moving) {
            fpWeaponGroup.position.x = 0.3 + Math.sin(headBobTimer) * 0.015;
            fpWeaponGroup.position.y = Math.sin(headBobTimer * 2) * 0.01;
        } else {
            fpWeaponGroup.position.x = 0.3;
            fpWeaponGroup.position.y = 0;
        }
    }

    if (alive <= 1 && playerHealth > 0) endGame(true);
}

function updatePlayer(dt) {
    const sprinting = keys['ShiftLeft'] || keys['ShiftRight'] || isSprinting;
    const speed = isCrouching ? 5 : (sprinting ? 16 : 9);
    const targetH = isCrouching ? CROUCH_HEIGHT : PLAYER_HEIGHT;

    const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

    let moveX = 0, moveZ = 0;

    if (isMobile) {
        // Joystick input: x = left/right, y = up/down where up means forward
        moveX += forward.x * (-mobileMove.y) + right.x * mobileMove.x;
        moveZ += forward.z * (-mobileMove.y) + right.z * mobileMove.x;
    } else {
        if (keys['KeyW']) { moveX += forward.x; moveZ += forward.z; }
        if (keys['KeyS']) { moveX -= forward.x; moveZ -= forward.z; }
        if (keys['KeyA']) { moveX -= right.x; moveZ -= right.z; }
        if (keys['KeyD']) { moveX += right.x; moveZ += right.z; }
    }

    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0) {
        moveX = (moveX / len) * speed * dt;
        moveZ = (moveZ / len) * speed * dt;
    }

    let newX = player.x + moveX;
    let newZ = player.z + moveZ;
    newX = Math.max(-HALF_MAP + 2, Math.min(HALF_MAP - 2, newX));
    newZ = Math.max(-HALF_MAP + 2, Math.min(HALF_MAP - 2, newZ));

    if (!checkAllCollision(newX, newZ, PLAYER_RADIUS)) {
        player.x = newX; player.z = newZ;
    } else if (!checkAllCollision(newX, player.z, PLAYER_RADIUS)) {
        player.x = newX;
    } else if (!checkAllCollision(player.x, newZ, PLAYER_RADIUS)) {
        player.z = newZ;
    }

    // Jump (keyboard)
    if (keys['Space'] && isGrounded) { velocityY = 10; isGrounded = false; }

    // Gravity
    velocityY += GRAVITY * dt;
    player.y += velocityY * dt;
    if (player.y <= targetH) { player.y = targetH; velocityY = 0; isGrounded = true; }

    // Head bob
    const moving = len > 0;
    if (moving && isGrounded) {
        headBobTimer += dt * speed * 0.8;
        headBob = Math.sin(headBobTimer) * 0.06;
    } else {
        headBob *= 0.9;
    }

    camera.position.set(player.x, player.y + headBob, player.z);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;

    // Recoil recovery — smoothly return camera after recoil kick
    if (recoilPitch > 0) {
        const recover = Math.min(recoilPitch, dt * 4);
        recoilPitch -= recover;
        pitch -= recover * 0.85;
    }
}

function updateBullets(dt) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.life -= dt;
        if (b.life <= 0) { scene.remove(b.mesh); bullets.splice(i, 1); continue; }
        b.mesh.position.x += b.dir.x * b.speed * dt;
        b.mesh.position.y += b.dir.y * b.speed * dt;
        b.mesh.position.z += b.dir.z * b.speed * dt;

        if (b.owner === 'player') {
            for (const enemy of enemies) {
                if (!enemy.alive) continue;
                const dx = b.mesh.position.x - enemy.x;
                const dy = b.mesh.position.y - 1.8;
                const dz = b.mesh.position.z - enemy.z;
                if (dx * dx + dy * dy + dz * dz < 4) {
                    enemy.health -= b.damage;
                    scene.remove(b.mesh);
                    bullets.splice(i, 1);
                    spawnParticles(enemy.x, 2, enemy.z, 0xff0000, 5);
                    showHitmarker();
                    playSound('hit');
                    if (enemy.health <= 0) killEnemy(enemy);
                    else { enemy.state = 'combat'; enemy.stateTimer = 5; }
                    break;
                }
            }
        }

        if (b.owner === 'enemy') {
            const dx = b.mesh.position.x - player.x;
            const dy = b.mesh.position.y - player.y;
            const dz = b.mesh.position.z - player.z;
            if (dx * dx + dy * dy + dz * dz < 3) {
                scene.remove(b.mesh);
                const srcX = b.sourceX; const srcZ = b.sourceZ;
                bullets.splice(i, 1);
                applyDamageToPlayer(b.damage, srcX, srcZ);
                continue;
            }
        }

        if (checkBuildingCollision(b.mesh.position.x, b.mesh.position.z, 0.3)) {
            scene.remove(b.mesh);
            bullets.splice(i, 1);
        }
    }
}

function killEnemy(enemy) {
    enemy.alive = false;
    scene.remove(enemy.mesh);
    kills++;
    alive--;
    document.getElementById('kills-val').textContent = kills;
    document.getElementById('alive-val').textContent = alive;
    addKillFeed('You', enemy.name);
    playSound('kill');
    spawnParticles(enemy.x, 2, enemy.z, 0xff4444, 12);
}

function updateGrenades(dt) {
    for (let i = grenades.length - 1; i >= 0; i--) {
        const g = grenades[i];
        g.timer -= dt;
        g.vel.y += GRAVITY * dt;
        g.mesh.position.x += g.vel.x * dt;
        g.mesh.position.y += g.vel.y * dt;
        g.mesh.position.z += g.vel.z * dt;
        g.mesh.rotation.x += dt * 5;
        if (g.mesh.position.y < 0.3) { g.mesh.position.y = 0.3; g.vel.y = -g.vel.y * 0.3; g.vel.x *= 0.7; g.vel.z *= 0.7; }
        if (g.timer <= 0) { explodeGrenade(g); grenades.splice(i, 1); }
    }
}

function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) { scene.remove(p.mesh); particles.splice(i, 1); continue; }
        p.vel.y += GRAVITY * 0.5 * dt;
        p.mesh.position.x += p.vel.x * dt;
        p.mesh.position.y += p.vel.y * dt;
        p.mesh.position.z += p.vel.z * dt;
        p.mesh.material.opacity = p.life;
    }
}

function updateClouds(dt) {
    for (const c of clouds) {
        c.position.x += c.userData.speed * dt;
        if (c.position.x > HALF_MAP * 1.5) c.position.x = -HALF_MAP * 1.5;
    }
}

function updateCompass() {
    const deg = ((yaw * 180 / Math.PI) % 360 + 360) % 360;
    let dir = '';
    if (deg < 22.5 || deg >= 337.5) dir = 'N';
    else if (deg < 67.5) dir = 'NW';
    else if (deg < 112.5) dir = 'W';
    else if (deg < 157.5) dir = 'SW';
    else if (deg < 202.5) dir = 'S';
    else if (deg < 247.5) dir = 'SE';
    else if (deg < 292.5) dir = 'E';
    else dir = 'NE';
    _dom.compass.textContent = dir + ' ' + Math.round(deg) + '°';
}

function updateEnemies(dt) {
    for (const e of enemies) {
        if (!e.alive) continue;
        e.animTimer += dt * 3;
        const dx = player.x - e.x;
        const dz = player.z - e.z;
        const distToPlayer = Math.sqrt(dx * dx + dz * dz);
        e.stateTimer -= dt;

        if (distToPlayer < e.sightRange && playerHealth > 0) {
            e.state = 'combat';
            e.stateTimer = 4 + Math.random() * 2;
        }

        switch (e.state) {
            case 'wander':
                if (e.stateTimer <= 0) {
                    e.targetX = e.x + (Math.random() - 0.5) * 80;
                    e.targetZ = e.z + (Math.random() - 0.5) * 80;
                    e.targetX = Math.max(-HALF_MAP + 10, Math.min(HALF_MAP - 10, e.targetX));
                    e.targetZ = Math.max(-HALF_MAP + 10, Math.min(HALF_MAP - 10, e.targetZ));
                    e.stateTimer = 4 + Math.random() * 6;
                }
                moveEnemy(e, e.targetX, e.targetZ, e.speed * 0.5, dt);
                break;
            case 'combat':
                if (distToPlayer < 15) {
                    const strafeAngle = Math.atan2(dz, dx) + Math.PI / 2 * Math.sign(Math.sin(e.animTimer));
                    moveEnemy(e, e.x + Math.cos(strafeAngle) * 5, e.z + Math.sin(strafeAngle) * 5, e.speed * 0.7, dt);
                } else if (distToPlayer < e.sightRange) {
                    moveEnemy(e, player.x, player.z, e.speed, dt);
                }
                e.fireTimer -= dt;
                if (e.fireTimer <= 0 && distToPlayer < e.sightRange) {
                    enemyShoot(e);
                    e.fireTimer = e.fireRate;
                }
                e.mesh.rotation.y = Math.atan2(dx, dz);
                if (e.stateTimer <= 0 && distToPlayer > e.sightRange) { e.state = 'wander'; e.stateTimer = 3; }
                break;
        }

        // Enemy-enemy fights
        for (const other of enemies) {
            if (other === e || !other.alive) continue;
            const edx = other.x - e.x, edz = other.z - e.z;
            if (edx*edx + edz*edz < 625 && Math.random() < 0.001) {
                other.health -= 5;
                if (other.health <= 0) {
                    other.alive = false;
                    scene.remove(other.mesh);
                    alive--;
                    document.getElementById('alive-val').textContent = alive;
                    addKillFeed(e.name, other.name);
                }
            }
        }

        // Zone damage
        const eDist = Math.sqrt((e.x - zoneCenterX) ** 2 + (e.z - zoneCenterZ) ** 2);
        if (eDist > zoneRadius) {
            e.health -= dt * 3;
            if (e.health <= 0) {
                e.alive = false; scene.remove(e.mesh); alive--;
                document.getElementById('alive-val').textContent = alive;
                addKillFeed('Zone', e.name);
            }
            if (e.state === 'wander') {
                e.targetX = zoneCenterX + (Math.random()-0.5)*zoneRadius;
                e.targetZ = zoneCenterZ + (Math.random()-0.5)*zoneRadius;
            }
        }

        // Animation
        if (e.mesh) {
            const c = e.mesh.children;
            if (c[2]) c[2].rotation.x = Math.sin(e.animTimer) * 0.5;
            if (c[3]) c[3].rotation.x = -Math.sin(e.animTimer) * 0.5;
            if (c[4]) c[4].rotation.x = -Math.sin(e.animTimer) * 0.4;
            if (c[5]) c[5].rotation.x = Math.sin(e.animTimer) * 0.4;
            // Name sprite visibility based on distance
            var nameChild = c[c.length - 1];
            if (nameChild && nameChild.isSprite) {
                nameChild.visible = distToPlayer < 50;
            }
        }
        e.mesh.position.set(e.x, 0, e.z);
    }
}

function moveEnemy(e, targetX, targetZ, speed, dt) {
    const dx = targetX - e.x;
    const dz = targetZ - e.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 1) return;
    const moveX = (dx / dist) * speed * dt;
    const moveZ = (dz / dist) * speed * dt;
    const newX = Math.max(-HALF_MAP+3, Math.min(HALF_MAP-3, e.x + moveX));
    const newZ = Math.max(-HALF_MAP+3, Math.min(HALF_MAP-3, e.z + moveZ));
    if (!checkAllCollision(newX, newZ, 1.5)) { e.x = newX; e.z = newZ; }
    else { e.targetX = e.x + (Math.random()-0.5)*30; e.targetZ = e.z + (Math.random()-0.5)*30; }
    e.mesh.rotation.y = Math.atan2(dx, dz);
}

function updateZone(dt) {
    if (zoneShrinkPhase >= ZONE_PHASES.length) {
        document.getElementById('zone-timer').textContent = 'Final Zone';
        document.getElementById('zone-timer').classList.remove('shrinking');
    } else {
        const phase = ZONE_PHASES[zoneShrinkPhase];
        zoneShrinkTimer += dt;
        const timerEl = document.getElementById('zone-timer');
        if (zoneShrinkTimer >= phase.delay) {
            zoneRadius -= phase.speed * dt;
            if (zoneRadius <= phase.target) { zoneRadius = phase.target; zoneShrinkPhase++; zoneShrinkTimer = 0; }
            updateZoneVisual();
            timerEl.textContent = 'Zone ' + (zoneShrinkPhase + 1) + ' | SHRINKING';
            timerEl.classList.add('shrinking');
        } else {
            const remaining = Math.ceil(phase.delay - zoneShrinkTimer);
            const m = Math.floor(remaining / 60);
            const s = remaining % 60;
            timerEl.textContent = 'Zone ' + (zoneShrinkPhase + 1) + ' | ' + m + ':' + (s < 10 ? '0' : '') + s;
            timerEl.classList.remove('shrinking');
        }
        const playerDist = Math.sqrt((player.x - zoneCenterX)**2 + (player.z - zoneCenterZ)**2);
        const outsideZone = playerDist > zoneRadius;
        document.getElementById('zone-warning').style.display = outsideZone ? 'block' : 'none';
        if (outsideZone) {
            zoneDamageTimer += dt;
            if (zoneDamageTimer >= 1) {
                zoneDamageTimer = 0;
                const dmg = 2 + zoneShrinkPhase;
                applyDamageToPlayer(dmg);
            }
        }
    }
}

// ---- HUD ----
function updateBarsHUD() {
    const hp = Math.max(0, Math.round(playerHealth));
    const sh = Math.max(0, Math.round(playerShield));
    _dom.healthVal.textContent = hp;
    _dom.shieldVal.textContent = sh;
    _dom.healthBar.style.width = (hp / MAX_HP * 100) + '%';
    if (hp > 60) _dom.healthBar.style.background = 'linear-gradient(90deg, #0f0, #4f4)';
    else if (hp > 30) _dom.healthBar.style.background = 'linear-gradient(90deg, #ff0, #fa0)';
    else _dom.healthBar.style.background = 'linear-gradient(90deg, #f00, #f44)';
    _dom.shieldBar.style.width = (sh / MAX_SHIELD * 100) + '%';
}

function addKillFeed(killer, victim) {
    const feed = document.getElementById('kill-feed');
    const msg = document.createElement('div');
    msg.className = 'kill-msg';
    msg.innerHTML = '<span>' + sanitize(killer) + '</span> eliminated <span>' + sanitize(victim) + '</span>';
    feed.prepend(msg);
    setTimeout(() => msg.remove(), 5000);
    while (feed.children.length > 5) feed.lastChild.remove();
}

function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ---- MINIMAP ----
function drawMinimap() {
    const ctx = minimapCtx;
    const w = 186, h = 186;
    const half = w / 2;
    // Player-centered, heading-up minimap (rotates with camera like Free Fire)
    var viewRange = 200;
    var mScale = half / viewRange;
    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(0, 0, w, h);

    // Rotate entire map so player's forward is always UP
    ctx.save();
    ctx.translate(half, half);
    ctx.rotate(yaw);

    // Helper: world to rotated minimap coords (relative to player, pre-rotation)
    function wx(worldX) { return (worldX - player.x) * mScale; }
    function wz(worldZ) { return (worldZ - player.z) * mScale; }

    // Map boundary
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(wx(-HALF_MAP), wz(-HALF_MAP), MAP_SIZE * mScale, MAP_SIZE * mScale);

    // Zone circle
    ctx.beginPath();
    ctx.arc(wx(zoneCenterX), wz(zoneCenterZ), zoneRadius * mScale, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(80,120,255,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Buildings
    ctx.strokeStyle = 'rgba(200,180,140,0.7)';
    ctx.lineWidth = 1.5;
    buildings.forEach(function(b) {
        for (var i = 0; i < b.walls.length; i++) {
            var wall = b.walls[i];
            var x1 = wx(wall.x1), z1 = wz(wall.z1);
            var x2 = wx(wall.x2), z2 = wz(wall.z2);
            ctx.beginPath();
            ctx.moveTo(x1, z1);
            ctx.lineTo(x2, z2);
            ctx.stroke();
        }
    });

    // Loot
    lootItems.forEach(function(l) {
        if (!l.active) return;
        var lx = wx(l.x), lz = wz(l.z);
        // Skip if too far (outside rotated view)
        if (Math.abs(lx) > half + 10 || Math.abs(lz) > half + 10) return;
        ctx.fillStyle = l.type==='health'?'#0f0':l.type==='ammo'?'#ff0':l.type==='shield'?'#48f':'#fa0';
        ctx.fillRect(lx - 1, lz - 1, 3, 3);
    });

    // Enemies - red pulsing dots for nearby, faint for far
    enemies.forEach(function(e) {
        if (!e.alive) return;
        var dx = e.x - player.x, dz = e.z - player.z;
        var distSq = dx * dx + dz * dz;
        if (distSq < 10000) {
            var ex = wx(e.x), ez = wz(e.z);
            if (Math.abs(ex) > half + 10 || Math.abs(ez) > half + 10) return;
            if (distSq < 2500) {
                var pulse = 3 + Math.sin(Date.now() * 0.008) * 1.5;
                ctx.fillStyle = '#ff2222';
                ctx.beginPath();
                ctx.arc(ex, ez, pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,50,50,0.5)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(ex, ez, pulse + 2, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                ctx.fillStyle = '#f44';
                ctx.beginPath();
                ctx.arc(ex, ez, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });

    ctx.restore();

    // Player - triangle always pointing UP (forward) at center
    ctx.save();
    ctx.translate(half, half);
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(-5, 5);
    ctx.lineTo(5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // FOV cone - always pointing UP from center
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    var fovHalf = 0.4;
    ctx.beginPath();
    ctx.moveTo(half, half);
    ctx.lineTo(half + Math.sin(-fovHalf) * 30, half - Math.cos(fovHalf) * 30);
    ctx.moveTo(half, half);
    ctx.lineTo(half + Math.sin(fovHalf) * 30, half - Math.cos(fovHalf) * 30);
    ctx.stroke();
}

// ---- GAME OVER ----
function endGame(won) {
    gameOver = true;
    if (!isMobile) document.exitPointerLock();
    const overlay = document.getElementById('game-over');
    overlay.style.display = 'flex';
    const resultText = document.getElementById('result-text');
    if (won) {
        resultText.textContent = '🏆 WINNER WINNER! 🏆';
        resultText.style.color = '#FFD700';
    } else {
        resultText.textContent = '💀 ELIMINATED';
        resultText.style.color = '#f44';
    }
    const mins = Math.floor(gameTime / 60);
    const secs = Math.floor(gameTime % 60);
    document.getElementById('final-stats').innerHTML =
        'Kills: ' + kills + ' | Placement: #' + alive + '/' + (ENEMY_COUNT+1) + ' | Time: ' + mins + ':' + (secs<10?'0':'') + secs;
}

// ---- ANIMATE ----
function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    update(dt);
    renderer.render(scene, camera);
}

// ---- START ----
init();
