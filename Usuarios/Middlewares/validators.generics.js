const { validationResult } = require('express-validator')
const Usuario = require('../usuario.model')


exports.validarChecks = (req, res, next) => {
    const errors = validationResult(req) // Errores acumulados por los checks
    if (!errors.isEmpty()){
        return res.status(406).json(errors)
    }
    next()
}

/*
const jwt = require('jsonwebtoken')

exports.validarJWT = (req, res, next) => {

    const token = req.header('Authorization')
    if (!token || token === null || token === undefined) {res.status(401).json({msg: "No tiene autorización."})}

    const { id } = jwt.verify(token, process.env.SECRET)
    
    Usuario.findOne({ _id: id })
        .then(doc => {
            if (doc) {    
                //console.log("validarJWT:", doc)
            }else{
                return res.status(401).json({msg:'No tiene autorización'})
            }
        })
        .catch(error => {
            return res.status(400).json({msg: 'No se pudo buscar en la base de datos'});
        })
}
*/