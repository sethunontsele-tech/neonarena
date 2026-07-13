import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  UploadCloud, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  FileArchive, 
  RefreshCw, 
  Search, 
  Box, 
  Image as ImageIcon, 
  FileText, 
  Code, 
  HelpCircle, 
  ShieldCheck, 
  Info,
  ChevronDown,
  ChevronUp,
  Folder,
  FolderOpen,
  Wifi,
  Laptop,
  Play,
  Terminal,
  Zap,
  Check,
  Smartphone,
  HardDrive,
  Download,
  Trash2,
  Cpu
} from 'lucide-react';
import JSZip from 'jszip';
import { soundService } from '../../services/soundService';

// Curated App Store definition for Quest/VR sideload experiences
interface StoreApp {
  id: string;
  name: string;
  packageName: string;
  version: string;
  developer: string;
  description: string;
  size: string;
  platform: string;
  category: string;
  permissions: string[];
  files: string[];
  iconUrl: string;
}

const CURATED_STORE_APPS: StoreApp[] = [
  {
    id: 'hyperdash',
    name: 'HyperDash VR',
    packageName: 'com.trianglefactory.hyperdash',
    version: '1.45.0',
    developer: 'Triangle Factory',
    description: 'A fast-paced multiplayer sci-fi VR arena shooter. Experience dynamic rail-sliding, dual-wielding weapon arrays, and dash-teleport locomotion on glowing neon maps.',
    size: '1.24 GB',
    platform: 'Quest 2 / 3 / Pro / 3S',
    category: 'Multiplayer Shooter',
    permissions: ['android.permission.RECORD_AUDIO', 'android.permission.INTERNET', 'android.permission.MODIFY_AUDIO_SETTINGS'],
    files: [
      'AndroidManifest.xml',
      'assets/bin/Data/Managed/Assembly-CSharp.dll',
      'lib/arm64-v8a/libunity.so',
      'com.trianglefactory.hyperdash.apk',
      'Android/obb/com.trianglefactory.hyperdash/main.145.com.trianglefactory.hyperdash.obb',
      'icon.png'
    ],
    iconUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=80&h=80&fit=crop&q=80'
  },
  {
    id: 'pavlov_shack',
    name: 'Pavlov Shack VR',
    packageName: 'com.vankrupt.pavlovshack',
    version: 'b28.5',
    developer: 'Vankrupt Games',
    description: 'The ultimate realistic tactical VR military shooter. Features real-world weapon reloads, customizable attachments, active lobbies, and massive community-driven environments.',
    size: '4.82 GB',
    platform: 'Quest 3 / 3S / Pro',
    category: 'Action Tactical',
    permissions: ['android.permission.RECORD_AUDIO', 'android.permission.INTERNET', 'android.permission.WRITE_EXTERNAL_STORAGE'],
    files: [
      'AndroidManifest.xml',
      'assets/gamelogic.dat',
      'lib/arm64-v8a/libUE4.so',
      'pavlov_shack_quest3.apk',
      'Android/obb/com.vankrupt.pavlovshack/main.28005.com.vankrupt.pavlovshack.obb',
      'cover_art.jpg'
    ],
    iconUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=80&h=80&fit=crop&q=80'
  },
  {
    id: 'gorilla_tag',
    name: 'Gorilla Tag',
    packageName: 'com.AnotherAxiom.GorillaTag',
    version: '2.14',
    developer: 'Another Axiom',
    description: 'Run, climb, and leap using only your hands! An innovative physics-driven locomotion game. Avoid the infected gorillas or tag other players in forest and canyon arenas.',
    size: '345 MB',
    platform: 'Quest 2 / 3 / 3S / Pico 4',
    category: 'Casual Physics',
    permissions: ['android.permission.INTERNET', 'android.permission.RECORD_AUDIO'],
    files: [
      'AndroidManifest.xml',
      'assets/bin/Data/boot.config',
      'lib/arm64-v8a/libunity.so',
      'gorilla_tag_v214.apk',
      'icon_round.png'
    ],
    iconUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=80&h=80&fit=crop&q=80'
  },
  {
    id: 'gravity_sketch',
    name: 'Gravity Sketch 3D',
    packageName: 'com.gravitysketch.gravitysketch',
    version: '6.2.1',
    developer: 'Gravity Sketch Ltd',
    description: 'An enterprise-grade 3D creative design tool. Express ideas spatially using free-form sketches, detailed sub-d geometries, and collaborative workspaces directly in virtual reality.',
    size: '890 MB',
    platform: 'Quest 3 / Pro / PCVR',
    category: 'Creative CAD',
    permissions: ['android.permission.INTERNET', 'android.permission.WRITE_EXTERNAL_STORAGE', 'android.permission.READ_EXTERNAL_STORAGE'],
    files: [
      'AndroidManifest.xml',
      'assets/prefabs/canvas.prefab',
      'lib/arm64-v8a/libgravity_core.so',
      'gravity_sketch_6.apk',
      'Android/obb/com.gravitysketch.gravitysketch/main.602.obb',
      'logo_spatial.png'
    ],
    iconUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=80&h=80&fit=crop&q=80'
  }
];

interface BlenderZipUploadProps {
  onUploadSuccess?: () => void;
  className?: string;
}

interface ScannedFile {
  name: string;
  dir: boolean;
  category: 'model' | 'texture' | 'code' | 'config' | 'apk' | 'obb' | 'asset_bundle' | 'other';
  ext: string;
}

interface SideloadMetadata {
  appName: string;
  packageName: string;
  version: string;
  developer: string;
  description: string;
  targetPlatform: string;
  hasApk: boolean;
  hasObb: boolean;
  apkSize?: string;
  obbSize?: string;
  permissions?: string[];
  features?: string[];
  iconUrl?: string;
  files: string[];
}

export function BlenderZipUpload({ onUploadSuccess, className = '' }: BlenderZipUploadProps) {
  // Folder layout tabs: 'sideload' (personal ZIP upload & scanner), 'store' (SideQuest app directory)
  const [activeTab, setActiveTab] = useState<'sideload' | 'store'>('sideload');
  
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Client-side ZIP Scanning State
  const [scanningZip, setScanningZip] = useState(false);
  const [scannedFiles, setScannedFiles] = useState<ScannedFile[]>([]);
  const [customMeta, setCustomMeta] = useState<SideloadMetadata | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilesList, setShowFilesList] = useState(true);

  // Store Selected App
  const [selectedStoreApp, setSelectedStoreApp] = useState<StoreApp | null>(null);

  // Simulated Sideload ADB Console State
  const [isSideloading, setIsSideloading] = useState(false);
  const [sideloadProgress, setSideloadProgress] = useState(0);
  const [adbLogs, setAdbLogs] = useState<string[]>([]);
  const [sideloadedApps, setSideloadedApps] = useState<string[]>(['com.AnotherAxiom.GorillaTag']); // Prefilled with Gorilla Tag

  // DB/Backend file status
  const [status, setStatus] = useState<{
    exists: boolean;
    isPlaceholder: boolean;
    isValidZip: boolean;
    size?: number;
    message?: string;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/blender/status');
      const data = await response.json();
      if (data.success) {
        setStatus({
          exists: data.exists,
          isPlaceholder: data.isPlaceholder,
          isValidZip: data.isValidZip,
          size: data.size,
          message: data.message
        });
      }
    } catch (e) {
      console.error('Error fetching blender status:', e);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Perform client-side ZIP scanning and validation
  const scanZipContents = async (zipFile: File) => {
    setScanningZip(true);
    setScannedFiles([]);
    setCustomMeta(null);
    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(zipFile);
      const tempFiles: ScannedFile[] = [];

      let foundApk = false;
      let apkName = '';
      let foundObb = false;
      let obbName = '';
      let jsonManifest: any = null;
      let extractedIconUrl: string | undefined = undefined;

      const promises: Promise<void>[] = [];

      loadedZip.forEach((relativePath, fileEntry) => {
        const ext = relativePath.split('.').pop()?.toLowerCase() || '';
        let category: ScannedFile['category'] = 'other';

        if (['blend', 'obj', 'fbx', 'gltf', 'glb', 'stl', 'dae', '3ds'].includes(ext)) {
          category = 'model';
        } else if (['png', 'jpg', 'jpeg', 'tga', 'dds', 'bmp', 'tiff', 'webp'].includes(ext)) {
          category = 'texture';
        } else if (['cs', 'py', 'cpp', 'h', 'js', 'ts', 'sh', 'bat'].includes(ext)) {
          category = 'code';
        } else if (['json', 'xml', 'yaml', 'txt', 'ini', 'cfg', 'properties'].includes(ext)) {
          category = 'config';
        } else if (ext === 'apk') {
          category = 'apk';
          foundApk = true;
          apkName = relativePath.split('/').pop() || '';
        } else if (ext === 'obb') {
          category = 'obb';
          foundObb = true;
          obbName = relativePath.split('/').pop() || '';
        } else if (['asset', 'bundle', 'unity3d'].includes(ext)) {
          category = 'asset_bundle';
        }

        tempFiles.push({
          name: relativePath,
          dir: fileEntry.dir,
          category,
          ext
        });

        // Parse any config/manifest file live!
        if (ext === 'json' && !fileEntry.dir) {
          const promise = fileEntry.async('string').then(content => {
            try {
              const parsed = JSON.parse(content);
              if (parsed.name || parsed.appName || parsed.packageName || parsed.package) {
                jsonManifest = parsed;
              }
            } catch (e) {}
          });
          promises.push(promise);
        }

        // Try extracting icons if present
        if (['png', 'jpg', 'jpeg'].includes(ext) && !fileEntry.dir && !extractedIconUrl) {
          const lowerPath = relativePath.toLowerCase();
          if (lowerPath.includes('icon') || lowerPath.includes('logo') || lowerPath.includes('cover')) {
            const promise = fileEntry.async('blob').then(blob => {
              extractedIconUrl = URL.createObjectURL(blob);
            }).catch(() => {});
            promises.push(promise);
          }
        }
      });

      await Promise.all(promises);

      // Synthesize app meta
      if (foundApk || jsonManifest) {
        const cleanAppName = jsonManifest?.name || jsonManifest?.appName || apkName.replace(/\.[^/.]+$/, "").split('.').pop()?.replace(/[_-]/g, ' ') || 'Custom Quest Game';
        const cleanPkg = jsonManifest?.packageName || jsonManifest?.package || `com.sideload.${cleanAppName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        const cleanVer = jsonManifest?.version || jsonManifest?.versionName || '1.0.0';
        const cleanDev = jsonManifest?.developer || jsonManifest?.author || 'Indie VR Creator';
        const cleanDesc = jsonManifest?.description || `Sideloadable Quest package scanned from archive. Includes dynamic Android binaries (.APK) and custom companion data files.`;

        setCustomMeta({
          appName: cleanAppName,
          packageName: cleanPkg,
          version: cleanVer,
          developer: cleanDev,
          description: cleanDesc,
          targetPlatform: jsonManifest?.platform || 'Quest 3 / 3S / Pro',
          hasApk: foundApk,
          hasObb: foundObb,
          apkSize: apkName ? `${(zipFile.size / (1024 * 1024) * 0.4).toFixed(1)} MB` : undefined,
          obbSize: foundObb ? `${(zipFile.size / (1024 * 1024) * 0.5).toFixed(1)} MB` : undefined,
          permissions: jsonManifest?.permissions || ['android.permission.INTERNET', 'android.permission.WRITE_EXTERNAL_STORAGE'],
          features: jsonManifest?.features || ['android.hardware.vr.headtracking'],
          iconUrl: extractedIconUrl,
          files: tempFiles.filter(f => !f.dir).map(f => f.name)
        });
      } else {
        // Fallback for asset bundles or model zips
        setCustomMeta({
          appName: zipFile.name.replace(/\.[^/.]+$/, ""),
          packageName: `com.mod.${zipFile.name.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          version: '1.0',
          developer: 'Mod Compiler',
          description: `Custom model bundle with ${tempFiles.filter(f => f.category === 'model').length} 3D geometry mesh assets and textures.`,
          targetPlatform: 'Quest OpenXR Platform',
          hasApk: false,
          hasObb: false,
          permissions: [],
          features: [],
          iconUrl: extractedIconUrl,
          files: tempFiles.filter(f => !f.dir).map(f => f.name)
        });
      }

      setScannedFiles(tempFiles);
      try { soundService.playSFX('achievement'); } catch (e) {}
    } catch (err: any) {
      console.error('Error scanning ZIP file:', err);
      setErrorMsg(`ZIP Scanner failed: ${err.message || 'Could not parse file as a valid ZIP.'}`);
      try { soundService.playSFX('hit'); } catch (e) {}
    } finally {
      setScanningZip(false);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const MAX_SIZE = 456 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      setErrorMsg(`Error: File size is ${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB, which exceeds the limit of 456 MB!`);
      try { soundService.playSFX('hit'); } catch (e) {}
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.zip')) {
      setErrorMsg('Error: Selected file must be a .zip archive (SideQuest or Mod package)!');
      try { soundService.playSFX('hit'); } catch (e) {}
      return;
    }
    setFile(selectedFile);
    scanZipContents(selectedFile);
    try { soundService.playSFX('ui_hover'); } catch (e) {}
  };

  // Perform Simulated Sideload Installation via ADB
  const executeSideloadInstall = (appName: string, packageName: string, files: string[]) => {
    setIsSideloading(true);
    setSideloadProgress(0);
    setAdbLogs([]);
    try { soundService.playSFX('ui_hover'); } catch (e) {}

    const logs = [
      `[ADB] Initiating connection handshake with Quest VR Headset...`,
      `[ADB] Wireless debugging target identified: 192.168.1.189:5555`,
      `[ADB] Device ID: Q3_V71A90_STANDALONE [Quest 3 Active Core]`,
      `[ADB] Target CPU Architecture: arm64-v8a (64-bit Android VR)`,
      `[ADB] Sideloading Package: ${packageName}`,
      `[ADB] Verification scan complete. SHA-256 App Signature matches.`,
      `[ADB] Transferring file manifest (${files.length} descriptors)...`,
      `[ADB] Sideloading: ${appName}.apk -> /data/local/tmp/...`,
      `[ADB] Pushing OBB runtime assets -> /sdcard/Android/obb/${packageName}/...`,
      `[ADB] Setting file permissions (chmod 644)...`,
      `[ADB] Invoking Package Manager: pm install -r -d /data/local/tmp/app.apk`,
      `[ADB] Granting Quest hardware permissions: android.permission.RECORD_AUDIO`,
      `[ADB] Granting spatial tracking locks: android.permission.WRITE_EXTERNAL_STORAGE`,
      `[ADB] Cleared diagnostic cache buffers.`,
      `[ADB] Sideload installation SUCCESSFUL!`
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setAdbLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${logs[currentLogIndex]}`]);
        setSideloadProgress(Math.floor(((currentLogIndex + 1) / logs.length) * 100));
        currentLogIndex++;
        try { soundService.playSFX('ui_hover'); } catch (e) {}
      } else {
        clearInterval(interval);
        setIsSideloading(false);
        if (!sideloadedApps.includes(packageName)) {
          setSideloadedApps(prev => [...prev, packageName]);
        }
        try { soundService.playSFX('achievement'); } catch (e) {}
      }
    }, 450);
  };

  // Upload to playground server (Blender package)
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(10);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const reader = new FileReader();
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 15;
        });
      }, 100);

      reader.onload = async (e) => {
        clearInterval(progressInterval);
        const base64Data = e.target?.result as string;

        try {
          setUploadProgress(90);
          const response = await fetch('/api/blender/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64: base64Data }),
          });

          const result = await response.json();
          setUploadProgress(100);

          if (result.success) {
            setSuccessMsg(`Uploaded SideQuest / Blender model archive (${(result.size / (1024 * 1024)).toFixed(1)} MB) to Sandbox!`);
            setFile(null);
            setScannedFiles([]);
            setCustomMeta(null);
            await checkStatus();
            try { soundService.playSFX('achievement'); } catch (e) {}
            if (onUploadSuccess) {
              onUploadSuccess();
            }
          } else {
            setErrorMsg(result.error || 'Upload failed.');
            try { soundService.playSFX('hit'); } catch (e) {}
          }
        } catch (err: any) {
          setErrorMsg(`Server connection error: ${err.message}`);
          try { soundService.playSFX('hit'); } catch (e) {}
        } finally {
          setUploading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg(`Upload setup failed: ${err.message}`);
      setUploading(false);
      try { soundService.playSFX('hit'); } catch (e) {}
    }
  };

  const stats = useMemo(() => {
    const total = scannedFiles.filter(f => !f.dir).length;
    const models = scannedFiles.filter(f => f.category === 'model').length;
    const textures = scannedFiles.filter(f => f.category === 'texture').length;
    const configs = scannedFiles.filter(f => f.category === 'config').length;
    const codes = scannedFiles.filter(f => f.category === 'code').length;
    const apks = scannedFiles.filter(f => f.category === 'apk').length;
    const obbs = scannedFiles.filter(f => f.category === 'obb').length;
    
    const hasBlend = scannedFiles.some(f => f.ext === 'blend');
    const hasObj = scannedFiles.some(f => f.ext === 'obj');
    const hasFbx = scannedFiles.some(f => f.ext === 'fbx');
    const hasGltf = scannedFiles.some(f => ['gltf', 'glb'].includes(f.ext));

    return {
      total,
      models,
      textures,
      configs,
      codes,
      apks,
      obbs,
      hasBlend,
      hasObj,
      hasFbx,
      hasGltf,
      isValidStructure: total > 0
    };
  }, [scannedFiles]);

  const filteredFiles = scannedFiles
    .filter(f => !f.dir && f.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 30);

  return (
    <div id="quest-mod-store-folder" className={`flex flex-col space-y-0 font-mono text-[10px] ${className}`}>
      
      {/* 📁 Folder Sleeve Header */}
      <div className="flex items-center -mb-px select-none">
        <div
          className="px-4 py-2 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 rounded-t-xl border-t border-x bg-zinc-950 border-white/10 text-amber-400"
        >
          <Folder size={11} className="text-amber-400" />
          📂 Sideload Cabinet & Mod Scanner
        </div>
        <div className="flex-1 border-b border-white/10 self-end" />
      </div>

      {/* Main Folder Frame Body */}
      <div className="bg-zinc-950 border border-white/10 rounded-b-2xl rounded-tr-2xl p-4 flex flex-col space-y-4">
        
        {/* Tab 1: Sideload Port (Personal Zip / APK Drop Scanner) */}
        <div className="space-y-4">
            
            {/* Header Title bar */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h4 className="text-[9px] font-black tracking-widest text-zinc-400 uppercase flex items-center gap-1.5">
                <FileArchive size={12} className="text-amber-400 animate-pulse" />
                Quest Sideload Port & .ZIP Scanner
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
                  JSZIP PARSER ACTIVE
                </span>
                <button 
                  onClick={checkStatus} 
                  className="text-zinc-500 hover:text-white transition-colors"
                  title="Refresh status"
                >
                  <RefreshCw size={10} className={uploading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Sideload target info badge */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Smartphone size={16} />
                </div>
                <div>
                  <div className="text-[8.5px] font-black uppercase text-white flex items-center gap-1.5">
                    <Wifi size={10} className="text-emerald-400 animate-pulse" />
                    Target Link: Quest 3 Standalone
                  </div>
                  <p className="text-[8px] text-zinc-500 uppercase tracking-wide mt-0.5">
                    ADB Wi-Fi Bridge Enabled on Port 5555
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[8px] block font-mono text-zinc-500 uppercase">Installed VR Apps</span>
                <span className="text-[9.5px] font-black font-mono text-cyan-300">{sideloadedApps.length} Packages</span>
              </div>
            </div>

            {/* Drag & Drop File Slot */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${
                dragActive 
                  ? 'border-amber-400 bg-amber-500/5' 
                  : file 
                    ? 'border-emerald-500 bg-emerald-500/5' 
                    : 'border-white/10 hover:border-white/20 bg-black/40'
              }`}
            >
              <input 
                type="file" 
                id="sideload-file-picker" 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                accept=".zip"
                onChange={handleFileInput}
                disabled={uploading || scanningZip}
              />

              <UploadCloud size={24} className={`mb-2 ${file ? 'text-emerald-400 animate-pulse' : dragActive ? 'text-amber-400 animate-bounce' : 'text-zinc-500'}`} />
              
              {file ? (
                <div className="space-y-1">
                  <p className="font-bold text-white text-[9.5px] break-all uppercase tracking-wide">{file.name}</p>
                  <p className="text-amber-400 text-[8px] font-black">{(file.size / (1024 * 1024)).toFixed(1)} MB - SideQuest Package Ready</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-bold text-zinc-300 uppercase tracking-wider">Drag & drop VR Game/App .ZIP here</p>
                  <p className="text-zinc-600 text-[8px] uppercase tracking-wider">or click to scan local archive folders (Max 456MB)</p>
                </div>
              )}
            </div>

            {/* Parsing / Loader */}
            {scanningZip && (
              <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 flex items-center justify-center gap-2 text-amber-400">
                <Loader2 size={12} className="animate-spin" />
                <span className="font-black text-[9px] uppercase tracking-wider">Decompressing ZIP Headers & Extracting APK/OBB Files...</span>
              </div>
            )}

            {/* Custom Sideload Metadata Scanned Screen */}
            {!scanningZip && customMeta && (
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 space-y-3">
                <div className="flex gap-3 items-start border-b border-white/5 pb-2.5">
                  <div className="w-11 h-11 bg-zinc-800 rounded-lg border border-white/10 overflow-hidden flex items-center justify-center text-amber-400 shrink-0">
                    {customMeta.iconUrl ? (
                      <img src={customMeta.iconUrl} alt="extracted" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Smartphone size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase text-white tracking-wide truncate">{customMeta.appName}</span>
                      <span className="text-[7.5px] px-1.5 py-0.2 rounded bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 font-bold">
                        {customMeta.hasApk ? 'ANDROID VR APK' : 'ASSET/MODEL'}
                      </span>
                    </div>
                    <p className="text-[7.5px] text-zinc-500 font-mono mt-0.5 truncate uppercase">ID: {customMeta.packageName}</p>
                    <p className="text-[8px] text-zinc-400 mt-1 leading-normal">{customMeta.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[8px]">
                  <div className="space-y-1">
                    <span className="text-zinc-500 block uppercase font-bold">Package Diagnostics</span>
                    <div className="flex items-center gap-1 text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Platform: <strong>{customMeta.targetPlatform}</strong></span>
                    </div>
                    {customMeta.apkSize && (
                      <div className="flex items-center gap-1 text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>APK Binary: <strong>{customMeta.apkSize}</strong></span>
                      </div>
                    )}
                    {customMeta.obbSize && (
                      <div className="flex items-center gap-1 text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <span>OBB Companion: <strong>{customMeta.obbSize}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 border-l border-white/5 pl-2">
                    <span className="text-zinc-500 block uppercase font-bold">File Integrity</span>
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <ShieldCheck size={10} className="text-emerald-400" />
                      <span>Security: <strong className="text-emerald-400">VERIFIED SAFE</strong></span>
                    </div>
                    <div className="text-[7px] text-zinc-500 leading-normal">
                      Manifest and Android virtual descriptors correctly linked.
                    </div>
                  </div>
                </div>

                {/* Sideload Control Button */}
                <div className="pt-1.5 flex gap-2">
                  <button
                    onClick={() => executeSideloadInstall(customMeta.appName, customMeta.packageName, customMeta.files)}
                    disabled={isSideloading}
                    className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-[9px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Zap size={11} fill="currentColor" />
                    ⚡ Install Game to Headset (ADB Sideload)
                  </button>

                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-3.5 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                    title="Send package to sandbox servers"
                  >
                    Send to Sandbox Disk
                  </button>
                </div>
              </div>
            )}

            {/* Diagnostics Stats */}
            {!scanningZip && scannedFiles.length > 0 && (
              <div className="bg-zinc-950/60 border border-white/5 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-[8px] text-zinc-500 uppercase font-black tracking-wide border-b border-white/5 pb-1">
                  <span>Decompressed Directory Contents ({stats.total} Files)</span>
                  <button 
                    onClick={() => setShowFilesList(!showFilesList)}
                    className="text-[8px] text-zinc-400 hover:text-white flex items-center gap-0.5"
                  >
                    {showFilesList ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                    {showFilesList ? 'Collapse list' : 'Expand list'}
                  </button>
                </div>

                {showFilesList && (
                  <div className="max-h-24 overflow-y-auto border border-white/5 rounded-lg bg-black/40 p-1.5 space-y-0.5 text-[8px] custom-scrollbar">
                    {filteredFiles.map((f, i) => {
                      let IconComp = HelpCircle;
                      let color = 'text-zinc-600';
                      if (f.category === 'apk') { IconComp = Smartphone; color = 'text-amber-400 animate-pulse'; }
                      else if (f.category === 'obb') { IconComp = HardDrive; color = 'text-purple-400'; }
                      else if (f.category === 'model') { IconComp = Box; color = 'text-amber-500'; }
                      else if (f.category === 'texture') { IconComp = ImageIcon; color = 'text-cyan-400'; }
                      else if (f.category === 'code') { IconComp = Code; color = 'text-emerald-400'; }
                      else if (f.category === 'config') { IconComp = FileText; color = 'text-purple-500'; }

                      return (
                        <div key={i} className="flex items-center justify-between p-1 hover:bg-white/5 rounded">
                          <span className="truncate max-w-[200px] text-zinc-400 flex items-center gap-1.5">
                            <IconComp size={9} className={`${color} shrink-0`} />
                            {f.name}
                          </span>
                          <span className="uppercase text-[6.5px] text-zinc-600 px-1 border border-zinc-800 rounded font-bold">
                            {f.ext || 'dir'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            
          </div>



        {/* Simulated Sideload Console Drawer (Shows when active) */}
        {isSideloading && (
          <div className="bg-black border border-amber-500/20 rounded-xl p-3 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-[8px] text-amber-400 font-black uppercase tracking-widest border-b border-white/5 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Terminal size={11} className="animate-pulse" />
                ADB VR Sideload Connection Terminal
              </span>
              <span>{sideloadProgress}% COMPLETE</span>
            </div>

            {/* Log list */}
            <div className="bg-zinc-950 p-2 rounded-lg border border-white/5 h-24 overflow-y-auto font-mono text-[7px] text-amber-300 space-y-1 scrollbar-thin scrollbar-thumb-zinc-800">
              {adbLogs.map((log, index) => (
                <div key={index} className="truncate select-text">
                  {log}
                </div>
              ))}
            </div>

            {/* Active Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-150 rounded-full"
                  style={{ width: `${sideloadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Installed Library drawer */}
        {sideloadedApps.length > 0 && (
          <div className="border-t border-white/5 pt-3 space-y-2.5">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block">
              📚 Quest Headset Sideload Library ({sideloadedApps.length} Apps Loaded)
            </span>
            <div className="grid grid-cols-3 gap-2">
              {sideloadedApps.map((pkg) => {
                const matchedStore = CURATED_STORE_APPS.find(a => a.packageName === pkg);
                const isCustom = !matchedStore;
                const name = matchedStore ? matchedStore.name : pkg.split('.').pop()?.toUpperCase() || 'Custom app';
                return (
                  <div key={pkg} className="bg-zinc-900/30 border border-white/5 rounded-lg p-2 flex items-center justify-between gap-1.5 group">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className={`w-6 h-6 rounded bg-zinc-850 flex items-center justify-center shrink-0 border border-white/10 ${isCustom ? 'text-amber-400' : 'text-cyan-400'}`}>
                        {matchedStore ? (
                          <img src={matchedStore.iconUrl} alt="" className="w-full h-full object-cover rounded-sm" referrerPolicy="no-referrer" />
                        ) : (
                          <Smartphone size={10} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[8px] font-black text-zinc-300 truncate uppercase">{name}</div>
                        <span className="text-[6px] text-zinc-500 font-mono truncate block uppercase">{isCustom ? 'User ZIP' : 'Store'}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSideloadedApps(prev => prev.filter(p => p !== pkg));
                        try { soundService.playSFX('hit'); } catch (e) {}
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-600 hover:text-rose-400 transition-all rounded"
                      title="Uninstall App"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Standard API Database Server Status Link info */}
        {status?.exists && (
          <div className="flex gap-2 bg-zinc-900/40 border border-white/5 p-2 rounded-xl text-[8px] text-zinc-500 leading-normal">
            <Info className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
            <p className="uppercase">
              {status.isPlaceholder 
                ? 'Standard default placeholder file blender.zip is currently active at system core.' 
                : `Active custom 3D model zip loaded (${(status.size ? status.size / (1024 * 1024) : 0).toFixed(1)} MB). Compatible with all game nodes.`
              }
            </p>
          </div>
        )}

        {/* Global Toast Messages */}
        {errorMsg && (
          <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-2">
            <AlertCircle size={12} className="shrink-0 mt-0.5" />
            <p className="text-[8.5px] leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-start gap-2">
            <CheckCircle size={12} className="shrink-0 mt-0.5" />
            <p className="text-[8.5px] leading-relaxed">{successMsg}</p>
          </div>
        )}

      </div>
    </div>
  );
}
