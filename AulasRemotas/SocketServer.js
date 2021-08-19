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
        


        socket.on('disconnect', (reason) => {
            let desconectado = this.conexiones.find(elemento => elemento.userId === userId)
            if (desconectado){
                let pos = this.conexiones.indexOf(desconectado)
                let eliminado = this.conexiones.splice(pos, 1)
                console.log("Conexión Terminada:", "Socket:", socket.id, "userId:", userId, reason)
            }
        })

        const conexion = new Conexion(userId, socket.handshake.time)

        let con = undefined /*this.conexiones.find(elemento => 
            elemento.userId === conexion.userId
            )
        */
        if (!con | con === undefined | con === null){
            this.conexiones.push(conexion)
            next()
        }else{
            console.log("Conexión rechazada", con)
            socket.disconnect()
        }
    }

    aulasRemotas (socket) {
        // Usuario ha pasado la validación y puede crear o conectarse a un aula
        console.log("Conexión Realizada:", "socket:", socket.id)
        // FIXME: al ingresar al aula la conexion se reinicia y cambia el id del socket

        socket.on('oferta', (data) => this.recibeOferta(data, socket, this.aulas))
        socket.on('candidato', (data) => this.recibirCandidato(data, socket))
        socket.on('respuesta', (data) => this.recibirRespuesta(data, socket))
        //socket.on('disconnect', () => this.usuarioDesconectado(socket))
    }

    recibirCandidato(data, socket){
        let {aula, userId, ice} = data
        console.log('Candidato recibido:', socket.id, userId)
        const aulaName = aula.nombre + aula.id
        socket.to(aulaName).emit('candidato', {userId: userId, ice: ice})
    }
    
    recibirRespuesta(data, socket){
        let {aula, userId, sdp} = data
        console.log('Respuesta recibida:', socket.id, userId)
        const aulaName = aula.nombre + aula.id
        socket.to(aulaName).emit('respuesta', {userId: userId, sdp: sdp})
    }
    
    usuarioDesconectado(socket){
        console.log('Usuario desconectado:', socket.id)
        //socket.to(this.aula).emit('desconectado', socket.id)
    }

    recibeOferta(data, socket, aulas){
        // data trae el aula a la que se desea conectar o crear.
        // el userId del remitente de la oferta y
        // la oferta de conexion.
        let {aula, userId, sdp} = data

        console.log("Oferta Recibida:", "Socket:", socket.id, "userId:", userId, "aula:", aula)

        const conexion = new Conexion(userId, socket.handshake.time)

        let currentAula = aulas.find(_aula => {
            _aula.nombre == aula['nombre'] &
            _aula.id == aula['id']})
        if (currentAula){
            currentAula = aulas[aulas.indexOf(currentAula)]
            currentAula.terminales.push(conexion)
        }else{
            const {nombre, id} = aula
            currentAula = new Aula(nombre, id, conexion)
            aulas.push(currentAula)
        }
        
        const aulaName = currentAula.nombre + currentAula.id
        socket.join(aulaName)
        socket.to(aulaName).emit('oferta', {userId: userId, sdp: sdp})
    }
}