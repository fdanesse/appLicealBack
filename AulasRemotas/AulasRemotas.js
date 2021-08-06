let aula


function recibeOferta(data){
    // Recibe:
    //    'aula': aula,
    //    'sdp': peerConn.localDescription
    let socket = this
    aula = data['aula']
    socket.join(aula)
    //console.log('Recibiendo oferta de conexión', socket.id, aula)
    socket.to(aula).emit('oferta', data['sdp'])
}

function recibirCandidato(data){
    let socket = this
    //console.log('Candidato recibido:', socket.id)
    socket.to(aula).emit('candidato', data)
}

function recibirRespuesta(data){
    let socket = this
    //console.log('Respuesta recibida:', socket.id)
    socket.to(aula).emit('respuesta', data)
}

function usuarioDesconectado(){
    let socket = this
    //console.log('Usuario desconectado:', socket.id)
    socket.to(aula).emit('desconectado', socket.id)
}

const aulasRemotas = (socket) => {
    //console.log('Usuario conectado a Aulas Remotas')

    socket.on('oferta', recibeOferta)
    socket.on('candidato', recibirCandidato)
    socket.on('respuesta', recibirRespuesta)
    socket.on('disconnect', usuarioDesconectado)
}


module.exports = { aulasRemotas }
