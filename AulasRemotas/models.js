// Las conexiones se identifican por el id del socket
class Conexion{
    constructor(socketId, userId, tiempo){
        this.socketId = socketId
        this.userId = userId
        this.tiempo = tiempo
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