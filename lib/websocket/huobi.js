'use strict';
const Events = require('events');
const pako = require('pako');
const WebSocket = require('ws');
const log = require('../log');
const config = require('../../config');

class Huobi extends Events {

    constructor(opt) {
        super();
        this.url = opt.url;
        this.tasks = opt.tasks;
        this.cache = new Map();
        this.timeout_count = 0;
        this.timer = null;
        this.init();
    }

    init() {
        const ws = new WebSocket(this.url);

        ws.on('open', () => {
            log.info('huobi websocket clinet open');
            this.tasks.forEach((task) => ws.send(JSON.stringify({ sub: `market.${task}.kline.1min`, id: 'huobi client', })));
            this.emit('status', 'open');
        });

        ws.on('close', () => {
            log.info('huobi websocket client closed');
            clearInterval(this.timer);
            this.emit('status', 'close');
            this.emit('close');
        });

        ws.on('error', (err) => {
            log.error(`huobi websocket client occur error -> ${err.message || err}`);
            ws.terminate();
        });

        ws.on('message', (buffer) => {
            try {
                this.timeout_count = 0;

                const ret = JSON.parse(pako.inflate(buffer, { to: 'string' }));

                if (ret.ping) ws.send(JSON.stringify({ pong: ret.ping }));

                // 无效格式
                if (! ret.tick) {
                    if (ret['err-msg']) this.emit('error_task', ret['err-msg'].split(' ')[2]);
                    else this.emit('unknow_message');
                }

                else {
                    const task = ret.ch.split('.')[1];

                    if (this.cache.get(task) !== + ret.tick.close) {
                        this.cache.set(task, + ret.tick.close);
                        this.emit('kline', { task: task, ticker: this.cache.get(task) });
                    }
                }
            }
            catch (err) {
                ws.emit('error', err.message || err);
            }
        });

        this.timer = setInterval(() => {
            if (++ this.timeout_count > config.timeout.time) {
                clearInterval(this.timer);
                ws.emit('error', 'long time no msg');
            }
        }, config.timeout.second);
    }
}

module.exports = Huobi;