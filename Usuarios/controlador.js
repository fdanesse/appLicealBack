const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Usuario = require('./usuario.model')


exports.registro = (req, res, next) => {
    const { usuario } = req.body
    Usuario.findOne({ usuario: usuario })
        .then(doc => {
            if (doc) {
                return res.status(401).json({msg: 'Este usuario ya existe'});
            }else{
                const usuario = new Usuario(req.body)

                const salt = bcryptjs.genSaltSync(10)
                usuario.clave = bcryptjs.hashSync(req.body.clave, salt)

                usuario.save((err, user) => {
                    if (user){
                        const expiresIn = '6h'
                        const accesToken = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: expiresIn })
                        const authUser = user.toJSON()
                        return res.json({authUser, accesToken})
                    }
                    if (err) {
                        return res.status(400).json({msg: 'El usuario no se pudo guardar en la base de datos.'})
                    }
                })
                
            }
        })
        .catch(error => {
            return res.status(500).json({msg: 'No se pudo buscar en la base de datos'});
        })
}


exports.login = (req, res, next) => {

    const { usuario, clave } = req.body

    Usuario.findOne({ usuario: usuario })
        .then(doc => {
            if (doc) {
                const valor = bcryptjs.compareSync(clave, doc.clave)

                if (valor) {
                    const expiresIn = '6h'
                    const accesToken = jwt.sign({ id: doc._id }, process.env.SECRET, { expiresIn: expiresIn })

                    const authUser = doc.toJSON()
                    return res.json({authUser, accesToken})

                }else{
                    return res.status(401).json({msg: 'Usuario o clave incorrectos'});
                }
                
            }else{
                return res.status(401).json({msg: 'Usuario o clave incorrectos'});
            }
        })
        .catch(error => {
            return res.status(500).json({msg: 'No se pudo buscar en la base de datos'});
        })
}


exports.getUser = (req, res, next) => {
    // Ya se verificó el token, aca solo necesitamos el id solicitante
    const token = req.header('Authorization')
    const { id } = jwt.verify(token, process.env.SECRET)

    // El _id de este usuario tiene que ser el mismo que req.params._id (dueño del perfil) o el rol debe ser ROOT
    Usuario.findOne({ _id: id })
        .then(doc => {
            if (doc) {
                const authUser = doc.toJSON()
                const { _id, rol } = authUser
                if (_id.toString() === req.params._id || rol == "ROOT"){
                    // Ahora devolvemos el perfil solicitado
                    Usuario.findOne({ _id: req.params._id })
                        .then(doc => {
                            if (doc) {
                                const user = doc.toJSON()
                                return res.json({user})
                            }else{
                                return res.status(401).json({msg:'Este usuario no existe'})
                            }
                        })
                        .catch(error => {
                            return res.status(400).json({msg: 'No se pudo buscar en la base de datos'})
                        })
                    
                } else {
                    return res.status(401).json({msg:'No tiene autorización'})
                }

            }else{
                return res.status(401).json({msg:'No tiene autorización'})
            }
        })
        .catch(error => {
            return res.status(400).json({msg: 'No se pudo buscar en la base de datos'});
        })
}

exports.userPatch = (req, res, next) => {
    // Ya se verificó el token, aca solo necesitamos el id solicitante
    const token = req.header('Authorization')
    const { id } = jwt.verify(token, process.env.SECRET)

    // El _id de este usuario tiene que ser el mismo que req.params._id (dueño del perfil) o el rol debe ser ROOT
    Usuario.findOne({ _id: id })
        .then(doc => {
            if (doc) {
                const authUser = doc.toJSON()
                const { _id, rol } = authUser
                if (_id.toString() === req.params._id || rol == "ROOT"){
                    // Ahora actualizamos el perfil solicitado
                    Usuario.updateOne({_id: req.params._id}, req.body)
                        .then(doc => {
                            if (doc) {
                                Usuario.findOne({ _id: id })
                                    .then(doc => {
                                        if (doc) {
                                            const user = doc.toJSON()
                                            return res.json({user})
                                        }
                                        else{
                                            return res.status(400).json({msg:'No se pudo encontrar el usuario'})
                                        }})
                                    .catch(err => {
                                        return res.status(400).json({msg:'No se pudo encontrar el usuario'})
                                    })
                            }
                            else {return res.status(401).json({msg:'No tiene autorización'})}
                        })
                        .catch(error => {
                            return res.status(400).json({msg: 'Este usuario no existe en la base de datos'})
                        })


                } else {
                    return res.status(401).json({msg:'No tiene autorización'})
                }

            }else{
                return res.status(401).json({msg:'No tiene autorización'})
            }
        })
        .catch(error => {
            return res.status(400).json({msg: 'No tiene autorización'});
        })
}

exports.userDelete = (req, res, next) => {
    // Ya se verificó el token, aca solo necesitamos el id solicitante
    const token = req.header('Authorization')
    const { id } = jwt.verify(token, process.env.SECRET)

    // El _id de este usuario tiene que ser el mismo que req.params._id (dueño del perfil) o el rol debe ser ROOT
    Usuario.findOne({ _id: id })
        .then(doc => {
            if (doc) {
                const authUser = doc.toJSON()
                const { _id, rol } = authUser
                if (_id.toString() === req.params._id || rol == "ROOT"){
                    Usuario.deleteOne({ _id: req.params._id })
                        .then(result => {
                            res.status(200).send()
                        })
                        .catch(error => {
                            res.status(500).json({msg: 'No se pudo borrar de la base de datos'})
                        })

                } else {
                    return res.status(401).json({msg:'No tiene autorización'})
                }

            }else{
                return res.status(401).json({msg:'No tiene autorización'})
            }
        })
        .catch(error => {
            return res.status(400).json({msg: 'No tiene autorización'})
        })
}
