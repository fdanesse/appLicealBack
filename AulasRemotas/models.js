// Las conexiones se identifican por el id del socket
class Conexion{
    constructor(socketId, userId, tiempo, nombre, apellido, usuario, foto){
        this.socketId = socketId
        this.userId = userId
        this.tiempo = tiempo
        this.nombre = nombre
        this.apellido = apellido
        this.usuario = usuario
        this.foto = foto
    }
}

// Las aulas se identifican por el id del anfitrion
class Aula{
    constructor(nombre, id, anfitrion){
        this.nombre = nombre
        this.id = id
        this.anfitrion = anfitrion
        this.terminales = []
    }
}

module.exports = {Conexion, Aula}