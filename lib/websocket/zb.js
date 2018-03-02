'use strict';
const Events = require('events');
const WebSocket = require('ws');
const log = require('../log');
const config = require('../../config');

class Zb extends Events {

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
            log.info('zb websocket clinet open');
            this.tasks.forEach((task) => ws.send(JSON.stringify({ event: 'addChannel', channel: `${task}_ticker` })));
            this.emit('status', 'open');
        });

        ws.on('close', () => {
            log.info('zb websocket client closed');
            clearInterval(this.timer);
            this.emit('status', 'close');
            this.emit('close');
        });

        ws.on('error', (err) => {
            log.error(`zb websocket client occur error -> ${err.message || err}`);
            ws.terminate();
        });

        ws.on('message', (ret_str) => {
            try {
                this.timeout_count = 0;

                const ret = JSON.parse(ret_str);

                if (! ret.channel) this.emit('error_message');

                else {
                    // 截取交易对
                    const task = ret.channel.split('_ticker')[0];

                    // 无效格式
                    if (! ret.ticker) this.emit('error_task', task);

                    // 消息处理
                    else {
                        if (this.cache.get(task) !== + ret.ticker.last) {
                            this.cache.set(task, + ret.ticker.last);
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

module.exports = Zb;