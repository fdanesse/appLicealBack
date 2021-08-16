const Usuario = require('./usuario.model')
const bcryptjs = require('bcryptjs')


/*
exports.usuarioExists = (usuario, { req, location, path }) => {
    return Usuario.findOne({ usuario: usuario })
        .then(doc => {
            if (doc) {
                return Promise.resolve()
            }else{
                return Promise.reject()
            }
        })
        .catch(err => {
            return Promise.reject()
        })
}
*/

exports.usuarioNoExists = (usuario, { req, location, path }) => {
    return Usuario.findOne({ usuario: usuario })
        .then(doc => {
            if (doc) {
                return Promise.reject()
            }else{
                return Promise.resolve()
            }
        })
        .catch(err => {
            return Promise.reject()
        })
}

exports.emailNoExists = (email, { req, location, path }) => {
    return Usuario.findOne({ email: email })
        .then(doc => {
            if (doc) {
                return Promise.reject()
            }else{
                return Promise.resolve()
            }
        })
        .catch(err => {
            return Promise.reject()
        })
}

exports.cedulaNoExists = (cedula, { req, location, path }) => {
    return Usuario.findOne({ cedula: cedula })
        .then(doc => {
            if (doc) {
                return Promise.reject()
            }else{
                return Promise.resolve()
            }
        })
        .catch(err => {
            return Promise.reject()
        })
}
