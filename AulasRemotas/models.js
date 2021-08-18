// Las conexiones se identifican porel id del socket
class Conexion{
    constructor(id, userId, tiempo){
        this.id = id
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