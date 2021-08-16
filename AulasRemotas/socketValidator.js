const jwt = require('jsonwebtoken')
const Usuario = require('../Usuarios/usuario.model')
const Conexion = require('./models')

let conexiones = []


socketValidator = function (socket, next) {
    // Valida o rechaza intentos de conexión y mantenemos un array de conexiones activas
    socket.on('disconnect', function(){
        let desconectados = conexiones.filter(conexion => conexion.id == this.id);
        desconectados.forEach((elemento, indice) => {
            let pos = conexiones.indexOf(elemento)
            let eliminado = conexiones.splice(pos, 1)
        })

    })

    const token = socket.handshake.query.token
    if (!token || token === null || token === undefined) {
        console.log("No tiene autorización. 1")
        socket.disconnect()
        //throw new Error('No tiene autorización. 1')
        //return
    }

    try{
        const { id } = jwt.verify(token, process.env.SECRET)
        Usuario.findOne({ _id: id })
            .then(doc => {
                if (doc) {}else{
                    console.log("No tiene autorización. 2")
                    socket.disconnect()
                    //throw new Error('No tiene autorización. 2')
                    //return
            }})
            .catch(error => {
                console.log("No tiene autorización. 3", error)
                socket.disconnect()
                //throw new Error('No tiene autorización. 3')
                //return
            })
        }
    catch (error) {
        console.log("No tiene autorización. 4", error)
        socket.disconnect()
        //throw new Error('No tiene autorización. 4')
        //return
    }
    
    const conexion = new Conexion(
        socket.id,
        socket.handshake.headers.origin,
        socket.handshake.time,
        socket.handshake.address,
        socket.handshake.query.token
    )

    let con = undefined;
    conexiones.forEach((elemento, indice) => {
        if (elemento.origen == conexion.origen
            || elemento.address == conexion.address
            || elemento.token == conexion.token){
                con = elemento
                return
            }
    })

    if (!con || con === undefined || con === null){
        conexiones.push(conexion)
        next()
    }else{
        console.log("Conexión rechazada", con)
        socket.disconnect()
        //throw new Error('Conexión rechazada')
        //return
    }
}

module.exports = { socketValidator }
