const express = require('express');
const cors = require('cors')
const contactsRoutes = require('./contacts/contacts.routes');
const morgan = require('morgan');
const fs =  require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000

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
    initRoutes() {
        this.server.use('/api/contacts', contactsRoutes);
    }
    startListen() {
        this.server.listen(PORT, () => {
            console.log("Server started listening on port", PORT)
        })
    }
}