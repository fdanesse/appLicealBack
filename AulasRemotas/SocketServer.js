const { Server } = require("socket.io");
const jwt = require('jsonwebtoken')
const Usuario = require('../Usuarios/usuario.model')
const { Conexion, Aula } = require('./models')


module.exports = class SocketServer {
    constructor(httpServer){
        this.server = httpServer

        this.conexiones = []
        this.aulas = []

        // https://socket.io/docs/v4/handling-cors/
        // https://socket.io/docs/v4/troubleshooting-connection-issues/#The-server-does-not-send-the-necessary-CORS-headers
        // https://socket.io/docs/v3/troubleshooting-connection-issues/
        // allowEIO3: true => Corrige: websocket.js:124 WebSocket connection to 'ws://localhost:8080/socket.io/?EIO=3&transport=websocket' failed: Invalid frame header
        this.io = new Server(this.server, {cors: {origin: '*',}, allowEIO3: true});

        //https://socket.io/docs/v3/middlewares/
        //this.io.use((socket, next) => socketValidator(socket, next, this.conexiones))
        this.io.use((socket, next) => this.socketValidator(socket, next))
        //this.io.on('connection', (socket) => aulasRemotas(socket, this.conexiones))
        this.io.on('connection', (socket) => this.aulasRemotas(socket))

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

    socketValidator(socket, next) {
        // Valida o rechaza intentos de conexión y mantenemos un array de conexiones activas
        const token = socket.handshake.query.token
        if (!token || token === null || token === undefined) {
            console.log("No tiene autorización. 1")
            socket.disconnect()
        }
    
        let userId = undefined
        try{
            const { id } = jwt.verify(token, process.env.SECRET)
            userId = id
            Usuario.findOne({ _id: id })
                .then(doc => {
                    if (doc) {}else{
                        console.log("No tiene autorización. 2")
                        socket.disconnect()
                }})
                .catch(error => {
                    console.log("No tiene autorización. 3", error)
                    socket.disconnect()
                })
            }
        catch (error) {
            console.log("No tiene autorización. 4", error)
            socket.disconnect()
        }
        
        //FIXME: deshabilitado para testear
        next()
        /*
        let con = this.conexiones.find(elemento => elemento.userId === userId)
        if (!con | con === undefined | con === null){
            next()
        }else{
            console.log("Conexión rechazada", con)
            socket.disconnect()
        }
        */
    }

    aulasRemotas (socket) {
        // Usuario ha pasado la validación y puede crear o conectarse a un aula
        const token = socket.handshake.query.token
        // FIXME: TokenExpiredError
        const { id } = jwt.verify(token, process.env.SECRET)
        const conexion = new Conexion(socket.id, id, socket.handshake.time)
        this.conexiones.push(conexion)
        //console.log("Conexión Realizada:", conexion)
        
        socket.on('disconnect', (reason) => {
            let desconectado = this.conexiones.find(elemento => elemento.socketId === socket.id)
            if (desconectado){
                let pos = this.conexiones.indexOf(desconectado)
                let eliminado = this.conexiones.splice(pos, 1)
                //console.log("Conexión Terminada:", desconectado, reason)
            }
            this.conexiones.forEach(conexion => {
                socket.to(conexion.socketId).emit('desconectado', desconectado.socketId)
            })

            // FIXME:
            // this.aulas
        })

        socket.on('hello', (data) => this.recibirhello(data, socket, conexion))

        socket.on('oferta', (data) => this.recibeOferta(data, socket))
        socket.on('candidato', (data) => this.recibirCandidato(data, socket))
        socket.on('respuesta', (data) => this.recibirRespuesta(data, socket))
    }

    recibirhello(aula, socket, conexion){
        // Cuando un usuario ingresa a un aula saluda.
        const {nombre, id} = aula
        const aulaName = nombre + id

        // FIXME: Implementar Correctamente
        /*
        let currentAula = this.aulas.find(_aula => {_aula.nombre == aula.nombre & _aula.id == aula.id})
        if (currentAula){
            currentAula = this.aulas[this.aulas.indexOf(currentAula)]
            console.log("Agregando Conexión a aula:")
            console.log("Aula:", currentAula)
            console.log("Conexión:", conexión)
        }else{
            currentAula = new Aula(nombre, id, conexion)
            this.aulas.push(currentAula)
            console.log("Creando Aula:")
            console.log("Aula:", currentAula)
            console.log("Conexión:", conexion)
        }

        currentAula.terminales.push(conexion)
        console.log("\n", this.aulas, "\n")
        */

        socket.join(aulaName)
        socket.to(aulaName).emit('hello', conexion)
    }

    recibirCandidato(data, socket){
        let {socketIdDestino, ice} = data
        //console.log('Candidato recibido:', "Remite:", socket.id, "Destino:", socketIdDestino)
        socket.to(socketIdDestino).emit('candidato', {remitente: socket.id, ice: ice})
    }
    
    recibirRespuesta(data, socket){
        let {socketIdDestino, sdp} = data
        //console.log('Respuesta recibida:', "Remite:", socket.id, "Destino:", socketIdDestino)
        socket.to(socketIdDestino).emit('respuesta', {remitente: socket.id, sdp: sdp})
    }

    recibeOferta(data, socket){
        let conexion = this.conexiones.find(elemento => elemento.socketId === socket.id)
        const {socketIdDestino, sdp} = data
        //console.log("Oferta Recibida:", "Remite:", socket.id, 'Destino:', socketIdDestino)
        socket.to(socketIdDestino).emit('oferta', {conexionRemitente: conexion, sdp: sdp})
    }
}