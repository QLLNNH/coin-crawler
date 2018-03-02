'use strict';
const Events = require('events');
const WebSocket = require('ws');
const log = require('../log');
const config = require('../../config');

class Okex extends Events {

    constructor(opt) {
        super();
        this.num = Math.floor(Math.random() * 5000);
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
            log.info('okex websocket clinet open');
            this.tasks.forEach((task) => ws.send(JSON.stringify({ event: 'addChannel', channel: `ok_sub_spot_${task}_ticker` })));
            this.emit('status', 'open');
        });

        ws.on('close', () => {
            log.info('okex websocket client closed');
            clearInterval(this.timer);
            this.emit('status', 'close');
            this.emit('close');
        });

        ws.on('error', (err) => {
            log.error(`okex websocket client occur error -> ${err.message || err}`);
            ws.terminate();
        });

        ws.on('message', (ret_str) => {
            try {
                this.timeout_count = 0;

                let ret = JSON.parse(ret_str);

                if (Array.isArray(ret)) {
                    ret = ret[0];
                    if (/^ok_sub_spot_/.test(ret.channel)) {
                        const step_1 = ret.channel.split('ok_sub_spot_')[1];
                        const task = step_1.split('_ticker')[0];

                        if (this.cache.get(task) !== + ret.data.close) {
                            this.cache.set(task, + ret.data.close);
                            this.emit('kline', { task: task, ticker: this.cache.get(task) });
                        }
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

module.exports = Okex;