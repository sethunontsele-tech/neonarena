import React, { useState, useEffect } from 'react';
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
  ChevronUp
} from 'lucide-react';
import JSZip from 'jszip';
import { soundService } from '../../services/soundService';

interface BlenderZipUploadProps {
  onUploadSuccess?: () => void;
  className?: string;
}

interface ScannedFile {
  name: string;
  dir: boolean;
  category: 'model' | 'texture' | 'code' | 'config' | 'other';
  ext: string;
}

export function BlenderZipUpload({ onUploadSuccess, className = '' }: BlenderZipUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Client-side ZIP Scanning State
  const [scanningZip, setScanningZip] = useState(false);
  const [scannedFiles, setScannedFiles] = useState<ScannedFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilesList, setShowFilesList] = useState(true);

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
    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(zipFile);
      const tempFiles: ScannedFile[] = [];

      loadedZip.forEach((relativePath, fileEntry) => {
        const ext = relativePath.split('.').pop()?.toLowerCase() || '';
        let category: 'model' | 'texture' | 'code' | 'config' | 'other' = 'other';

        if (['blend', 'obj', 'fbx', 'gltf', 'glb', 'stl', 'dae', '3ds'].includes(ext)) {
          category = 'model';
        } else if (['png', 'jpg', 'jpeg', 'tga', 'dds', 'bmp', 'tiff'].includes(ext)) {
          category = 'texture';
        } else if (['cs', 'py', 'cpp', 'h', 'js', 'ts'].includes(ext)) {
          category = 'code';
        } else if (['json', 'xml', 'yaml', 'txt', 'ini', 'cfg'].includes(ext)) {
          category = 'config';
        }

        tempFiles.push({
          name: relativePath,
          dir: fileEntry.dir,
          category,
          ext
        });
      });

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
    // 456 MB size limit
    const MAX_SIZE = 456 * 1024 * 1024; // 456 MB in bytes
    if (selectedFile.size > MAX_SIZE) {
      setErrorMsg(`Error: File size is ${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB, which exceeds the maximum limit of 456 MB!`);
      try { soundService.playSFX('hit'); } catch (e) {}
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.zip')) {
      setErrorMsg('Error: Selected file is not a .zip archive!');
      try { soundService.playSFX('hit'); } catch (e) {}
      return;
    }
    setFile(selectedFile);
    scanZipContents(selectedFile);
    try { soundService.playSFX('ui_hover'); } catch (e) {}
  };

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
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ base64: base64Data }),
          });

          const result = await response.json();
          setUploadProgress(100);

          if (result.success) {
            setSuccessMsg(`Successfully uploaded Blender .zip package (${(result.size / (1024 * 1024)).toFixed(1)} MB)!`);
            setFile(null);
            setScannedFiles([]);
            await checkStatus();
            try { soundService.playSFX('achievement'); } catch (e) {}
            if (onUploadSuccess) {
              onUploadSuccess();
            }
          } else {
            setErrorMsg(result.error || 'Failed to upload Blender package.');
            try { soundService.playSFX('hit'); } catch (e) {}
          }
        } catch (err: any) {
          setErrorMsg(`Network or Server error: ${err.message || err}`);
          try { soundService.playSFX('hit'); } catch (e) {}
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        clearInterval(progressInterval);
        setErrorMsg('Error reading file contents.');
        setUploading(false);
      };

      reader.readAsDataURL(file);

    } catch (err: any) {
      setErrorMsg(`Upload failed: ${err.message || err}`);
      setUploading(false);
      try { soundService.playSFX('hit'); } catch (e) {}
    }
  };

  // Archive statistics & health metrics
  const stats = React.useMemo(() => {
    const total = scannedFiles.filter(f => !f.dir).length;
    const models = scannedFiles.filter(f => f.category === 'model').length;
    const textures = scannedFiles.filter(f => f.category === 'texture').length;
    const configs = scannedFiles.filter(f => f.category === 'config').length;
    const codes = scannedFiles.filter(f => f.category === 'code').length;
    
    // Check for standard expected model files
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
      hasBlend,
      hasObj,
      hasFbx,
      hasGltf,
      isValidStructure: models > 0
    };
  }, [scannedFiles]);

  const filteredFiles = scannedFiles
    .filter(f => !f.dir && f.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 40); // limit preview lines

  return (
    <div id="blender-zip-uploader-panel" className={`bg-zinc-950/60 border border-white/5 rounded-2xl p-4 flex flex-col space-y-3 font-mono text-[10px] ${className}`}>
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h4 className="text-[9px] font-black tracking-widest text-zinc-400 uppercase flex items-center gap-1.5">
          <FileArchive size={12} className="text-amber-400" />
          Blender .ZIP Scanner (Max 456MB)
        </h4>
        <button 
          onClick={checkStatus} 
          className="text-zinc-500 hover:text-white transition-colors"
          title="Refresh Status"
        >
          <RefreshCw size={10} className={uploading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Database/Server Active Link Badge */}
      <div className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-all ${
        status?.isValidZip 
          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
          : 'bg-amber-500/5 border-amber-500/20 text-amber-400'
      }`}>
        <div className="text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${status?.isValidZip ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          Active Game Link: {status?.isValidZip ? 'ONLINE' : 'OFFLINE'}
        </div>
        <p className="text-[8px] leading-relaxed text-zinc-400">
          {status?.exists 
            ? (status.isPlaceholder 
                ? '⚠️ System default placeholder is active. Upload your custom Blender .zip to unlock.'
                : status.isValidZip 
                  ? `🔓 Active: custom blender.zip loaded (${(status.size ? status.size / (1024 * 1024) : 0).toFixed(1)} MB / 456 MB)`
                  : '❌ Invalid archive at /blender.zip. Needs a valid zip!')
            : '❌ /blender.zip is missing! Upload your zip package below.'
          }
        </p>
      </div>

      {/* Drag & Drop Area */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${
          dragActive 
            ? 'border-amber-400 bg-amber-400/5' 
            : file 
              ? 'border-emerald-500 bg-emerald-500/5' 
              : 'border-white/10 hover:border-white/20 bg-black/40'
        }`}
      >
        <input 
          type="file" 
          id="blender-file-picker" 
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          accept=".zip"
          onChange={handleFileInput}
          disabled={uploading || scanningZip}
        />

        <UploadCloud size={24} className={`mb-2 ${file ? 'text-emerald-400' : dragActive ? 'text-amber-400 animate-bounce' : 'text-zinc-500'}`} />
        
        {file ? (
          <div className="space-y-1">
            <p className="font-bold text-white text-[9.5px] break-all">{file.name}</p>
            <p className="text-zinc-500 text-[8px]">{(file.size / (1024 * 1024)).toFixed(1)} MB - ZIP Target Identified</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="font-medium text-zinc-300">Drag & drop your Blender <code>.zip</code> here</p>
            <p className="text-zinc-600 text-[8px] uppercase tracking-wider">or click to browse local files (Max 456MB)</p>
          </div>
        )}
      </div>

      {/* Client-Side Zip Scanner Diagnostics */}
      {scanningZip && (
        <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 flex items-center justify-center gap-2 text-amber-400">
          <Loader2 size={12} className="animate-spin" />
          <span>Analyzing ZIP Directory Headers...</span>
        </div>
      )}

      {!scanningZip && scannedFiles.length > 0 && (
        <div className="bg-zinc-950/95 border border-white/5 rounded-xl p-3 space-y-3">
          {/* Diagnostic Metrics */}
          <div className="grid grid-cols-2 gap-2 text-[8.5px] border-b border-white/5 pb-2.5">
            <div className="space-y-1">
              <div className="text-zinc-500 font-bold uppercase tracking-wider">ARCHIVE DIAGNOSTICS</div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Box size={10} className="text-amber-400" />
                <span>3D Models: <strong>{stats.models}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <ImageIcon size={10} className="text-cyan-400" />
                <span>Textures: <strong>{stats.textures}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <FileText size={10} className="text-zinc-400" />
                <span>Configs/Other: <strong>{stats.configs + stats.codes + (scannedFiles.length - stats.total)}</strong></span>
              </div>
            </div>

            <div className="space-y-1 border-l border-white/5 pl-2">
              <div className="text-zinc-500 font-bold uppercase tracking-wider">HEALTH SUMMARY</div>
              <div className="flex items-center gap-1">
                <ShieldCheck size={11} className={stats.isValidStructure ? "text-emerald-400" : "text-amber-400"} />
                <span className={stats.isValidStructure ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                  {stats.isValidStructure ? "VERIFIED VALID" : "NO 3D DETECTED"}
                </span>
              </div>
              <div className="text-[7.5px] leading-snug text-zinc-500">
                {stats.hasBlend && "✓ Core Blender (.blend) file located."}
                {stats.hasObj && "✓ Obj geometry (.obj) located."}
                {stats.hasFbx && "✓ FBX asset (.fbx) located."}
                {stats.hasGltf && "✓ GLTF model (.gltf/.glb) located."}
                {!stats.hasBlend && !stats.hasObj && !stats.hasFbx && !stats.hasGltf && "⚠️ Missing Blender (.blend) or OBJ format."}
              </div>
            </div>
          </div>

          {/* Interactive File Explorer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setShowFilesList(!showFilesList)}
                className="flex items-center gap-1 text-[8px] font-bold uppercase text-zinc-400 hover:text-white transition-colors"
              >
                {showFilesList ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                Internal Archive Contents ({stats.total} Files)
              </button>
              {showFilesList && (
                <div className="relative w-28">
                  <input
                    type="text"
                    placeholder="Search zip..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded px-1.5 py-0.5 text-[8px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                  <Search size={8} className="absolute right-1.5 top-1 text-zinc-500" />
                </div>
              )}
            </div>

            {showFilesList && (
              <div className="max-h-28 overflow-y-auto border border-white/5 rounded-lg bg-black/40 p-1.5 space-y-1 text-[8px] custom-scrollbar">
                {filteredFiles.length === 0 ? (
                  <div className="text-zinc-600 italic p-1 text-center">No matching files inside the ZIP.</div>
                ) : (
                  filteredFiles.map((f, i) => {
                    let IconComp = HelpCircle;
                    let color = 'text-zinc-600';
                    if (f.category === 'model') { IconComp = Box; color = 'text-amber-400'; }
                    else if (f.category === 'texture') { IconComp = ImageIcon; color = 'text-cyan-400'; }
                    else if (f.category === 'code') { IconComp = Code; color = 'text-emerald-400'; }
                    else if (f.category === 'config') { IconComp = FileText; color = 'text-purple-400'; }

                    return (
                      <div key={i} className="flex items-center justify-between p-1 hover:bg-white/5 rounded">
                        <span className="truncate max-w-[140px] text-zinc-400 flex items-center gap-1">
                          <IconComp size={9} className={`${color} shrink-0`} />
                          {f.name}
                        </span>
                        <span className="uppercase text-[7px] text-zinc-600 px-1 border border-zinc-800 rounded font-bold shrink-0">
                          {f.ext || 'dir'}
                        </span>
                      </div>
                    );
                  })
                )}
                {scannedFiles.length > 40 && (
                  <div className="text-[7.5px] text-zinc-500 italic text-center pt-1 border-t border-white/5">
                    Showing first 40 files out of {scannedFiles.length}.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Control Actions */}
      {file && !uploading && !scanningZip && (
        <button
          onClick={handleUpload}
          disabled={!stats.isValidStructure}
          className={`w-full py-2 font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            stats.isValidStructure 
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black' 
              : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-60'
          }`}
        >
          {stats.isValidStructure ? 'LINK SCANNED ZIP TO PLAYGROUND' : 'FIX ZIP ERRORS TO UPLOAD'}
        </button>
      )}

      {uploading && (
        <div className="space-y-1.5 p-2 bg-zinc-950 rounded-xl border border-white/5">
          <div className="flex items-center justify-between text-[8px] text-zinc-400 font-bold uppercase">
            <span className="flex items-center gap-1">
              <Loader2 size={10} className="animate-spin text-amber-400" />
              Uploading & writing to disk...
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-amber-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

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
  );
}
