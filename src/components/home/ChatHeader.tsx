import { Headset, Video, X, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { io, Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { create } from "zustand";

interface User {
    _id: string;
    username: string;
    profilePic?: string;
}

interface StoreState {
    selectedUser: User | null;
    setSelectedUser: (user: User | null) => void;
}

interface AuthState {
    onlineUsers: string[];
}

interface SocketStore {
    socket: Socket | null;
    setSocket: (socket: Socket) => void;
}

const useSocketStore = create<SocketStore>((set) => ({
    socket: io(`${import.meta.env.VITE_API_BASE_URL}`, { autoConnect: false }),
    setSocket: (socket) => set({ socket }),
}));

const ChatHeader = () => {
    const { selectedUser, setSelectedUser }: StoreState | any = useChatStore();
    const { onlineUsers }: AuthState = useAuthStore();

    const [isCalling, setIsCalling] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isCameraOn, setIsCameraOn] = useState<boolean>(true);

    const localStreamRef = useRef<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const { socket }: any = useSocketStore();

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }

        socket.on("ice-candidate", async (candidate: any) => {
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        socket.on("offer", async (offer: any) => {
            if (!peerConnectionRef.current) {
                createPeerConnection();
            }
            await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(offer));

            const answer = await peerConnectionRef.current?.createAnswer();
            await peerConnectionRef.current?.setLocalDescription(answer);
            socket.emit("answer", answer);
        });

        socket.on("answer", async (answer: any) => {
            await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
        });

        return () => {
            socket.off("ice-candidate");
            socket.off("offer");
            socket.off("answer");
        };
    }, [socket]);

    const createPeerConnection = () => {
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        peerConnection.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", event.candidate);
            }
        };

        peerConnectionRef.current = peerConnection;
    };

    const startCall = async (video: boolean) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: video,
            });

            localStreamRef.current = stream;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            createPeerConnection();

            stream.getTracks().forEach((track) => {
                peerConnectionRef.current?.addTrack(track, stream);
            });

            const offer = await peerConnectionRef.current?.createOffer();
            await peerConnectionRef.current?.setLocalDescription(offer);
            socket.emit("offer", offer);

            setIsCalling(true);
        } catch (error) {
            console.error("Error accessing devices", error);
        }
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleCamera = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsCameraOn(!isCameraOn);
        }
    };

    const endCall = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        setIsCalling(false);
    };

    return (
        <div className="p-2.5 border-b border-base-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <h3 className="font-medium">{selectedUser?.username}</h3>
                        <p className="text-sm text-base-content/70">
                            {onlineUsers.includes(selectedUser?._id) ? "Online" : "Offline"}
                        </p>
                    </div>
                </div>
                <div className="gap-10 flex">
                    <button onClick={() => startCall(false)}>
                        <Headset />
                    </button>
                    <button onClick={() => startCall(true)}>
                        <Video />
                    </button>
                    <button onClick={() => setSelectedUser(null)}>
                        <X />
                    </button>
                </div>
            </div>

            {isCalling && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="bg-white rounded-lg p-6 w-4/5 max-w-lg shadow-lg relative">
                        <h2 className="text-lg font-semibold text-center mb-4">Video Call</h2>
                        <div className="flex justify-center gap-4">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                className="w-48 h-48 bg-gray-900 rounded-lg"
                            />
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                className="w-48 h-48 bg-gray-900 rounded-lg"
                            />
                        </div>
                        <div className="flex justify-center gap-6 mt-4">
                            <button onClick={toggleMute} className="p-2 bg-gray-200 rounded-full">
                                {isMuted ? <MicOff /> : <Mic />}
                            </button>
                            <button onClick={toggleCamera} className="p-2 bg-gray-200 rounded-full">
                                {isCameraOn ? <Video /> : <VideoOff />}
                            </button>
                            <button onClick={endCall} className="p-2 bg-red-500 text-white rounded-full">
                                <PhoneOff />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default ChatHeader;
