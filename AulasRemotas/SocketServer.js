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
        socket.on('disconnect', (reason) => {
            let desconectados = this.conexiones.filter(conexion => conexion.id == socket.id);
            desconectados.forEach((elemento, indice) => {
                let pos = this.conexiones.indexOf(elemento)
                let eliminado = this.conexiones.splice(pos, 1)
                console.log("Conexión Terminada:", reason)
            })
        })
    
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
        
        const conexion = new Conexion(
            socket.id,
            userId,
            socket.handshake.time,
        )

        let con = undefined /*this.conexiones.find(elemento => 
            elemento.id === conexion.id |
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
        console.log("Conexión Realizada:", socket.id)

        socket.on('oferta', (data) => this.recibeOferta(data, socket, this.aulas))
        socket.on('candidato', (data) => this.recibirCandidato(data, socket))
        socket.on('respuesta', (data) => this.recibirRespuesta(data, socket))
        socket.on('disconnect', () => this.usuarioDesconectado(socket))
    }

    recibirCandidato(data, socket){
        console.log('Candidato recibido:', socket.id)
        //socket.to(this.aula).emit('candidato', data)
    }
    
    recibirRespuesta(data, socket){
        console.log('Respuesta recibida:', socket.id)
        //socket.to(this.aula).emit('respuesta', data)
    }
    
    usuarioDesconectado(socket){
        console.log('Usuario desconectado:', socket.id)
        //socket.to(this.aula).emit('desconectado', socket.id)
    }

    recibeOferta(data, socket, aulas){
        // Todos los usuarios emiten una oferta inicial al conectarse a un aula específica
        // Si dicha aula no existe, se crea.
        
        const { id } = jwt.verify(socket.handshake.query.token, process.env.SECRET)
        const conexion = new Conexion(socket.id, id, socket.handshake.time)

        let currentAula = aulas.find(_aula => {
            _aula.nombre == data['aula']['nombre'] &
            _aula.id == data['aula']['id']})
        if (currentAula){
            currentAula = aulas[aulas.indexOf(currentAula)]
            currentAula.terminales.push(conexion)
        }else{
            const {nombre, id} = data['aula']
            currentAula = new Aula(nombre, id, conexion)
            aulas.push(currentAula)
        }
        
        console.log(currentAula)
        const aulaName = currentAula.nombre + currentAula.id
        socket.join(aulaName)
        socket.to(aulaName).emit('oferta', data['sdp'])
    }
}