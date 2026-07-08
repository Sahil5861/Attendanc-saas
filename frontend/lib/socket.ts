import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

let socket: Socket | null = null;

export const getSocket = (branchId?: string): Socket => {
    const token = Cookies.get("access_token");
    const auth = { token, branchId };

    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
            auth,
            autoConnect: false,
        });
    } else {
        socket.auth = auth;
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
