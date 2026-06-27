import { useRef, useEffect, useState, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

const VideoCall = ({ roomId, socket, userId, onEnd }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      return null;
    }
  }, []);

  const createPeerConnection = useCallback((stream) => {
    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    stream?.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc:ice-candidate', { roomId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setIsConnected(true);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected') {
        endCall();
      }
    };

    return pc;
  }, [roomId, socket]);

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit('webrtc:join-room', { roomId });

    const init = async () => {
      const stream = await startLocalStream();
      if (!stream) return;

      const pc = createPeerConnection(stream);

      socket.on('webrtc:user-joined', async ({ userId: joinedUserId }) => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc:offer', { roomId, offer });
      });

      socket.on('webrtc:offer', async ({ userId: offererId, offer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc:answer', { roomId, answer });
      });

      socket.on('webrtc:answer', async ({ userId: answererId, answer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on('webrtc:ice-candidate', async ({ userId: candidateUserId, candidate }) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding ICE candidate:', e);
        }
      });

      socket.on('webrtc:user-left', () => {
        endCall();
      });
    };

    init();

    return () => {
      socket.off('webrtc:user-joined');
      socket.off('webrtc:offer');
      socket.off('webrtc:answer');
      socket.off('webrtc:ice-candidate');
      socket.off('webrtc:user-left');
      socket.emit('webrtc:leave-room', { roomId });
      endCall();
    };
  }, [socket, roomId]);

  const endCall = useCallback(() => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setIsConnected(false);
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    onEnd?.();
  }, [localStream, onEnd]);

  const toggleMute = () => {
    localStream?.getAudioTracks().forEach((track) => {
      track.enabled = isMuted;
    });
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    localStream?.getVideoTracks().forEach((track) => {
      track.enabled = isVideoOff;
    });
    setIsVideoOff(!isVideoOff);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex-1 relative flex">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white/30 shadow-lg"
        />
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Phone size={28} className="text-primary" />
              </div>
              <p className="text-white/70 text-lg">Waiting for participant to join...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-6 py-4 bg-surface/90 backdrop-blur">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-error text-white' : 'bg-surface-lighter text-text hover:bg-surface-lighter/80'}`}
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>
        <button
          onClick={endCall}
          className="p-4 rounded-full bg-error text-white hover:bg-error/90 transition-colors"
        >
          <PhoneOff size={22} />
        </button>
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-colors ${isVideoOff ? 'bg-error text-white' : 'bg-surface-lighter text-text hover:bg-surface-lighter/80'}`}
        >
          {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
