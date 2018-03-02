'use strict';
const Events = require('events');
const WebSocket = require('ws');
const log = require('../log');
const config = require('../../config');

class Binance extends Events {

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
        this.url += '?streams=';

        this.tasks.forEach((task) => this.url += `${task}@kline_1m/`);

        this.url = this.url.substring(0, this.url.length - 1);

        const ws = new WebSocket(this.url);

        ws.on('open', () => {
            log.info('binance websocket clinet open');
            this.emit('status', 'open');
        });

        ws.on('close', (err) => {
            log.info('binance websocket client closed');
            clearInterval(this.timer);
            this.emit('status', 'close');
            this.emit('close');
        });

        ws.on('error', err => {
            log.error(`binance websocket client occur error -> ${err.message || err}`);
            ws.terminate();
        });

        ws.on('message', (ret_str) => {
            try {
                this.timeout_count = 0;

                const ret = JSON.parse(ret_str);
                const task = ret.stream.split('@')[0];

                if (this.cache.get(task) !== + ret.data.k.c) {
                    this.cache.set(task, + ret.data.k.c);
                    this.emit('kline', { task: task, ticker: this.cache.get(task) });
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


module.exports = Binance;