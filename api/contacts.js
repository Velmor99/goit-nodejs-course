const express = require('express');
const cors = require('cors')
const contactsRoutes = require('./contacts/contacts.routes');
const userRoutes = require('./users/users.router')
const morgan = require('morgan');
require('dotenv').config();
const fs =  require('fs');
const path = require('path');
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3000
const MONGODB_URL = process.env.MONGODB_URL


morgan.token('type', function (req, res) { return req.headers['content-type'] })
morgan.token('body', function (req, res) {return JSON.stringify(req.body)})
morgan.token('CORS', function (req, res) {return req.headers['access-control-allow-origin']})


module.exports = class ContactsAPI {
    constructor() {
        this.server = null
    }
    start() {
        this.initServer();
        this.initMiddlewares();
        this.initRoutes();
        this.initDataBase();
        this.startListen();
    }
    initServer() {
        this.server = express();
    }
    initMiddlewares() {
        this.server.use(express.json());
        this.server.use(cors({original: 'http:localhost:3000'}))
        this.server.use(
            morgan(function (tokens, req, res) {
            return [
              tokens.method(req, res),
              tokens.url(req, res),
              tokens.status(req, res),
              tokens.res(req, res, 'content-length'), '-',
              tokens['response-time'](req, res), 'ms',
              tokens['type'](req, res), 
              tokens['CORS'](req, res),
              tokens['body'](req, res),
            ].join(' ')
          }, 
          {
            stream: fs.createWriteStream(path.join(__dirname, './log/access.log'), { flags: 'a' })
          }))
    }
    async initDataBase() {
        try {
            const opts = {
                useFindAndModify: true,
                useCreateIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
            mongoose.connect(MONGODB_URL, opts);
            console.log('DB Connected');
        } catch(err) {
            if(err) {
                console.log("Connection with error")
                process.exit(1)
            }
        }
    }
    initRoutes() {
        this.server.use('/api/contacts', contactsRoutes);
        this.server.use('/api/auth', userRoutes);
    }
    startListen() {
        this.server.listen(PORT, () => {
            console.log("Server started listening on port", PORT)
        })
    }
}