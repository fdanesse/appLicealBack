const { Server } = require("socket.io");

const { aulasRemotas } = require('./AulasRemotas')
const { socketValidator } = require('./socketValidator')


module.exports = class SocketServer {
    constructor(httpServer){
        this.server = httpServer
        // https://socket.io/docs/v4/handling-cors/
        // https://socket.io/docs/v4/troubleshooting-connection-issues/#The-server-does-not-send-the-necessary-CORS-headers
        // https://socket.io/docs/v3/troubleshooting-connection-issues/
        // allowEIO3: true => Corrige: websocket.js:124 WebSocket connection to 'ws://localhost:8080/socket.io/?EIO=3&transport=websocket' failed: Invalid frame header
        this.io = new Server(this.server, {cors: {origin: '*',}, allowEIO3: true});

        //https://socket.io/docs/v3/middlewares/
        this.io.use(socketValidator)
        this.io.on('connection', aulasRemotas)
        this.io.on('connect_error', (err) => {console.log("Error de conexión", err);})

        /* https://socket.io/docs/v3/rooms/#Room-events
        io.of("/").adapter.on("create-room", (room) => {
            console.log(`room ${room} was created`);
        });
          
        io.of("/").adapter.on("join-room", (room, id) => {
            console.log(`socket ${id} has joined room ${room}`);
        });
        */

        console.log("Aulas Remotas online.")
    }
}