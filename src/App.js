import { Fragment, useContext } from "react";
import {
  makeStyles,
} from "@material-ui/core/styles";
import {
  AppBar,
  Container,
  Box,
  CssBaseline,
  Grid,
  Toolbar,
  Typography,
  IconButton,
  Button,
} from "@material-ui/core";
import CandleChart from "./components/CandleChart";
import LineChart from "./components/LineChart";
import ActivityTable from "./components/AccountActivityTab";
import WalletTable from "./components/WalletTable";
import TradeTable from "./components/TradeTable";
import PnLTable from "./components/PnLTable";
import TickerTable from "./components/TickerTable";
import BarChartIcon from '@material-ui/icons/BarChart';
import {ACTIONS, Context } from './store/Store'
import TickerSelect from "./components/TickerSelect";
import OrderForm from "./components/OrderForm";
import OpenOrders from "./components/OpenOrders";
import OpenPositions from "./components/OpenPositions";
import Wallet from "./components/Wallet";
import CustomizedSnackbars from "./components/CustomizedSnackbars";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Leverage from './components/Leverage'
import SnackbarContent from '@material-ui/core/SnackbarContent';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function App() {

  const [state, dispatch] = useContext(Context);

  const useStyles = makeStyles((theme) => {
    return {
      root: {
        backgroundColor: theme.palette.action.disabledBackground,
        flexGrow: 1,
      },
      icon: {
        color: theme.palette.text.secondary
      },
      title: {
        flexGrow: 1,
      },
        }
  });

  const classes = useStyles();

  const candleChartSpecs = [
    { data: "mark", decimals: 4 },
  ]

  const openSnackbar = () => {
    dispatch({ type: ACTIONS.SET_OPEN_SNACKBAR, payload: true })
    dispatch({ type: ACTIONS.SET_SNACKBAR_MESSAGE, payload: "This is a test" })
  }

  return (
    <Fragment>
      <CssBaseline />
      <AppBar className={classes.root} position="static">
        <Toolbar>
          <BarChartIcon className={classes.icon} />
          <Typography variant="h6" noWrap color="textSecondary" className={classes.title}>
            Perpetual Futures Strategy Dev : {process.env.REACT_APP_IS_DEV }
          </Typography>
          <Leverage />
          <Wallet />
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box mt={2}></Box>
          </Grid>
          <Grid item xs={12}>
          <TickerSelect />
          </Grid>
          <Grid item>

          <OrderForm />
          </Grid>
          {candleChartSpecs.map(spec => (
            <CandleChart
              data={spec.data}
              decimals={spec.decimals}
            />
          ))}
          <ActivityTable/>
        </Grid>
        {/* <CustomizedSnackbars /> */}
      </Container>
      <Snackbar
        anchorOrigin={{ 'vertical':"bottom", 'horizontal':"right" }}
        open={state.openSnackbar}
        onClose={()=> {
          dispatch({ type: ACTIONS.SET_OPEN_SNACKBAR, payload: false })}}
        message={state.snackbarMessage}
        key={'bottom' + 'right'}
      >
          <SnackbarContent style={{
            backgroundColor: state.snackbarColor
          }}
          message={<span id="client-snackbar">{state.snackbarMessage}</span>}
        />
      </Snackbar>
    </Fragment >
  );
}
