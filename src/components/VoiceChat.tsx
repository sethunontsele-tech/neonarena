import { useEffect, useRef } from 'react';
import { useGameStore } from '../store';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function VoiceChat() {
  const socket = useGameStore(state => state.socket);
  const isMuted = useGameStore(state => state.isMuted);
  const otherPlayers = useGameStore(state => state.otherPlayers);
  
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const audioElementsRef = useRef<Record<string, HTMLAudioElement>>({});

  // Handle local stream and muting
  useEffect(() => {
    async function setupLocalStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        
        // Apply initial mute state
        stream.getAudioTracks().forEach(track => {
          track.enabled = !isMuted;
        });

        // Add tracks to existing peers
        Object.values(peersRef.current).forEach(pc => {
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
        });
      } catch (err) {
        console.error('Failed to get local stream:', err);
        // Automatically set isMuted to true and inform the user of the permission failure
        useGameStore.setState({ isMuted: true });
        useGameStore.getState().addEvent('⚠️ MICROPHONE PERMISSION DENIED - VOICE CHAT DISABLED');
      }
    }

    if (socket && !isMuted && !localStreamRef.current) {
      setupLocalStream();
    }

    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }

    // Stop streams when muted to free up hardware resources and clear browser indicators
    if (isMuted && localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [socket, isMuted]);

  // Handle peer connections
  useEffect(() => {
    if (!socket) return;

    const handleSignal = async (data: { from: string, signal: any }) => {
      let pc = peersRef.current[data.from];

      if (!pc) {
        pc = createPeer(data.from);
      }

      if (data.signal.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.signal.sdp));
        if (data.signal.sdp.type === 'offer') {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('signal', { to: data.from, signal: { sdp: pc.localDescription } });
        }
      } else if (data.signal.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
      }
    };

    socket.on('signal', handleSignal);

    // Create peers for existing players
    Object.keys(otherPlayers).forEach(id => {
      if (!peersRef.current[id]) {
        const pc = createPeer(id, true);
      }
    });

    // Cleanup peers for players who left
    Object.keys(peersRef.current).forEach(id => {
      if (!otherPlayers[id]) {
        peersRef.current[id].close();
        delete peersRef.current[id];
        if (audioElementsRef.current[id]) {
          audioElementsRef.current[id].remove();
          delete audioElementsRef.current[id];
        }
      }
    });

    function createPeer(id: string, isInitiator = false) {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peersRef.current[id] = pc;

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket!.emit('signal', { to: id, signal: { candidate: event.candidate } });
        }
      };

      pc.ontrack = (event) => {
        if (!audioElementsRef.current[id]) {
          const audio = new Audio();
          audio.autoplay = true;
          audioElementsRef.current[id] = audio;
        }
        audioElementsRef.current[id].srcObject = event.streams[0];
      };

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current!));
      }

      if (isInitiator) {
        pc.createOffer().then(async (offer) => {
          await pc.setLocalDescription(offer);
          socket!.emit('signal', { to: id, signal: { sdp: pc.localDescription } });
        });
      }

      return pc;
    }

    return () => {
      socket.off('signal', handleSignal);
      Object.values(peersRef.current).forEach(pc => pc.close());
      peersRef.current = {};
      Object.values(audioElementsRef.current).forEach(el => el.remove());
      audioElementsRef.current = {};
    };
  }, [socket, otherPlayers]);

  return null;
}
