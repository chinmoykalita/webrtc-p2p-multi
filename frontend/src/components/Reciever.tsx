import { useEffect, useRef } from 'react';

export function Reciever() {

    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        socket.onopen = () => {
            console.log('connected');
            socket.send(JSON.stringify({ type: 'reciever' }));
        };

        socket.onmessage = async (event) => {
            console.log(event.data);
            const message = JSON.parse(event.data);
            let pc: RTCPeerConnection | null = null;
            if (message.type === 'createOffer') {
                console.log("recieved create offer")
                const pc = new RTCPeerConnection();
                pc.setLocalDescription(message.sdp);
                pc.onicecandidate = (event) => {
                    console.log(event);
                    if (event.candidate) {
                        socket?.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate }));
                    }
                }

                pc.ontrack = (event) => {
                    console.log(event);
                    if (videoRef.current) {
                        videoRef.current.srcObject = new MediaStream([event.track]);

                    }
                }
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.send(JSON.stringify( { type: 'createAnwer', sdp: pc.localDescription }));
            } else if (message.type === 'iceCandidate') {
                if (pc !== null) {
                    // @ts-ignore
                    pc.addIceCandidate(message.candidate);
                }
            }
        
        }
    
    }, []);

    return (
        <div>
            reciever
            <video ref={videoRef}></video>
        </div>
    )
}