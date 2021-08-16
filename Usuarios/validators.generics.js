const { validationResult } = require('express-validator')
const Usuario = require('./usuario.model')
const jwt = require('jsonwebtoken')


exports.validarChecks = (req, res, next) => {
    const errors = validationResult(req) // Errores acumulados por los checks
    console.log("Errores?:", errors)
    if (!errors.isEmpty()){
        return res.status(406).json(errors)
    }
    next()
}


exports.validarJWT = (req, res, next) => {
    // Verificamos que el token sea válido y que su dueño esté registrado en la base de datos
    const token = req.header('Authorization')

    if (!token || token === null || token === undefined) {
        res.status(401).json({msg: "No tiene autorización."})}

    try{
        const { id, exp } = jwt.verify(token, process.env.SECRET)
        console.log(exp, exp < Date.now() / 1000)
        Usuario.findOne({ _id: id })
            .then(doc => {
                if (doc) {
                    // console.log("Solicitante:", doc)
                }else{
                    return res.status(401).json({msg:'No tiene autorización'})
                }
            })
            .catch(error => {
                return res.status(400).json({msg: 'No se pudo buscar en la base de datos'});
            })
        }
    catch (error) {
        // FIXME: TokenExpiredError
        console.log(error)
        return res.status(401).json({msg:'Token ha expirado'})
    }
    next()
}
