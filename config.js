'use strict';

module.exports = {
    timeout: { time: 3, second: 10000 },
    platform: {
        zb: {
            index: 3,
            url: 'wss://api.zb.com:9999/websocket'
        },
        okex: {
            index: 2,
            url: 'wss://real.okex.com:10441/websocket'
        },
        huobi: {
            index: 0,
            url: 'wss://api.huobi.pro/ws'
        },
        binance: {
            index: 1,
            url: 'wss://stream.binance.com:9443/stream'
        }
    },
    tasks: {
        btc_usdt: ['btcusdt', 'btcusdt', 'btc_usdt', 'btcusdt'],
        bch_usdt: ['bchusdt', 'bccusdt', 'bch_usdt', 'bccusdt'],
        eth_usdt: ['ethusdt', 'ethusdt', 'eth_usdt', 'ethusdt'],
        etc_usdt: ['etcusdt', '', 'etc_usdt', 'etcusdt'],
        ltc_usdt: ['ltcusdt', 'ltcusdt', 'ltc_usdt', 'ltcusdt'],
        eos_usdt: ['eosusdt', '', 'eos_usdt', 'eosusdt'],
        xrp_usdt: ['xrpusdt', '', 'xrp_usdt', 'xrpusdt'],
        omg_usdt: ['omgusdt', '', 'omg_usdt', ''],
        dash_usdt: ['dashusdt', '', 'dash_usdt', 'dashusdt'],
        zec_usdt: ['zecusdt', '', 'zec_usdt', ''],
        hsr_usdt: ['hsrusdt', '', 'hsr_usdt', 'hsrusdt'],
        qtum_usdt: ['qtumusdt', '', 'qtum_usdt', 'qtumusdt'],
        iost_usdt: ['iostusdt', '', 'iost_usdt', ''],
        bch_btc: ['bchbtc', 'bccbtc', 'bch_btc', 'bccbtc'],
        eth_btc: ['ethbtc', 'ethbtc', 'eth_btc', 'ethbtc'],
        ltc_btc: ['ltcbtc', 'ltcbtc', 'ltc_btc', 'ltcbtc'],
        etc_btc: ['etcbtc', 'etcbtc', 'etc_btc', 'etcbtc'],
        eos_btc: ['eosbtc', 'eosbtc', 'eos_btc', 'eosbtc'],
        omg_btc: ['omgbtc', 'omgbtc', 'omg_btc', ''],
        dash_btc: ['dashbtc', 'dashbtc', 'dash_btc', 'dashbtc'],
        xrp_btc: ['xrpbtc', 'xrpbtc', 'xrp_btc', 'xrpbtc'],
        zec_btc: ['zecbtc', 'zecbtc', 'zec_btc', ''],
        iost_btc: ['iostbtc', 'iostbtc', 'iost_btc', ''],
        hsr_btc: ['hsrbtc', 'hsrbtc', 'hsr_btc', 'hsrbtc'],
        qtum_btc: ['qtumbtc', 'qtumbtc', 'qtum_btc', 'qtumbtc']
    }
}