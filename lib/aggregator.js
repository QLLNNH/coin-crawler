'use strict';
const Zb = require('./websocket/zb');
const Okex = require('./websocket/okex');
const Huobi = require('./websocket/huobi');
const Binance = require('./websocket/binance');
const { platform, tasks } = require('../config');

class Aggregator {

    constructor(ss) {
        this.ss = ss;
        this.sockets = new Map();
        this.last_one_cache = { zb: {}, okex: {}, huobi: {}, binance: {} };
        this.zb_map = new Map();
        this.okex_map = new Map();
        this.huobi_map = new Map();
        this.binance_map = new Map();
        this.platform_status = new Map();
        this.init_ws_server();
        this.init_zb_client();
        this.init_okex_client();
        this.init_huobi_client();
        this.init_binance_client();
    }

    init_ws_server() {
        const brief_platform = Object.keys(platform)
            .map((item) => {
                return {
                    index: platform[item].index,
                    platform: item
                };
            }).sort((a, b) => a.index - b.index);

        this.ss.on('connection', (socket) => {
            this.sockets.set(socket.id, socket);

            socket.on('disconnect', () => this.sockets.delete(socket.id));

            socket.on('platforms', () => socket.emit('platforms', brief_platform));

            socket.on('tasks', () => socket.emit('tasks', Object.keys(tasks)));

            socket.on('load_cache', () => {
                Object.keys(this.last_one_cache).forEach((pf) => {
                    Object.keys(this.last_one_cache[pf]).forEach((task) => {
                        socket.emit('kline', this.last_one_cache[pf][task]);
                    });
                });
            });

            socket.on('load_status', () => {
                for (let [k, v] of this.platform_status.entries()) {
                    socket.emit('status', { platform: k, message: v });
                }
            });
        });
    }

    init_zb_client() {
        if (this.zb_map.size === 0) Object.keys(tasks).forEach((task) => this.zb_map.set(tasks[task][platform.zb.index], task));

        this.zb_client = new Zb({ url: platform.zb.url, tasks: [...this.zb_map.keys()] });

        this.zb_client.on('kline', (msg) => {
            msg.task = this.zb_map.get(msg.task);
            msg.index = platform.zb.index;
            this.last_one_cache.zb[msg.task] = msg;
            for (let socket of this.sockets.values()) socket.emit('kline', msg);
        });

        this.zb_client.on('close', (msg) => this.init_zb_client());

        this.zb_client.on('status', (msg) => {
            this.platform_status.set('zb', msg);
            for (let socket of this.sockets.values()) {
                socket.emit('status', { platform: 'zb', message: msg });
            }
        });
    }

    init_okex_client() {
        if (this.okex_map.size === 0) Object.keys(tasks).forEach((task) => this.okex_map.set(tasks[task][platform.okex.index], task));

        this.okex_client = new Okex({ url: platform.okex.url, tasks: [...this.okex_map.keys()] });

        this.okex_client.on('kline', (msg) => {
            msg.task = this.okex_map.get(msg.task);
            msg.index = platform.okex.index;
            this.last_one_cache.okex[msg.task] = msg;
            for (let socket of this.sockets.values()) socket.emit('kline', msg);
        });

        this.okex_client.on('close', (msg) => this.init_okex_client());

        this.okex_client.on('status', (msg) => {
            this.platform_status.set('okex', msg);
            for (let socket of this.sockets.values()) {
                socket.emit('status', { platform: 'okex', message: msg });
            }
        });
    }

    init_huobi_client() {
        if (this.huobi_map.size === 0) Object.keys(tasks).forEach((task) => this.huobi_map.set(tasks[task][platform.huobi.index], task));

        this.huobi_client = new Huobi({ url: platform.huobi.url, tasks: [...this.huobi_map.keys()] });

        this.huobi_client.on('kline', (msg) => {
            msg.task = this.huobi_map.get(msg.task);
            msg.index = platform.huobi.index;
            this.last_one_cache.huobi[msg.task] = msg;
            for (let socket of this.sockets.values()) socket.emit('kline', msg);
        });

        this.huobi_client.on('close', (msg) => this.init_huobi_client());

        this.huobi_client.on('status', (msg) => {
            this.platform_status.set('huobi', msg);
            for (let socket of this.sockets.values()) {
                socket.emit('status', { platform: 'huobi', message: msg });
            }
        });
    }

    init_binance_client() {
        if (this.binance_map.size === 0) Object.keys(tasks).forEach((task) => this.binance_map.set(tasks[task][platform.binance.index], task));

        this.binance_client = new Binance({ url: platform.binance.url, tasks: [...this.binance_map.keys()] });

        this.binance_client.on('kline', (msg) => {
            msg.task = this.binance_map.get(msg.task);
            msg.index = platform.binance.index;
            this.last_one_cache.binance[msg.task] = msg;
            for (let socket of this.sockets.values()) socket.emit('kline', msg);
        });

        this.binance_client.on('close', (msg) => this.init_binance_client());

        this.binance_client.on('status', (msg) => {
            this.platform_status.set('binance', msg);
            for (let socket of this.sockets.values()) {
                socket.emit('status', { platform: 'binance', message: msg });
            }
        });
    }
}

module.exports = Aggregator;