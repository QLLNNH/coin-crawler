'use strict';
const log = require('./lib/log');
const app = require('express')();
const http = require('http').Server(app);
const socket_server = require('socket.io')(http);
const aggregator = new (require('./lib/aggregator'))(socket_server);

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));

http.listen(3000, () => log.info('listening on 3000'));