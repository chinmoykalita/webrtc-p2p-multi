import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: null | WebSocket = null;
let recieverSocket: null | WebSocket = null;

wss.on("connection", (ws) => {
  ws.on("message", (data: any) => {
    const message = JSON.parse(data);
    // console.log(message);

    if (message.type === "sender") {
        console.log("sender connected");
      senderSocket = ws;
    } else if (message.type === "reciever") {
        console.log("reciever connected");
      recieverSocket = ws;
    } else if (message.type === "createOffer") {
        if (ws !== senderSocket) {
            return;
        }
        console.log("createOffer");
        recieverSocket?.send(JSON.stringify({ type: 'createOffer', sdp: message.sdp }));
    } else if (message.type === "createAnswer") {
        if (ws !== recieverSocket) {
            return;
        }
        senderSocket?.send(JSON.stringify({ type: 'createAnswer', sdp: message.sdp }));
    } else if (message.type === "iceCandidate") {
        if (ws === senderSocket) {
            recieverSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
        } else if (ws === recieverSocket) {
            senderSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
        }
    }
  });
});