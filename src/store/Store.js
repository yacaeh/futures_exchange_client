import React, { createContext, useReducer, useEffect } from "react";
import Reducer from './Reducer'
import { useTheme } from '@material-ui/core/styles';
const crypto = require('crypto');

export const initialState = {
    openClose: false,
    openOpen: false,
    ticker: "PF_XBTUSD",
    prevTicker : "PF_XBTUSD",
    tickerRows: [],
    positionRows: [],
    prices: {},
    walletRows: [],
    tradeRows: [],
    pnLRows: [],
    openAmounts: {
        leverage: 5,
        price: 0,
        capital: { amount: 0, usdt: 0 },
        notional: { amount: 0, usdt: 0 },
        margin: { amount: 0, usdt: 0 }
    },
    openPositionAmount: 0,
    openOrderAmount: 0,
    fillsAmount : 0,
    candleInterval: "1m",
    timeRange: {},
    walletStream: {},
    tickerStream: {},
    tradeStream: {},
    openOrdersStream: {},
    openPositionsStream : {},
    fillsStream: {},
    dataUpdated: false,
};

export const ACTIONS = {
    SET_CLOSE_OPEN: 'SET_CLOSE_OPEN',
    SET_OPEN_OPEN: 'SET_OPEN_OPEN',
    SET_TICKER: 'SET_TICKER',
    SET_PREV_TICKER: 'SET_PREV_TICKER',
    SET_TICKER_ROWS: 'SET_TICKER_ROWS',
    SET_POSITION_ROWS: 'SET_POSITION_ROWS',
    SET_TRADE_ROWS: 'SET_TRADE_ROWS',
    SET_PRICES: 'SET_PRICES',
    SET_WALLET_ROWS: 'SET_WALLET_ROWS',
    SET_CAPITAL: 'SET_CAPITAL',
    SET_OPEN_AMOUNTS: 'SET_OPEN_AMOUNTS',
    SET_PNL_ROWS: 'SET_PNL_ROWS',
    SET_CANDLE_INTERVAL: 'SET_CANDLE_INTERVAL',
    SET_TIME_RANGE: 'SET_TIME_RANGE',
    SET_OPEN_POSITION_AMOUNT: 'SET_OPEN_POSITION_AMOUNT',
    SET_OPEN_ORDER_AMOUNT: 'SET_OPEN_ORDER_AMOUNT',
    SET_WALLET_STREAM : 'SET_WALLET_STREAM',
    SET_TICKER_STREAM : 'SET_TICKER_STREAM',
    SET_TRADE_STREAM : 'SET_TRADE_STREAM',
    SET_OPEN_ORDERS_STREAM : 'SET_OPEN_ORDERS_STREAM',
    SET_OPEN_POSITIONS_STREAM : 'SET_OPEN_POSITIONS_STREAM',
    SET_FILLS_STREAM : 'SET_FILLS_STREAM',
    SET_FILLS_AMOUNT : 'SET_FILLS_AMOUNT',
    SET_DATA_UPDATED : 'SET_DATA_UPDATED',
}
const wsurl = `wss://futures.kraken.com/ws/v1`
const getWebSocketSignature = (challange, secret) => {
    const secret_buffer = new Buffer(secret, 'base64');
    const hash          = new crypto.createHash('sha256');
    const hmac          = new crypto.createHmac('sha512', secret_buffer);
    const hash_digest   = hash.update(challange).digest('binary');
    const hmac_digest   = hmac.update(hash_digest, 'binary').digest('base64');

    return hmac_digest;
};


const Store = ({ children }) => {
    const [state, dispatch] = useReducer(Reducer, initialState);
    const theme = useTheme()

    const add_tick = (current, prior) => {

        let tick

        if (current > prior) {
            tick = theme.palette.success.main;
        }

        if (current < prior) {
            tick = theme.palette.error.main;
        }

        return tick;
    };



    // Initial data for position table
    async function getPositionRows() {
        const response = await fetch("http://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_PORT}/account");
        const data = await response.json();

        const responseDos = await fetch("http://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_PORT}/trades?form=last");
        const dataDos = await responseDos.json();
        const entryPrices = {}
        dataDos.forEach(openPos => entryPrices[openPos.symbol] = openPos.priceMargin)

        data.forEach(row => {
            if (row.positionAmt !== 0) {
                row.marginEntryPrice = entryPrices[row.symbol]
            }
        })

        dispatch({ type: ACTIONS.SET_POSITION_ROWS, payload: data })
    }

    // Initial data for wallet table
    async function getWalletRows() {
        const response = await fetch("http://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_PORT}/wallet");
        const data = await response.json();
        dispatch({ type: ACTIONS.SET_WALLET_ROWS, payload: data });
    }

    // Initial data for PnL table
    async function getPnLRows() {
        const response = await fetch("http://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_PORT}/trades?form=summary");
        const data = await response.json();
        dispatch({ type: ACTIONS.SET_PNL_ROWS, payload: data });
    }

    // Initial data for trades table
    async function getTradeRows() {
        const response = await fetch("http://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_PORT}/trades");
        const data = await response.json();
        dispatch({ type: ACTIONS.SET_TRADE_ROWS, payload: data });
    }

    useEffect(() => {
        // getWalletRows();
        // getPnLRows();
        // getPositionRows();
        // getTradeRows();
    }, []);

    // Price stream for position table
    async function streamPrices() {

        let ws = new WebSocket("ws://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_PORT}/market-stream");
        let oldPrices = {}
        ws.onmessage = (event) => {

            let filteredTickers = JSON.parse(event.data);

            const newPrices = {};
            filteredTickers.forEach((element) => {
                newPrices[element.s] = {
                    markPrice: element.p,
                    spotPrice: element.spotPrice,
                    fundingRate: element.r,
                    fundingTime: element.T,
                };


                if (Object.keys(oldPrices).length > 0) {
                    newPrices[element.s].markTick = add_tick(element.p, oldPrices[element.s].markPrice);
                    newPrices[element.s].spotTick = add_tick(element.spotPrice, oldPrices[element.s].spotPrice);
                }

            });
            dispatch({ type: ACTIONS.SET_PRICES, payload: newPrices })
            oldPrices = newPrices

        }
        return () => ws.close()
    }

    async function streamAccountUpdates() {
        let ws = new WebSocket("ws://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_PORT}/user-stream");
        ws.onmessage = (event) => {
            const update = JSON.parse(event.data)
            if (["ACCOUNT_UPDATE", "outboundAccountPosition"].indexOf(update.e) !== -1) {
                getWalletRows();
                getPnLRows();
                getPositionRows();
                getTradeRows();
                console.log("Positions, wallet and trades updated.")
            }
        }
        return () => ws.close()
    };

    async function streamPrivateFeed(feed) {

        let ws = new WebSocket(wsurl);
        let challange = ""
        let signedChallenge = ""
        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    "event": "challenge",
                    "api_key": process.env.REACT_APP_PRIVATE_API_KEY,
                })
            );

        };
        ws.onclose = (error) => {
            console.log("disconnect from " + wsurl);
            console.log(error);
        };
        ws.onerror = (error) => {
            console.log("connection error " + wsurl);
            console.log(error);
        };
        ws.onmessage = (evt) => {
            const data = JSON.parse(evt.data);
            console.log(data);

            
            if (data.event === "challenge") {
                challange = data.message;
                signedChallenge = getWebSocketSignature(data.message, process.env.REACT_APP_PRIVATE_API_KEY);
                ws.send(
                    JSON.stringify({
                        "event": "subscribe",
                        "feed": feed, //"open_positions", "balances", "open_orders_verbose"
                        "api_key": process.env.REACT_APP_PUBLIC_API_KEY,
                        "original_challenge": challange,
                        "signed_challenge": signedChallenge,
                    })
                );
            }

            if (data.feed === "balances") {
                console.log("balances:",data.flex_futures?.balance_value);
                dispatch({ type: ACTIONS.SET_WALLET_STREAM, payload: data })
            }

            if (data.feed === "open_positions") {
                console.log("open_positions:",data);
                dispatch({ type: ACTIONS.SET_OPEN_POSITIONS_STREAM, payload: data })
                dispatch({ type: ACTIONS.SET_OPEN_POSITION_AMOUNT, payload: data.positions?.length })

            }

            if (data.feed === "open_orders_verbose") {
                console.log("open_orders_verbose:",data);
                dispatch({ type: ACTIONS.SET_OPEN_ORDERS_STREAM, payload: data })
                dispatch({ type: ACTIONS.SET_OPEN_POSITION_AMOUNT, payload: data.orders?.length })
            }
            if (data.feed === "fills_snapshot") {
                console.log("fills_snapshot:",data);
                dispatch({ type: ACTIONS.SET_FILLS_STREAM, payload: data })
                dispatch({ type: ACTIONS.SET_FILLS_AMOUNT, payload: data.fills?.length })
            }


        }
        return () => ws.close()
    }



    async function streamPublicFeed(feed) {

        let ws = new WebSocket(wsurl);

        ws.onopen = () => {
            // console.log("Is opening everytime?");
            // if (state.prevTicker !== state.ticker){
            //     console.log(`Unsubscribing ${state.prevTicker} and subscribe ${state.ticker}`)
            //     ws.send(
            //         JSON.stringify({
            //             "event": "unsubscribe",
            //             "feed": feed, // "ticker", "trade"
            //             "product_ids": [
            //                 state.prevTicker
            //             ]
            //           })
            //     )    
            //     dispatch({ type: ACTIONS.SET_PREV_TICKER, payload: state.ticker })
            // }


            ws.send(
                JSON.stringify({
                    "event": "subscribe",
                    "feed": feed, // "ticker", "trade"
                    "product_ids": [
                        state.ticker
                    ]
                  })
            )
            dispatch({ type: ACTIONS.SET_DATA_UPDATED, payload: false })
        };
        ws.onclose = (error) => {
            console.log("disconnect from " + wsurl);
            console.log(error);
        };
        ws.onerror = (error) => {
            console.log("connection error " + wsurl);
            console.log(error);
        };
        ws.onmessage = (evt) => {
            const data = JSON.parse(evt.data);
            // if (state.prevTicker !== state.ticker){
            //     console.log(`Unsubscribe This ${state.prevTicker} and subscribe ${state.ticker}`)
            //     ws.send(
            //         JSON.stringify({
            //             "event": "unsubscribe",
            //             "feed": feed, // "ticker", "trade"
            //             "product_ids": [
            //                 state.prevTicker
            //             ]
            //           })
            //     )    
            //     dispatch({ type: ACTIONS.SET_PREV_TICKER, payload: state.ticker })
            // }

            if (data.feed === "ticker") {
                console.log(`Subscribed to ticker ${state.ticker}, ${data.product_id}`, data);
                dispatch({ type: ACTIONS.SET_TICKER_STREAM, payload: data })
                dispatch({ type: ACTIONS.SET_DATA_UPDATED, payload: true })
            }

            if (data.feed === "trade_snapshot") {
                console.log("Subscribed to trade", data);
                dispatch({ type: ACTIONS.SET_TRADE_STREAM, payload: data })
            }

        }
        return () => ws.close()
    }

    async function unSubscribePublicFeed(feed) {

        let ws = new WebSocket(wsurl);

        ws.onopen = () => {
            console.log(`Can this ${feed} ${state.prevTicker}be unsubscribed?`)
            ws.send(
                JSON.stringify({
                    "event": "unsubscribe",
                    "feed": feed, // "ticker", "trade"
                    "product_ids": [
                        state.prevTicker
                    ]
                  })
            )

        };
        ws.onclose = (error) => {
            console.log("disconnect from " + wsurl);
            console.log(error);
        };
        ws.onerror = (error) => {
            console.log("connection error " + wsurl);
            console.log(error);
        };
        ws.onmessage = (evt) => {
            const data = JSON.parse(evt.data);
            console.log("unsubscribe data",data);
        }
            return () => ws.close()
        }
    
    
    useEffect(() => {
        streamPrivateFeed("balances");
        streamPrivateFeed("open_positions");
        streamPrivateFeed("open_orders_verbose");
        streamPrivateFeed("fills");
    }, []);

    useEffect(() => {
        streamPublicFeed('ticker');
        streamPublicFeed('trade');

        if (state.ticker !== state.prevTicker){
            console.log("Ticker changed")
            unSubscribePublicFeed('ticker');
            unSubscribePublicFeed('trade');
            dispatch({ type: ACTIONS.SET_PREV_TICKER, payload: state.ticker })
        }

    }, [state.ticker]);

    // Update position rows with price changes
    useEffect(() => {
        // const updatePrice = (row) => {
        //     const notional = (price, positionAmt) => {
        //         return parseFloat(price) * parseFloat(positionAmt);
        //     };

        //     const unRealizedProfit = (price, entryPrice, positionAmt) => {
        //         return notional(price, positionAmt) - notional(entryPrice, positionAmt);
        //     };

        //     const margin = (price, entryPrice, positionAmt, leverage) => {
        //         return -notional(entryPrice, positionAmt) / leverage + unRealizedProfit(price, entryPrice, positionAmt);
        //     };

        //     row.markPrice = state.prices[row.symbol].markPrice;
        //     row.markTick = state.prices[row.symbol].markTick;
        //     row.spotPrice = state.prices[row.symbol].spotPrice;
        //     row.spotTick = state.prices[row.symbol].spotTick;
        //     row.fundingRate = state.prices[row.symbol].fundingRate;
        //     row.fundingTime = state.prices[row.symbol].fundingTime;

        //     row.notional = notional(row.markPrice, row.positionAmt)
        //     row.marginNotional = notional(row.spotPrice, row.marginPositionAmt)
        //     row.margin = margin(row.markPrice, row.entryPrice, row.positionAmt, row.leverage)
        //     row.unRealizedProfit = unRealizedProfit(row.markPrice, row.entryPrice, row.positionAmt)
        //     row.unRealizedProfitTick = add_tick(row.unRealizedProfit, 0)
        //     row.marginUnRealizedProfit = unRealizedProfit(row.spotPrice, row.marginEntryPrice, row.marginPositionAmt)
        //     row.marginUnRealizedProfitTick = add_tick(row.marginUnRealizedProfit, 0)
        //     row.totalUnRealizedProfit = parseFloat(row.unRealizedProfit) + parseFloat(row.marginUnRealizedProfit)
        //     row.totalUnRealizedProfitTick = add_tick(row.totalUnRealizedProfit, 0)

        //     return row;
        // };
        // const data = state.positionRows.map((row) => updatePrice(row))
        // dispatch({ type: ACTIONS.SET_POSITION_ROWS, payload: data });
    }, [state.prices]);

    return (
        <Context.Provider value={[state, dispatch]}>
            {children}
        </Context.Provider>
    )
};

export const Context = createContext(initialState);
export default Store;