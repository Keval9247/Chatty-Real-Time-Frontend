import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket: any = io(`${import.meta.env.VITE_API_BASE_URL}`);
console.log("🚀🚀 Your selected text is => socket: ", socket);

const AudioCall: React.FC = () => {
    const [me, setMe] = useState<string>("");
    console.log("🚀🚀 Your selected text is => me: ", me);
    const [callAccepted, setCallAccepted] = useState<boolean>(false);
    const [users, setUsers] = useState<{ [key: string]: string }>({});
    console.log("🚀🚀 Your selected text is => users: ", users);
    const [caller, setCaller] = useState<string>("");
    const [receivingCall, setReceivingCall] = useState<boolean>(false);
    const [callerSignal, setCallerSignal] = useState<RTCSessionDescriptionInit | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    console.log("🚀🚀 Your selected text is => stream: ", stream);
    const myAudio = useRef<HTMLAudioElement>(null);
    const userAudio = useRef<HTMLAudioElement>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        socket.on("connect", () => {
            setMe(socket?.id);
        });

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((currentStream) => {
                console.log("🚀🚀 Your selected text is => currentStream: ", currentStream);
                setStream(currentStream);
                if (myAudio.current) {
                    myAudio.current.srcObject = currentStream;
                }
            })
            .catch((error) => console.error("Error accessing audio:", error));

        socket.on("incoming-call", (data: { from: string; signal: RTCSessionDescriptionInit }) => {
            setReceivingCall(true);
            setCaller(data.from);
            setCallerSignal(data.signal);
        });

        return () => {
            socket.off("incoming-call");
        };
    }, []);

    useEffect(() => {
        socket.on("your-id", (id: string) => setMe(id));

        socket.on("getOnlineUsers", (users: { [key: string]: string }) => {
            setUsers(users);
        });

        return () => {
            socket.off("getOnlineUsers");
        };
    }, []);


    const callUser = (id: string) => {
        console.log("🚀🚀 Your selected text is => id: ", id);
        if (!stream) return;

        peerRef.current = new RTCPeerConnection();
        stream.getTracks().forEach(track => peerRef.current!.addTrack(track, stream));

        peerRef.current.ontrack = (event) => {
            if (userAudio.current) {
                userAudio.current.srcObject = event.streams[0];
            }
        };

        peerRef.current.createOffer()
            .then((offer) => {
                peerRef.current!.setLocalDescription(offer);
                socket.emit("call-user", { userToCall: id, signal: offer, from: me });
            });

        socket.on("call-accepted", (signal: RTCSessionDescriptionInit) => {
            peerRef.current!.setRemoteDescription(new RTCSessionDescription(signal));
            setCallAccepted(true);
        });
    };

    const acceptCall = () => {
        if (!stream || !callerSignal) return;

        setCallAccepted(true);
        peerRef.current = new RTCPeerConnection();
        stream.getTracks().forEach(track => peerRef.current!.addTrack(track, stream));

        peerRef.current.ontrack = (event) => {
            if (userAudio.current) {
                userAudio.current.srcObject = event.streams[0];
            }
        };

        peerRef.current.setRemoteDescription(new RTCSessionDescription(callerSignal));
        peerRef.current.createAnswer()
            .then((answer) => {
                peerRef.current!.setLocalDescription(answer);
                socket.emit("accept-call", { signal: answer, to: caller });
            });
    };

    return (
        <div className="p-4 mt-20">
            <h2 className="text-lg font-bold">Your ID: {me}</h2>
            <ul>
                {Object.entries(users).map(([userId, socketId]) => (
                    <li key={userId} className="flex items-center gap-4 p-2 border">
                        <span><strong>User ID:</strong> {userId} | <strong>Socket:</strong> {socketId}</span>
                    </li>
                ))}
            </ul>
            <audio ref={myAudio} autoPlay muted />
            <audio ref={userAudio} autoPlay />

            <input
                type="text"
                id="userId"
                placeholder="Enter user ID to call"
                className="border p-2 rounded"
            />
            <button
                onClick={() => callUser((document.getElementById("userId") as HTMLInputElement).value)}
                className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
            >
                Call
            </button>

            {receivingCall && !callAccepted && (
                <div className="mt-4">
                    <h3 className="text-red-500 font-semibold">Incoming Call from {caller}</h3>
                    <button
                        onClick={acceptCall}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        Accept
                    </button>
                </div>
            )}
        </div>
    );
};

export default AudioCall;
