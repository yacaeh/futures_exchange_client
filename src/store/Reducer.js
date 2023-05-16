import { ACTIONS } from './Store'


const Reducer = (state, action) => {
    switch (action.type) {
        case ACTIONS.SET_CLOSE_OPEN:
            return {
                ...state,
                openClose: action.payload
            };
        case ACTIONS.SET_OPEN_OPEN:
            return {
                ...state,
                openOpen: action.payload
            };
        case ACTIONS.SET_TICKER:
            return {
                ...state,
                ticker: action.payload
            };
        case ACTIONS.SET_PREV_TICKER:
            return {
                ...state,
                prevTicker: action.payload
            };

        case ACTIONS.SET_TICKER_ROWS:
            return {
                ...state,
                tickerRows: action.payload
            };
        case ACTIONS.SET_POSITION_ROWS:
            return {
                ...state,
                positionRows: action.payload
            };
        case ACTIONS.SET_PRICES:
            return {
                ...state,
                prices: action.payload
            };
        case ACTIONS.SET_WALLET_ROWS:
            return {
                ...state,
                walletRows: action.payload
            };
        case ACTIONS.SET_TRADE_ROWS:
            return {
                ...state,
                tradeRows: action.payload
            };
        case ACTIONS.SET_PNL_ROWS:
            return {
                ...state,
                pnLRows: action.payload
            };
        case ACTIONS.SET_OPEN_AMOUNTS:
            return {
                ...state,
                openAmounts: action.payload
            };
        case ACTIONS.SET_CANDLE_INTERVAL:
            return {
                ...state,
                candleInterval: action.payload
            };
        case ACTIONS.SET_TIME_RANGE:
            return {
                ...state,
                timeRange: action.payload
            };
        case ACTIONS.SET_OPEN_POSITION_AMOUNT:
            return {
                ...state,
                openPositionAmount: action.payload
            };
        case ACTIONS.SET_OPEN_ORDER_AMOUNT:
            return {
                ...state,
                openOrderAmount: action.payload
            };
        case ACTIONS.SET_WALLET_STREAM:
            return {
                ...state,
                walletStream: action.payload
            };
        case ACTIONS.SET_TRADE_STREAM:
            return {
                ...state,
                tradeStream: action.payload
            };
        case ACTIONS.SET_TICKER_STREAM:
            return {
                ...state,
                tickerStream: action.payload
            };
        
        case ACTIONS.SET_OPEN_ORDERS_STREAM:
            return {
                ...state,
                openOrdersStream: action.payload
            };
        case ACTIONS.SET_FILLS_STREAM:
            return {
                ...state,
                fillsStream: action.payload
            };
        case ACTIONS.SET_FILLS_AMOUNT:
            return {
                ...state,
                fillsAmount: action.payload
            };
        case ACTIONS.SET_DATA_UPDATED:
            return {
                ...state,
                dataUpdated: action.payload
            };

            
        default:
            return state;
    }
};

export default Reducer;