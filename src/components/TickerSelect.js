import { makeStyles } from "@material-ui/core/styles";
import { ACTIONS, Context } from '../store/Store';
import SelectSearch from 'react-select-search';
import { useTheme } from "@material-ui/core/styles";
import React, { useEffect, useRef, useState, useContext } from 'react';
import 'react-select-search/style.css'
import Grid from '@material-ui/core/Grid';
import { Typography } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import dotenv from 'dotenv'
import moment from "moment";
import { nFormatter,parseMillisecondsIntoReadableTime } from "./utils/formatters";
dotenv.config()
var nf = new Intl.NumberFormat("en", { minimumFractionDigits: 2 });

export default function TickerSelect({data}) {
  const theme = useTheme();
  const useStyles = makeStyles({
    root: {
      color: theme.palette.text.secondary,
    },
    tableRow: {
      "&$selected": {
        backgroundColor: theme.palette.action.selected,
      },
      "&$selected:hover": {
        backgroundColor: theme.palette.action.disabled,
      },
    },
    selected: {},
  });
  const classes = useStyles();

  const [state, dispatch] = useContext(Context);
  const [initTickers, setInitTickers] = useState([]);
  const [currentTicker, setCurrentTicker] = useState({});
  const [socketConnected, setSocketConnected] = useState(false);
  const [sendMsg, setSendMsg] = useState(false);

  const endPoint = `tickers`
  const iconBaseUrl = `https://futures.kraken.com/trade/assets/images/crypto-icons/color/`
  useEffect(() => {
    console.log(process.env.REACT_APP_SERVER_URL)
    const apiUrl = `${process.env.REACT_APP_SERVER_URL}/${endPoint}`

    async function getInitTickers() {
        const response = await fetch(apiUrl);
        const data = await response.json();
        setInitTickers(data.tickers.map((ticker) => ({name: `(${ticker.tag})${ticker.pair?.replace(':','/')}`, value: ticker.symbol,pair:ticker.pair, markPrice: ticker.markPrice,bid:ticker.bid, bidSize: ticker.bidSize, ask: ticker.ask,indexPrice:ticker.indexPrice, last:ticker.last, lastTime:ticker.lastTime, lastSize:ticker.lastSize, vol24h:ticker.vol24h, volumeQuote:ticker.volumeQuote, openInterest:ticker.openInterest, open24h:ticker.open24h, fundingRate:ticker.fundingRate, fundingRatePrediction:ticker.fundingRatePrediction, postOnly:ticker.postOnly, suspended:ticker.suspended, })));
    };
    //  "markPrice":40.637,"bid":40.592,"bidSize":37.6,"ask":40.703,"askSize":8.9,"vol24h":31.7,"volumeQuote":1249.6157,"openInterest":376.3,"open24h":39.196,"indexPrice":40.652,"last":39.575,"lastTime":"2023-05-03T18:35:23.794Z","lastSize":0.1,"suspended":false,"fundingRate":-0.000841780209375,"fundingRatePrediction":-0.000873416548333342,"postOnly":false
    getInitTickers();

    // let ws = new WebSocket(`ws://${process.env.REACT_APP_SERVER_URL}/ws/${endPoint}`)
    // ws.onmessage = (event) => {
    //     setLastCandle(JSON.parse(event.data.candles))
    // };
    // return () => ws.close()

}
    , []);

  const onTickerClick = (ticker, selectedOption) => {
    dispatch({ type: ACTIONS.SET_TICKER, payload: ticker });
    setCurrentTicker(selectedOption);
  };

  const getTimeToFunding = (timestamp) => {
    const timeDelta = timestamp - Date.now();

    const hours = `0${new Date(timeDelta).getUTCHours()}`.slice(-2);
    const minutes = `0${new Date(timeDelta).getUTCMinutes()}`.slice(-2);
    const seconds = `0${new Date(timeDelta).getUTCSeconds()}`.slice(-2);

    const formattedTime = `${hours}:${minutes}:${seconds}`;
    const endPoint = `charts/${data}/${state.ticker}/${state.candleInterval}`

    return formattedTime;
  };
  return (
    <Grid container spacing={2}>
    <SelectSearch options={initTickers} search={true} value={state.ticker} onChange={(value, selectedOption)=> onTickerClick(value,selectedOption)} placeholder="Select ticker to watch" defaultValue="PF_XBTUSD" />
    <TableContainer component={Paper}>
      <Table size="small" aria-label="ticker table">
        <TableHead>
          <TableRow>
            <TableCell className={classes.root}>Ticker</TableCell>
            <TableCell align="right" className={classes.root}>
              MID Price
            </TableCell>
            <TableCell align="right" className={classes.root}>
              Mark Price
            </TableCell>
            <TableCell align="right" className={classes.root}>
              Funding Rate
            </TableCell>
            <TableCell align="right" className={classes.root}>
              EST.NEXT RATE
            </TableCell>
            <TableCell align="right" className={classes.root}>
              NEXT RATE IN
            </TableCell>
            <TableCell align="right" className={classes.root}>
              OI (OpenInterest)
            </TableCell>
            <TableCell align="right" className={classes.root}>
              VOLUME
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
            <TableRow>
              <TableCell component="th" scope="row">
              
                {state.tickerStream?.pair ? (
                <Grid container rowSpacing={1} >
                  <Grid item xs={3}>
                    <img src={`${iconBaseUrl}${state.tickerStream?.pair.toString().replace(':USD','').toLowerCase()}.svg`} alt={state.tickerStream?.pair}  width={24} height={24}/>
                  </Grid>
                  <Grid item xs={4}>
                    {state.tickerStream?.pair?.toString().replace(':','/')}
                  </Grid>
                </Grid>)
                : 
                (
                  <Grid container rowSpacing={1} >
                  <Grid item xs={3}>
                <img src={`${iconBaseUrl}btc.svg`} alt={currentTicker.pair}  width={24} height={24}/>
                </Grid>
                <Grid item xs={4}>
                BTC/USD
                </Grid>
                </Grid>)
              }
              </TableCell>
              <TableCell align="right">
                {nf.format((state.tickerStream?.ask + state.tickerStream?.bid)/2 ?? 0)}
              </TableCell>
              <TableCell align="right">
                {nf.format(state.tickerStream?.markPrice ?? 0)} <Typography style={{
                              color: state.tickerStream?.change < 0 ? "#EE3333" : "#3C9B4A",
                            }}>{state.tickerStream?.change?.toFixed(1)}%</Typography>
              </TableCell>
              <TableCell align="right">
                {(state.tickerStream?.relative_funding_rate*100 ?? 0).toFixed(4)}% / hr
              </TableCell>
              <TableCell align="right">
                {(state.tickerStream?.relative_funding_rate_prediction*100 ?? 0).toFixed(4)}% / hr
              </TableCell>
              <TableCell align="right">
              {parseMillisecondsIntoReadableTime(state.tickerStream?.next_funding_rate_time-state.tickerStream?.time)}
              </TableCell>
              <TableCell align="right">
              {nFormatter(state.tickerStream?.openInterest,2) ?? 0}
              </TableCell>
              <TableCell align="right">
              {nFormatter(state.tickerStream?.volume,2) ?? 0}
              </TableCell>

            </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
      
    </Grid>
  )
}