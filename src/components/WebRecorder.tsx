import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, Square, Download, Trash2, Play, Pause, X, Clock, Monitor, 
  Layers, Disc, Film, AlertCircle, Sparkles, FolderOpen, Volume2, Share2, ShieldAlert
} from 'lucide-react';
import { useGameStore } from '../store';
import { soundService } from '../services/soundService';

interface GameplayClip {
  id: string;
  name: string;
  date: string;
  size: string;
  duration: string;
  blob?: Blob;
  url?: string;
}

// Simple IndexedDB Utility to store video blobs persistently without breaking localStorage limits
const DB_NAME = 'GameplayRecorderDB';
const STORE_NAME = 'gameplay_clips';

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveClipToDB(clip: GameplayClip, blob: Blob): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put({ ...clip, blob });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

async function loadClipsFromDB(): Promise<GameplayClip[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const clips = request.result.map(item => {
        // Create Blob URL for in-app playback
        const url = URL.createObjectURL(item.blob);
        return {
          id: item.id,
          name: item.name,
          date: item.date,
          size: item.size,
          duration: item.duration,
          url
        };
      });
      resolve(clips);
    };
    request.onerror = () => reject(request.error);
  });
}

async function deleteClipFromDB(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export const WebRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'canvas' | 'screen' | null>(null);
  const [recordingQuality, setRecordingQuality] = useState<'720p' | '1080p'>('720p');
  const [bufferSize, setBufferSize] = useState(0);
  const [recordTime, setRecordTime] = useState(0);
  const [clips, setClips] = useState<GameplayClip[]>([]);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [playbackName, setPlaybackName] = useState<string>('');
  const [showOptions, setShowOptions] = useState(false);
  const [recorderError, setRecorderError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load clips from database on mount
  useEffect(() => {
    loadClipsFromDB()
      .then(loaded => setClips(loaded))
      .catch(err => console.error('IndexedDB initialization failed:', err));

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      stopTracks();
    };
  }, []);

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const triggerSound = (name: string) => {
    try {
      soundService.playSFX(name as any);
    } catch (e) {
      // Fallback
    }
  };

  const startRecording = async (mode: 'canvas' | 'screen') => {
    triggerSound('ui_click');
    setRecorderError(null);
    recordedChunksRef.current = [];
    setRecordTime(0);
    setBufferSize(0);
    setRecordingMode(mode);

    try {
      let captureStream: MediaStream | null = null;

      if (mode === 'canvas') {
        // Attempt to find the game's Three.js Canvas element
        const canvas = document.querySelector('canvas');
        if (!canvas) {
          throw new Error('Game visual render field not detected. Make sure the Arena is active.');
        }

        // Capture canvas stream at 30 FPS
        const canvasStream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : null;
        if (!canvasStream) {
          throw new Error('This browser does not support high-fidelity canvas video capture.');
        }

        // Try to capture default microphone audio so users can record commentary too!
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Combine audio and video
          const tracks = [...canvasStream.getVideoTracks(), ...audioStream.getAudioTracks()];
          captureStream = new MediaStream(tracks);
        } catch (audioErr) {
          console.warn('Microphone stream blocked, capturing video only:', audioErr);
          captureStream = canvasStream;
        }

      } else {
        // Standard Screen Capture API (Tab, Window, or entire Monitor)
        const videoConstraints = recordingQuality === '1080p'
          ? { width: 1920, height: 1080, frameRate: 30 }
          : { width: 1280, height: 720, frameRate: 30 };

        captureStream = await navigator.mediaDevices.getDisplayMedia({
          video: videoConstraints,
          audio: true // Captures tab audio
        });
      }

      if (!captureStream) {
        throw new Error('Failed to establish a valid media capture channel.');
      }

      streamRef.current = captureStream;

      // Select mimeType support
      let options = { mimeType: 'video/webm;codecs=vp9' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm;codecs=vp8' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
      }

      const recorder = new MediaRecorder(captureStream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          const currentSize = recordedChunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0);
          setBufferSize(currentSize);
        }
      };

      recorder.onstop = async () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        stopTracks();

        const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const finalDuration = recordTime;
        
        const now = new Date();
        const clipId = 'clip_' + Date.now();
        const clipName = `GAMEPLAY_CAPTURE_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}.webm`;
        
        const newClip: GameplayClip = {
          id: clipId,
          name: clipName,
          date: now.toLocaleString(),
          size: `${(videoBlob.size / (1024 * 1024)).toFixed(2)} MB`,
          duration: formatDuration(finalDuration)
        };

        try {
          await saveClipToDB(newClip, videoBlob);
          const updatedClips = await loadClipsFromDB();
          setClips(updatedClips);
          triggerSound('complete');
        } catch (dbErr) {
          console.error('Failed to save to database, using runtime URL:', dbErr);
          newClip.url = URL.createObjectURL(videoBlob);
          setClips(prev => [newClip, ...prev]);
        }

        setIsRecording(false);
        setRecordingMode(null);
        setBufferSize(0);
      };

      recorder.start(1000); // chunk every 1 second
      setIsRecording(true);
      setShowOptions(false);

      // Start elapsed timer
      timerIntervalRef.current = setInterval(() => {
        setRecordTime(prev => {
          const nextTime = prev + 1;
          const currentSize = recordedChunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0);
          setBufferSize(currentSize);
          return nextTime;
        });
      }, 1000);

    } catch (err: any) {
      console.error('Recording initialization failed:', err);
      setRecorderError(err.message || 'Media access rejected or cancelled.');
      setIsRecording(false);
      setRecordingMode(null);
      stopTracks();
    }
  };

  const stopRecording = () => {
    triggerSound('ui_click');
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleDelete = async (id: string, url?: string | null) => {
    triggerSound('ui_click');
    if (url) {
      URL.revokeObjectURL(url);
    }
    try {
      await deleteClipFromDB(id);
      const updated = await loadClipsFromDB();
      setClips(updated);
    } catch (err) {
      setClips(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <>
      {/* Recording controller button located at the bottom-left layout of HUD */}
      <div className="fixed bottom-20 left-4 z-[90] pointer-events-auto flex items-center gap-3">
        {/* Toggle Panel Button */}
        <button
          onClick={() => {
            triggerSound('ui_click');
            setShowOptions(!showOptions);
            setRecorderError(null);
          }}
          className={`h-11 px-4 rounded-xl border font-mono text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 shadow-lg transition-all ${
            isRecording 
              ? 'bg-rose-600 border-rose-400 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
              : 'bg-zinc-900/90 border-white/10 text-rose-400 hover:text-white hover:border-rose-500/50 hover:bg-rose-950/20'
          }`}
          title="Open Video Web Recorder Controller"
        >
          <Disc className={`w-4 h-4 ${isRecording ? 'animate-spin' : 'text-rose-500'}`} />
          {isRecording ? `REC ${formatDuration(recordTime)}` : 'RECORD PLAY'}
        </button>

        {/* Folder / Gallery Button */}
        <button
          onClick={() => {
            triggerSound('ui_click');
            setIsArchiveOpen(true);
            setShowOptions(false);
          }}
          className="h-11 w-11 bg-zinc-900/90 border border-white/10 text-cyan-400 hover:text-white hover:border-cyan-500/40 rounded-xl flex items-center justify-center shadow-lg transition-all"
          title="Open Recorded Clips Folder"
        >
          <FolderOpen className="w-4.5 h-4.5" />
          {clips.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-cyan-500 text-black font-mono font-black text-[9px] rounded-full flex items-center justify-center border-2 border-zinc-950">
              {clips.length}
            </span>
          )}
        </button>
      </div>

      {/* Mode selection modal */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed bottom-32 left-4 z-[95] w-72 bg-zinc-950/95 border border-white/10 rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.8)] font-sans"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
              <div className="flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">RECORDER SOURCE</span>
              </div>
              <button 
                onClick={() => setShowOptions(false)} 
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {recorderError && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl mb-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-[9px] font-mono font-bold text-rose-300 uppercase leading-snug">{recorderError}</p>
              </div>
            )}

            {/* Quality Selector setting */}
            <div className="bg-zinc-900 border border-white/5 rounded-xl p-2.5 mb-3 space-y-1.5">
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block">RECORDING QUALITY</span>
              <div className="grid grid-cols-2 gap-2">
                {(['720p', '1080p'] as const).map(quality => (
                  <button
                    key={quality}
                    onClick={() => {
                      triggerSound('ui_click');
                      setRecordingQuality(quality);
                    }}
                    className={`py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider border transition-all cursor-pointer ${
                      recordingQuality === quality
                        ? 'bg-rose-500/15 border-rose-500 text-rose-400'
                        : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-white hover:border-white/10'
                    }`}
                  >
                    {quality === '720p' ? '720p HD' : '1080p FHD'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => startRecording('canvas')}
                className="w-full text-left p-3 bg-zinc-900 hover:bg-cyan-950/20 border border-white/5 hover:border-cyan-500/30 rounded-xl transition-all flex items-center gap-3 cursor-pointer group"
              >
                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 shrink-0 group-hover:scale-110 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-white block uppercase tracking-wider">Record Canvas Field</span>
                  <span className="text-[8px] text-zinc-500 block uppercase font-medium">Capture internal high-FPS arena play</span>
                </div>
              </button>

              <button
                onClick={() => startRecording('screen')}
                className="w-full text-left p-3 bg-zinc-900 hover:bg-emerald-950/20 border border-white/5 hover:border-emerald-500/30 rounded-xl transition-all flex items-center gap-3 cursor-pointer group"
              >
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-white block uppercase tracking-wider">Record Web Tab / Screen</span>
                  <span className="text-[8px] text-zinc-500 block uppercase font-medium">Capture entire tab audio & interface</span>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording controller bar overlay (Shows when recording is active) */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] bg-zinc-950/95 border-2 border-rose-500/40 shadow-[0_0_40px_rgba(239,68,68,0.35)] px-6 py-4 rounded-2xl flex items-center gap-6 font-mono text-[10px] uppercase font-bold text-white"
          >
            <div className="flex items-center gap-2.5 relative">
              <span className="w-3.5 h-3.5 bg-rose-600 rounded-full animate-ping shrink-0" />
              <span className="w-3.5 h-3.5 bg-rose-500 rounded-full absolute shrink-0" />
              <span className="text-[11px] font-black text-rose-500 tracking-wider">RECORDING GAMEPLAY</span>
            </div>

            <div className="h-6 w-[1px] bg-white/10" />

            <div className="space-y-0.5">
              <span className="text-[7.5px] text-zinc-500 font-black block tracking-widest">DURATION</span>
              <span className="text-xs font-black tracking-widest text-zinc-200">{formatDuration(recordTime)}</span>
            </div>

            <div className="h-6 w-[1px] bg-white/10" />

            <div className="space-y-0.5 w-24 shrink-0">
              <span className="text-[7.5px] text-zinc-500 font-black block tracking-widest">TEMP BUFFER</span>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-white/5 relative">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all duration-300 animate-pulse"
                  style={{ width: `${Math.min(100, (bufferSize / (150 * 1024 * 1024)) * 100)}%` }}
                />
              </div>
              <span className="text-[8px] font-bold text-rose-400 block tracking-tighter uppercase whitespace-nowrap">
                {(bufferSize / (1024 * 1024)).toFixed(2)} MB / 150M
              </span>
            </div>

            <div className="h-6 w-[1px] bg-white/10" />

            <div className="space-y-0.5">
              <span className="text-[7.5px] text-zinc-500 font-black block tracking-widest font-bold">ENCODER MODE</span>
              <span className="text-[8.5px] font-black text-cyan-400 tracking-wider block">
                {recordingMode === 'canvas' ? `${recordingQuality} CANVAS` : `${recordingQuality} SCREEN`}
              </span>
            </div>

            <button
              onClick={stopRecording}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 border border-rose-400/40 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.25)]"
            >
              ⏹ STOP CAPTURE
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capture archives folder slider panel */}
      <AnimatePresence>
        {isArchiveOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-white/10 rounded-[2.5rem] p-8 max-w-4xl w-full h-[80vh] flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.6)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-rose-400" />

              {/* Head Section */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase flex items-center gap-2">
                    <Film className="w-7 h-7 text-cyan-400 animate-pulse" />
                    Gameplay Captures Folder
                  </h2>
                  <div className="h-1 w-24 bg-cyan-500 mt-2" />
                </div>
                <button 
                  onClick={() => {
                    triggerSound('ui_click');
                    setIsArchiveOpen(false);
                  }}
                  className="p-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:border-rose-500 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Clips Gallery Area */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 mb-4">
                {clips.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clips.map(clip => (
                      <div key={clip.id} className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 flex flex-col justify-between hover:border-cyan-500/30 transition-all group relative">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Disc className="w-4 h-4 text-rose-500 shrink-0 animate-spin-slow" />
                            <h4 className="text-[11px] font-black text-white uppercase font-mono truncate max-w-[280px]" title={clip.name}>
                              {clip.name}
                            </h4>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-zinc-500 uppercase">
                            <div>📅 Date: <strong className="text-zinc-300">{clip.date}</strong></div>
                            <div>⏱ Duration: <strong className="text-zinc-300">{clip.duration}</strong></div>
                            <div className="col-span-2">⚖ File Weight: <strong className="text-cyan-400">{clip.size}</strong></div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4 mt-4 border-t border-white/5">
                          {clip.url && (
                            <button
                              onClick={() => {
                                triggerSound('ui_click');
                                setPlaybackUrl(clip.url || null);
                                setPlaybackName(clip.name);
                              }}
                              className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl text-[9px] font-mono font-black uppercase tracking-wider text-center cursor-pointer transition-all flex items-center justify-center gap-1.5"
                            >
                              <Play className="w-3.5 h-3.5 fill-black" /> PLAY PREVIEW
                            </button>
                          )}
                          
                          {clip.url && (
                            <a
                              href={clip.url}
                              download={clip.name}
                              className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white rounded-xl text-[9px] font-mono font-black uppercase tracking-wider text-center cursor-pointer transition-all flex items-center justify-center"
                              title="Download to system disk"
                              onClick={() => triggerSound('ui_click')}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => handleDelete(clip.id, clip.url)}
                            className="py-2 px-3 bg-zinc-800 hover:bg-rose-950 hover:text-rose-400 border border-white/10 hover:border-rose-500/20 text-zinc-400 rounded-xl text-[9px] font-mono font-black uppercase tracking-wider text-center cursor-pointer transition-all flex items-center justify-center"
                            title="Delete file permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 text-zinc-600 border border-dashed border-white/10 rounded-3xl">
                    <Video className="w-12 h-12 mb-4 opacity-20 text-cyan-400" />
                    <span className="text-[11px] font-mono font-black uppercase tracking-widest block">No captures saved in folder</span>
                    <span className="text-[9px] text-zinc-500 block uppercase mt-1 max-w-sm">Use the red "Record Play" deck controller in HUD during gameplay to create captures</span>
                  </div>
                )}
              </div>

              {/* Status bar */}
              <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-4 font-mono text-[9px] uppercase font-bold text-zinc-500">
                <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-cyan-400" /> STABLE ENCODER: VP9/WEBM</span>
                <span>CAPACITY: HIGH-SPEED INDEXED DATABASE</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cinematic Preview Player Modal */}
      <AnimatePresence>
        {playbackUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              className="bg-zinc-950 border border-cyan-400/30 rounded-[2.5rem] p-6 max-w-4xl w-full flex flex-col gap-4 relative shadow-[0_0_50px_rgba(34,211,238,0.2)]"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400 rounded-t-[2.5rem]" />

              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-white font-mono">{playbackName}</span>
                </div>
                <button
                  onClick={() => {
                    triggerSound('ui_click');
                    setPlaybackUrl(null);
                  }}
                  className="px-3 py-1.5 bg-zinc-900 border border-white/5 hover:border-rose-500 rounded-xl text-zinc-400 hover:text-white transition-all text-[9px] font-mono font-bold tracking-wider cursor-pointer"
                >
                  ✕ CLOSE PLAYER
                </button>
              </div>

              <div className="bg-black rounded-2xl border border-white/10 overflow-hidden relative aspect-video flex items-center justify-center">
                <video 
                  src={playbackUrl} 
                  controls 
                  autoPlay 
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 flex items-center justify-between font-mono text-[8.5px] uppercase font-bold text-zinc-500">
                <span>Standard VP9 Codec • 30 FPS Stream Decode</span>
                <span className="text-cyan-400">Preview active</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
