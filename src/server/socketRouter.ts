import { Socket } from "socket.io";
import { SocketClientEvents, SocketServerEvents } from "../sharedTypes";
import messageController from "./controllers/message.controller";

type CustomSocket = Socket<SocketClientEvents, SocketServerEvents>;

async function newMessage(
    socket: CustomSocket,
    content: string,
    fromId: string,
    channelId: string
) {
    const newMessage = await messageController.newMessageManual(
        content,
        fromId,
        channelId
    );

    if (newMessage) {
        socket.emit("newMessage", newMessage);
    } else {
        console.warn("WARNING: new socket message failed to create!");
    }
}

function router(socket: CustomSocket) {
    socket.on("sendMessage", (content, fromId, channelId) => {
        newMessage(socket, content, fromId, channelId);
    });
}

export default router;
