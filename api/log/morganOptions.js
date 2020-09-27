const morgan = require('morgan');

morgan.token('type', function (req, res) { return req.headers['content-type'] })
const id = function() {
    let counter = 1;
    return counter += 1
};
morgan.token('id', function (req, res) {return id()})

const options = morgan(function (tokens, req, res) {
    return [
      tokens['id'](req, res),
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens['type'](req, res)
    ].join(' ')
})

module.exports = options