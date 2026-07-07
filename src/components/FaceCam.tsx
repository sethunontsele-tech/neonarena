import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';
import { Camera, CameraOff, Maximize2, Minimize2 } from 'lucide-react';

export const FaceCam: React.FC = () => {
  const faceCamEnabled = useGameStore(state => state.faceCamEnabled);
  const setFaceCamEnabled = useGameStore(state => state.setFaceCamEnabled);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        setError(null);
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480, facingMode: 'user' } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Failed to start camera:', err);
        setError('Camera access denied or unavailable.');
        setFaceCamEnabled(false);
      }
    }

    if (faceCamEnabled) {
      startCamera();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [faceCamEnabled, setFaceCamEnabled]);

  return (
    <div className="fixed bottom-4 right-4 z-[100] pointer-events-auto">
      <AnimatePresence>
        {faceCamEnabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              width: isExpanded ? 400 : 200,
              height: isExpanded ? 300 : 150
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="relative bg-black border-2 border-white/20 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] group"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
              style={{ transform: 'scaleX(-1)' }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
              <div className="text-[8px] font-black text-white/50 uppercase tracking-widest">Live Feed</div>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-white"
              >
                {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              </button>
            </div>

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center">
                <div className="text-[10px] font-bold text-red-400 uppercase">{error}</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
