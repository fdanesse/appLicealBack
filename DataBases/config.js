
const mongoose = require('mongoose')

exports.dbCon = () => {
    mongoose.connect(process.env.MONGODB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(user => console.log('Base de datos UP'))
    .catch(
        err => {
            console.log(err)
            throw new Error('Error en la base de datos')}
        )
}
