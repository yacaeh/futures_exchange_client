import { makeStyles } from "@material-ui/core/styles";
import { ACTIONS, Context } from "../store/Store";
import SelectSearch from "react-select-search";
import { useTheme } from "@material-ui/core/styles";
import React, { useEffect, useRef, useState, useContext } from "react";
import "react-select-search/style.css";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import {
  Button,
  Box,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Snackbar,
} from "@material-ui/core";
import Link from "@material-ui/core/Link";
import Container from "@material-ui/core/Container";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TabContext from "@material-ui/lab/TabContext";
import TabList from "@material-ui/lab/TabList";
import TabPanel from "@material-ui/lab/TabPanel";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import InputAdornment from "@material-ui/core/InputAdornment";
import MuiAlert from "@material-ui/lab/Alert";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function OrderForm({ data }) {
  const theme = useTheme();
  const useStyles = makeStyles({
    root: {
      width: "100%",
      "& > * + *": {
        marginTop: theme.spacing(2),
      },
    },

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
  const [openSnackBar, setOpenSnackBar] = React.useState(false);

  const [state, dispatch] = useContext(Context);
  const [suggestBid, setSuggestBid] = useState(0);
  const [leverage, setLeverage] = useState(1);
  const [quantity, setQuantity] = useState(0);
  const [notional, setNotional] = useState(0);
  const [initTickers, setInitTickers] = useState([]);
  const [openOrders, setOpenOrders] = useState([]);
  const [orderSide, setOrderSide] = useState("buy");
  const [selectedTab, setTab] = useState("1");
  const [newOrder, setNewOrder] = useState({
    orderType: "lmt",
    side: orderSide,
    size: 0.0,
    symbol: state.ticker,
    limitPrice: 0.0,
    cliOrdId: "",
    reduceOnly: false,
    stopPrice: 0.0,
    triggerSignal: "mark",
    trailingStopDeviationUnit: "",
    trailingStopMaxDeviation: "",
  });
  //lmt, post, ioc, mkt, stp, take_profit, trailing_stop

  // View Orders
  // symbol: state.ticker,
  // side: orderSide,
  // type: "",
  // price: 0,
  // amount: 0,
  // orderType: "",
  // status: "",
  // reduceOnly: false,
  // lastUpdateTime: null,

  useEffect(() => {
    setSuggestBid(Math.ceil(state.tickerStream?.bid));
  }, [state.dataUpdated]);

  const handleTab = (event, newValue) => {
    setTab(newValue);
    var type = "";
    if (newValue == "1") type = "lmt";
    else if (newValue == "2") type = "mkt";
    else if (newValue == "3") type = "stp";
    setNewOrder({ ...newOrder, orderType: type });
  };

  const handleChange = (event, newSide) => {
    setOrderSide(newSide);
    setNewOrder({ ...newOrder, side: newSide });
  };

  const handleQuantityChange = (event) => {
    setQuantity(event.target.value);
    setNotional((event.target.value * suggestBid).toFixed(2));
    setNewOrder({ ...newOrder, size: event.target.value });
  };

  const handleLimitPriceChange = (event) => {
    setSuggestBid(event.target.value);
    setNewOrder({ ...newOrder, limitPrice: event.target.value });
  };

  const handleReduceOnlyChange = (event) => {
    setNewOrder({ ...newOrder, reduceOnly: event.target.checked });
  };

  const handleOpenSnackBar = () => {
    setOpenSnackBar(true);
  };

  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackBar(false);
  };

  const handleNotionalChange = (event) => {
    setNotional(event.target.value);
    setQuantity((event.target.value / suggestBid).toFixed(4));
    setNewOrder({ ...newOrder, limitPrice: suggestBid, size: quantity });
  };
  

  const createOrderEndPoint = `createOrder`;
  // const cancelOrderEndPoint = `cancelOrder/${selectedOrder.id}`;
  // const cancelAllOrderEndPoints = `cancelAllOrder`;
  // const editOrderEndPoint = `editOrder/${selectedOrder.id}`;

  async function createOrder(event) {
    // handleOpenSnackBar();
    event.preventDefault();
    setNewOrder({ ...newOrder, limitPrice: suggestBid, size: quantity });

    const config = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newOrder),
    };
    console.log(newOrder);
    const url = `http://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_PORT}/${createOrderEndPoint}`;
    console.log(url);
    await fetch(url, config)
      .then((res) => res.json())
      .catch((err) => console.log(err));
  }

  // async function editOrder(order, endPoint = editOrderEndPoint) {
  //   const config = {
  //     method: "PUT",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(order),
  //   };
  //   const url = `http://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_PORT}/${endPoint}`;
  //   const response = await fetch(url, config);
  //   console.log(await response.json());
  // }

  // async function cancelOrder(order, endPoint = cancelOrderEndPoint) {
  //   const config = {
  //     method: "DELETE",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(order),
  //   };
  //   const url = `http://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_PORT}/${endPoint}`;
  //   const response = await fetch(url, config);
  //   console.log(await response.json());
  // }

  // async function cancelAllOrder(order, endPoint = cancelAllOrderEndPoints) {
  //   const config = {
  //     method: "DELETE",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(order),
  //   };
  //   const url = `http://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_PORT}/${endPoint}`;
  //   const response = await fetch(url, config);
  //   console.log(await response.json());
  // }

  const endPoint = `openOrders`;
  // useEffect(() => {
  //   const apiUrl = `http://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_PORT}/${endPoint}`;

  //   async function getOpenOrders() {
  //     const response = await fetch(apiUrl);
  //     const data = await response.json();
  //     setOpenOrders(data.openOrders);
  //   }

  //   //   {
  //   //     'order_id': '2ce038ae-c144-4de7-a0f1-82f7f4fca864',
  //   //     'symbol': 'pi_ethusd',
  //   //     'side': 'buy',
  //   //     'orderType': 'lmt',
  //   //     'limitPrice': 1200,
  //   //     'unfilledSize': 100,
  //   //     'receivedTime': '2023-04-07T15:18:04.699Z',
  //   //     'status': 'untouched',
  //   //     'filledSize': 0,
  //   //     'reduceOnly': False,
  //   //     'lastUpdateTime': '2023-04-07T15:18:04.699Z'
  //   // }

  //   getOpenOrders();

  //   // let ws = new WebSocket(`ws://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_PORT}/ws/${endPoint}`)
  //   // ws.onmessage = (event) => {
  //   //     setLastCandle(JSON.parse(event.data.candles))
  //   // };
  //   // return () => ws.close()
  // }, [openOrders]);

  return (
    <Container component="main" maxWidth="xs">
      <ToggleButtonGroup
        color="primary"
        value={orderSide}
        exclusive
        onChange={handleChange}
        aria-label="Platform"
      >
        <ToggleButton value="buy" style={{ backgroundColor: "#3C9B4A" }}>
          Buy | Long
        </ToggleButton>
        <ToggleButton value="sell" style={{ backgroundColor: "#E2434D" }}>
          Sell | Short
        </ToggleButton>
      </ToggleButtonGroup>
      <TabContext value={selectedTab}>
        <TabList onChange={handleTab} aria-label="simple tabs example">
          <Tab label="Limit" value="1" />
          <Tab label="Market" value="2" />
          {/* <Tab label="Stop Loss" value="3" /> */}
        </TabList>
        <TabPanel value="1">
          <form
            className={classes.form}
            onSubmit={(event) => createOrder(event)}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={62}>
                <TextField
                  value={suggestBid}
                  name="Limit Price"
                  variant="outlined"
                  required
                  fullWidth
                  id="limitPrice"
                  label="Limit Price"
                  onChange={handleLimitPriceChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="end">USD</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={62}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  value={quantity}
                  id="quantity"
                  label="Quantity"
                  name="quantity"
                  onChange={handleQuantityChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="end">
                        {state.ticker.slice(0, -3)}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={62}>
                <TextField
                  variant="outlined"
                  value = {notional}
                  fullWidth
                  id="notional"
                  label="~ Notional:"
                  name="~ Notional:"
                  onChange={handleNotionalChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="end">
                        USD
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <div>
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  className={classes.margin}
                  onClick={()=> handleNotionalChange({target:{value:state.walletStream?.flex_futures?.available_margin *0.25}})}
                >
                  25%
                </Button>
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  className={classes.margin}
                  onClick={()=> handleNotionalChange({target:{value:state.walletStream?.flex_futures?.available_margin *0.5}})}
                >
                  50%
                </Button>
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  className={classes.margin}
                  onClick={()=> handleNotionalChange({target:{value:state.walletStream?.flex_futures?.available_margin *0.75}})}
                >
                  75%
                </Button>
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  className={classes.margin}
                  onClick={()=> handleNotionalChange({target:{value:state.walletStream?.flex_futures?.available_margin}})}
                >
                  100%
                </Button>
              </div>
              <Typography
                className={classes.margin}
                variant="body2"
                color="textSecondary"
                component="p"
              > Available Margin : {state.walletStream?.flex_futures?.available_margin} USD
                </Typography>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={handleReduceOnlyChange}
                      color="primary"
                    />
                  }
                  label="Reduce Only"
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Place {orderSide} Order
            </Button>
          </form>
        </TabPanel>
        <TabPanel value="2">
          <form className={classes.form} onSubmit={createOrder}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={62}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="quantity"
                  label="Quantity"
                  name="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="end">
                        {state.ticker.slice(0, -3)}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={62}>
                <TextField
                  variant="outlined"
                  value = {notional}
                  fullWidth
                  id="notional"
                  label="~ Notional:"
                  name="~ Notional:"
                  onChange={handleNotionalChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="end">
                        USD
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <div>
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  className={classes.margin}
                  onClick={()=> handleNotionalChange({target:{value:state.walletStream?.flex_futures?.available_margin *0.25}})}
                >
                  25%
                </Button>
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  className={classes.margin}
                  onClick={()=> handleNotionalChange({target:{value:state.walletStream?.flex_futures?.available_margin *0.5}})}
                >
                  50%
                </Button>
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  className={classes.margin}
                  onClick={()=> handleNotionalChange({target:{value:state.walletStream?.flex_futures?.available_margin *0.75}})}
                >
                  75%
                </Button>
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  className={classes.margin}
                  onClick={()=> handleNotionalChange({target:{value:state.walletStream?.flex_futures?.available_margin}})}
                >
                  100%
                </Button>
              </div>
              <Typography
                className={classes.margin}
                variant="body2"
                color="textSecondary"
                component="p"
              > Available Margin : {state.walletStream?.flex_futures?.available_margin} USD
                </Typography>
    
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={handleReduceOnlyChange}
                      color="primary"
                    />
                  }
                  label="Reduce Only"
                />
              </Grid>

            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Place {orderSide} Order
            </Button>
          </form>
        </TabPanel>
        {/* <TabPanel value="3">
        <form className={classes.form} noValidate>
        <Grid container spacing={2}>

          <Grid item xs={12} sm={6}>
            <TextField
              name="firstName"
              variant="outlined"
              required
              fullWidth
              id="firstName"
              label="First Name"
              autoFocus
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="lastName"
              label="Last Name"
              name="lastName"
              autoComplete="lname"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox value="allowExtraEmails" color="primary" />}
              label="I want to receive inspiration, marketing promotions and updates via email."
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
        >
          Place Order
        </Button>
      </form>
        </TabPanel> */}
      </TabContext>
    </Container>
  );
}
