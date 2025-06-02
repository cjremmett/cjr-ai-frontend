import { io } from 'socket.io-client';

const URL = 'https://ectai.cjremmett.com';

export const socket = io(URL, {path: "/socket.io"});

socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});