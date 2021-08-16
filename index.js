require('dotenv').config()
const express = require('express')

const { dbCon } = require('./DataBases/config')
const { aulasRemotas } = require('./AulasRemotas/AulasRemotas')
const { socketValidator } = require('./AulasRemotas/socketValidator')

const cors = require('cors')


class Server{

    constructor(){
        this.app = express()
        
        this.app.use(express.json()) // necesario para hacer req.body
        this.app.use(express.urlencoded({extended: true}))
        
        // https://github.com/expressjs/cors#configuration-options
        this.app.use('*', cors(
            /*{
                origin: ['http://localhost:4200'],
                "methods": "GET,PUT,POST",
                "preflightContinue": false,
                "optionsSuccessStatus": 204,
                credentials: true
            }*/
        ))

        this.server = require('http').createServer(this.app)
        
        this.port = process.env.PORT || 8080

        dbCon()

        this.app.get('/', (req, res) => {
            res.send('SERVER ONLINE !!')
        })

        //this.app.use(express.static(__dirname + '/Public'))

        this.routes()
        this.listen()
        this.aulasR()
    }

    aulasR() {
        const { Server } = require("socket.io");
        // https://socket.io/docs/v4/handling-cors/
        // https://socket.io/docs/v4/troubleshooting-connection-issues/#The-server-does-not-send-the-necessary-CORS-headers
        // https://socket.io/docs/v3/troubleshooting-connection-issues/

        // allowEIO3: true => Corrige: websocket.js:124 WebSocket connection to 'ws://localhost:8080/socket.io/?EIO=3&transport=websocket' failed: Invalid frame header
        const io = new Server(this.server, {cors: {origin: '*',}, allowEIO3: true});

        //https://socket.io/docs/v3/middlewares/
        io.use(socketValidator)
        io.on('connection', aulasRemotas)
        io.on('connect_error', (err) => {console.log("Error de conexión", err);})

        /* https://socket.io/docs/v3/rooms/#Room-events
        io.of("/").adapter.on("create-room", (room) => {
            console.log(`room ${room} was created`);
        });
          
        io.of("/").adapter.on("join-room", (room, id) => {
            console.log(`socket ${id} has joined room ${room}`);
        });
        */
    }

    routes(){
        this.app.use('/usuarios', require(__dirname + '/Usuarios/router'))
    }

    listen(){
        this.server.listen(this.port, () => {
            console.log('SERVER ON !!!')
        })
    }
}


const server = new Server()