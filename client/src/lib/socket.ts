// PATH: client/src/lib/socket.ts
import { io } from "socket.io-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!.replace('/api', '');

export const socket = io(BASE_URL, {
    withCredentials: true,
});