import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { useTheme } from '@material-ui/core/styles'
import React, { useEffect, useRef, useState, useContext } from 'react';
import { createChart } from 'lightweight-charts';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty'
import { ACTIONS, Context } from '../store/Store'
import moment from 'moment';



const HEIGHT = 300;

const useStyles = makeStyles({
    root: {
        width: "100%",
    }
});

const CandleChart = ({ data, decimals }) => {
    // https://github.com/tradingview/lightweight-charts/blob/master/docs/customization.md

    const [state, dispatch] = useContext(Context);

    const classes = useStyles();
    const elRef = useRef();
    const chartRef = useRef()
    const candlestickSeriesRef = useRef()
    const volumeSeriesRef = useRef()
    const [initCandles, setInitCandles] = useState([])
    const [initVolumes, setInitVolumes] = useState([])
    const [lastCandle, setLastCandle] = useState({})
    const [timeRange, setTimeRange] = useState({ from: 0, to: 0 })
    const theme = useTheme();

    // const endPoint = `klines/${data}/${state.ticker}?interval=${state.candleInterval}`
    const endPoint = `charts/${data}/${state.ticker}/${state.candleInterval}`
    useEffect(() => {
        const apiUrl = `${process.env.REACT_APP_SERVER_URL}/${endPoint}`

        async function getInitCandles() {
            const response = await fetch(apiUrl);
            const data = await response.json();
            console.log(data.candels);
            setInitCandles(data.candles.map(c => ({ time: c.time/1000, open: c.open, close: c.close, high: c.high, low:c.low})));
            setInitVolumes(data.candles.map(c => ({ time: c.time/1000, value: c.volume })));
        };

        getInitCandles();

        // let ws = new WebSocket(`ws://${process.env.REACT_APP_SERVER_URL}/ws/${endPoint}`)
        // ws.onmessage = (event) => {
        //     setLastCandle(JSON.parse(event.data.candles))
        // };
        // return () => ws.close()

    }
        , [endPoint]);

    useEffect(() => {
        var now = moment(Date.now());
        var start = now.subtract(1, 'days');

        chartRef.current = createChart(elRef.current, {
            width: elRef.current.offsetWidth,
            height: HEIGHT,
            alignLabels: true,
            timeScale: {
                rightOffset: 0,
                barSpacing: 15,
                fixLeftEdge: false,
                lockVisibleTimeRangeOnResize: true,
                rightBarStaysOnScroll: true,
                borderVisible: false,
                visible: true,
                timeVisible: true,
                secondsVisible: true,
            },
            rightPriceScale: {
                scaleMargins: {
                    top: 0.3,
                    bottom: 0.25,
                },
                borderVisible: false,
            },
            priceScale: {
                autoScale: true,
            },
            grid: {
                vertLines: {
                    color: theme.palette.action.secondary,
                    style: 4

                },
                horzLines: {
                    color: theme.palette.action.secondary,
                    style: 4
                },
            },

            layout: {
                fontFamily: theme.typography.fontFamily,
                backgroundColor: theme.palette.background.paper,
                textColor: theme.palette.text.secondary
            }
        });

        candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
            priceScaleId: 'right',
            upColor: theme.palette.success.main,
            downColor: theme.palette.error.main,
            borderVisible: false,
            wickVisible: true,
            wickUpColor: theme.palette.success.main,
            wickDownColor: theme.palette.error.main,
            priceFormat: {
                type: 'custom',
                minMove: '0.00000001',
                formatter: (price) => {
                    return parseFloat(price).toFixed(decimals);
                }
            },
        });

        candlestickSeriesRef.current.setData(initCandles);


        volumeSeriesRef.current = chartRef.current.addHistogramSeries({
            color: theme.palette.action.disabledBackground,
            borderVisible: false,
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
            scaleMargins: {
                top: 0.9,
                bottom: 0.0,
            },
        });

        volumeSeriesRef.current.setData(initVolumes);
        dispatch({ type: ACTIONS.SET_TIME_RANGE, payload: chartRef.current.timeScale().getVisibleRange() })

        function onVisibleTimeRangeChanged(newVisibleTimeRange) {
            dispatch({ type: ACTIONS.SET_TIME_RANGE, payload: newVisibleTimeRange })
        }

        chartRef.current.timeScale().subscribeVisibleTimeRangeChange(onVisibleTimeRangeChanged);

        return () => chartRef.current.remove()

    }, [initCandles, initVolumes]);

    useEffect(() => {
        if (!isEmpty(lastCandle)) {
            candlestickSeriesRef.current.update(lastCandle);
            volumeSeriesRef.current.update({ time: lastCandle.time, value: lastCandle.volume });
        }

    }, [lastCandle]);

    useEffect(
        () => {
            if ( initCandles.length > 0) {
                const handler = setTimeout(() => {
                    chartRef.current.timeScale().fitContent()
                    chartRef.current.timeScale().setVisibleLogicalRange({
                        from: initCandles.length-30,
                        to: initCandles.length, //Tuesday, 1 January 2019 00:00:00
                      });
                }, 200);
                return () => {
                    clearTimeout(handler);
                };
            }
        },
        [timeRange,initCandles]
    );

    useEffect(() => {
        const handler = () => {
            chartRef.current.resize(elRef.current.offsetWidth, HEIGHT);
        };
        window.addEventListener('resize', handler);
        return () => {
            window.removeEventListener('resize', handler);
        };
    }, []);

    const intervalButtons = ["1m", "5m", "15m", "30m", "1h", "4h", "12h", "1d", "1w"]

    const handleIntervalClick = (interval) => {
        dispatch({ type: ACTIONS.SET_CANDLE_INTERVAL, payload: interval })
    }

    return (
        <Grid item xs={12} lg={6}>
            <Card className={classes.root}>
                <CardContent>
                    <Typography variant="h5" color="textSecondary">
                        {state.ticker.toUpperCase()} {data}
                    </Typography>
                    <div ref={elRef} style={{ 'position': 'relative', 'width': '100%' }}></div>
                </CardContent>
                <CardActions>
                    {intervalButtons.map(interval => (
                        <Button variant={interval === state.candleInterval ? "outlined" : "text"} onClick={() => handleIntervalClick(interval)}>
                            {interval}
                        </Button>
                    ))}
                </CardActions>
            </Card>
        </Grid>
    );
};

CandleChart.propTypes = {
    endPoint: PropTypes.string,
    title: PropTypes.string,
    decimals: PropTypes.number,
};

export default CandleChart;