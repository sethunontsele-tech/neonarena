import React, { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Loader2, FileArchive, RefreshCw } from 'lucide-react';
import { soundService } from '../services/soundService';

interface BlenderZipUploadProps {
  onUploadSuccess?: () => void;
  className?: string;
}

export function BlenderZipUpload({ onUploadSuccess, className = '' }: BlenderZipUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    // Auto refresh status periodically
    const interval = setInterval(checkStatus, 6000);
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

  const validateAndSetFile = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.zip')) {
      setErrorMsg('Error: Selected file is not a .zip archive!');
      try { soundService.playSFX('hit'); } catch (e) {}
      return;
    }
    setFile(selectedFile);
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
      
      // Simulate progress during loading
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
            setSuccessMsg(`Successfully uploaded Blender .zip package (${(result.size / 1024).toFixed(1)} KB)!`);
            setFile(null);
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

  return (
    <div id="blender-zip-uploader-panel" className={`bg-zinc-950/60 border border-white/5 rounded-2xl p-4 flex flex-col space-y-3 font-mono text-[10px] ${className}`}>
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h4 className="text-[9px] font-black tracking-widest text-zinc-400 uppercase flex items-center gap-1.5">
          <FileArchive size={12} className="text-amber-400" />
          Blender Asset Bridge (blender.zip)
        </h4>
        <button 
          onClick={checkStatus} 
          className="text-zinc-500 hover:text-white transition-colors"
          title="Refresh Status"
        >
          <RefreshCw size={10} className={uploading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Current File Status Badge */}
      <div className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
        status?.isValidZip 
          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
          : 'bg-amber-500/5 border-amber-500/20 text-amber-400'
      }`}>
        <div className="text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${status?.isValidZip ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
          Active Game Link: {status?.isValidZip ? 'ONLINE (UNLOCKED)' : 'OFFLINE (LOCKED)'}
        </div>
        <p className="text-[8.5px] leading-relaxed">
          {status?.exists 
            ? (status.isPlaceholder 
                ? '⚠️ Standard system placeholder detected at "/blender.zip". You must upload your own Blender model ZIP to compile and play customized mods!'
                : status.isValidZip 
                  ? `🔓 Verified: Valid Blender .zip loaded successfully (${(status.size ? status.size / 1024 : 0).toFixed(1)} KB)`
                  : '❌ Invalid archive format detected at "/blender.zip". Make sure it is a real ZIP file.')
            : '❌ "/blender.zip" does not exist! Upload a .zip model file to initialize.'
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
          disabled={uploading}
        />

        <UploadCloud size={24} className={`mb-2 ${file ? 'text-emerald-400' : dragActive ? 'text-amber-400 animate-bounce' : 'text-zinc-500'}`} />
        
        {file ? (
          <div className="space-y-1">
            <p className="font-bold text-white text-[9.5px] break-all">{file.name}</p>
            <p className="text-zinc-500 text-[8px]">{(file.size / 1024).toFixed(1)} KB - Ready to link</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="font-medium text-zinc-300">Drag & drop your Blender <code>.zip</code> file here</p>
            <p className="text-zinc-600 text-[8px] uppercase tracking-wider">or click to browse local folders</p>
          </div>
        )}
      </div>

      {/* Control Actions / Status Log */}
      {file && !uploading && (
        <button
          onClick={handleUpload}
          className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
        >
          LINK ZIP PACKAGE TO MOD MAKER
        </button>
      )}

      {uploading && (
        <div className="space-y-1.5 p-2 bg-zinc-950 rounded-xl border border-white/5">
          <div className="flex items-center justify-between text-[8px] text-zinc-400 font-bold uppercase">
            <span className="flex items-center gap-1">
              <Loader2 size={10} className="animate-spin text-amber-400" />
              Uploading payload...
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
