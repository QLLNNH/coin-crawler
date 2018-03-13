'use strict';
const log = require('./lib/log');
const app = require('express')();
const http = require('http').Server(app);
const socket_server = require('socket.io')(http);
const aggregator = new (require('./lib/aggregator'))(socket_server);

app.get('/coin', (req, res) => res.sendFile(__dirname + '/public/index.html'));

http.listen(26002, () => log.info('listening on 26002'));