const { Router } = require('express')
const { check } = require('express-validator')

const router = Router()

const { validarChecks, validarJWT } = require('./Middlewares/validators.generics')
const { registro, login, getUser, userPatch, userDelete } = require('./controlador')
const { usuarioNoExists, emailNoExists, cedulaNoExists } = require('./Middlewares/validators.database')


const names_pattern = '^[a-zA-ZÁ-Úá-ú]{2,15}( ?[a-zA-ZÁ-Úá-ú]{1,15})*[a-zA-ZÁ-Úá-ú]+$';
const telefonos_pattern = '^[0-9]{9}$';
const cedula_pattern = '^[0-9]{8}$';
const email_pattern = '[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}';
const password_pattern = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{12,16}';
const userName_pattern = '^[a-zA-Z0-9_-]{4,12}$';


router.post('/registro', [
    check('nombre')
        .matches(names_pattern).withMessage('El nombre no cumple las condiciones necesarias'),
    check('apellido')
        .matches(names_pattern).withMessage('El apellido no cumple las condiciones necesarias'),
    check('usuario')
        .matches(userName_pattern).withMessage('El usuario no cumple las condiciones necesarias')
        .custom( usuarioNoExists ).withMessage("Este Usuario ya existe."),
    check('clave')
        .matches(password_pattern).withMessage('La clave no cumple las condiciones necesarias'),
    check('cedula')
        .matches(cedula_pattern).withMessage('La cedula no cumple las condiciones necesarias')
        .custom( cedulaNoExists ).withMessage("Esta cedula ya existe."),
    check('celular')
        .matches(telefonos_pattern).withMessage('El celular no cumple las condiciones necesarias'),
    check('foto', 'Foto es obligatorio').notEmpty(),
    // El rol no es "registrable"
    //check('email') // El email no es exigido en el Front
    //    .matches(email_pattern).withMessage('La email no cumple las condiciones necesarias')
    //    .custom( emailNoExists ).withMessage("Este email ya existe."),
    validarChecks], registro)
    
router.post('/login', login)

router.get('/user/:_id', [validarJWT, validarChecks], getUser)

router.patch('/user/:_id', [validarJWT, validarChecks], userPatch)

router.delete('/user/:_id', [validarJWT, validarChecks], userDelete)

module.exports = router