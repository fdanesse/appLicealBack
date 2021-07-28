const mongoose = require('mongoose')
//mongoose.set('useCreateIndex', true)


const UsuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },
    usuario: {
        type: String,
        required: true,
        trim: true
    },
    clave: {
        type: String,
        required: true,
        trim: true
    },
    cedula: {
        type: String,
        required: true,
        trim: true
    },
    celular: {
        type: String,
        required: false,
        trim: true
    },
    email: {
        type: String,
        required: false,
        trim: true
    },
    foto: {
        type: String,
        required: true
    },
    rol:{
        type: String,
        required: false,
        default: 'USER',
        emun: ['ADMIN', 'USER']
    }
}, {
    timestamps: true
})

UsuarioSchema.methods.toJSON = function() {
    const { __v, clave, ...user  } = this.toObject()
    return user;
}

// Si crea una conexión personalizada, utilice la model()función de esa conexión en su lugar.
// const connection = mongoose.createConnection('mongodb://localhost:27017/test');
// const Tank = connection.model('Tank', yourSchema);
module.exports = mongoose.model('Usuarios', UsuarioSchema)
