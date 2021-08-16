require('dotenv').config()
const express = require('express')
const cors = require('cors')

const { dbCon } = require('./DataBases/config')
const SocketServer = require('./AulasRemotas/SocketServer')


class Server{

    constructor(){
        this.app = express()
        
        this.app.use(express.json()) // necesario para hacer req.body
        this.app.use(express.urlencoded({extended: true}))
        
        // https://github.com/expressjs/cors#configuration-options
        this.app.use('*', cors(
            /*{
                origin: ['http://localhost:4200'],
                "methods": "GET,PUT,POST",
                "preflightContinue": false,
                "optionsSuccessStatus": 204,
                credentials: true
            }*/
        ))

        this.server = require('http').createServer(this.app)
        
        this.port = process.env.PORT || 8080

        dbCon()

        this.app.get('/', (req, res) => {res.send('SERVER ONLINE !!')})

        //this.app.use(express.static(__dirname + '/Public'))

        this.routes()
        this.listen()
        this.socketServer = new SocketServer(this.server)
    }

    routes(){
        this.app.use('/usuarios', require(__dirname + '/Usuarios/router'))
    }

    listen(){
        this.server.listen(this.port, () => {console.log('SERVER ON !!!')})
    }
}


const server = new Server()