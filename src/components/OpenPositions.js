import React, { useEffect, useRef, useState, useContext } from "react";
import { ACTIONS, Context } from "../store/Store";
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import FilterListIcon from '@material-ui/icons/FilterList';
import DeleteIcon from '@material-ui/icons/Delete';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';
import moment from 'moment';
import AssignmentIcon from '@material-ui/icons/Assignment';


  // "side":"short","symbol":"pf_xbtusd","price":27642.0,"fillTime":"2023-05-08T23:10:42.446Z","size":0.0002,"unrealizedFunding":3.934434050501591e-06,"pnlCurrency":"USD"}
function createData(symbol, side, price, fillTime, size, unrealizedFunding, pnlCurrency, action) {
  return { symbol, side, price, fillTime, size, unrealizedFunding, pnlCurrency, action };
}


// const rows = [
//   createData('Cupcake', 305, 3.7, 67, 4.3, false, 1),
//   createData('Donut', 452, 25.0, 51, 4.9, false,1 ),
// ];
const cancelAllOrderEndPoints = `cancelAllOrder`;
const iconBaseUrl = `https://futures.kraken.com/trade/assets/images/crypto-icons/color/`

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}
const headCells = [
  { id: 'Market', numeric: false, disablePadding: true, label: 'MARKET' },
  { id: 'size', numeric: false, disablePadding: false, label: 'SIZE' },
  { id: 'entrymarket', numeric: false, disablePadding: false, label: 'ENTRY / MARKET' },
  { id: 'price', numeric: true, disablePadding: false, label: 'EST.LIQ.PRICE' },
  { id: 'Leverage', numeric: true, disablePadding: false, label: 'Effective LVG' },
  { id: 'immm', numeric: true, disablePadding: false, label: 'IM / MM' },
  { id: 'pnlroe', numeric: true, disablePadding: false, label: 'PNL / ROE' },

  // { id: 'reduceOnly', numeric: false, disablePadding: false, label: 'REDUCE ONLY' },
];

  async function cancelAllOrders() {
    console.log("cancelAllOrders")

    const config = {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      }
    };
    const url = `http://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_PORT}/${cancelAllOrderEndPoints}`;
    // const response = await fetch(url, config);
    // console.log(await response.json());
  }

  async function cancelOrder(id) {
    console.log("cancel Orders"+id)

    const config = {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      }
    };
    const url = `http://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_PORT}/cancelOrder/${id}`;
    const response = await fetch(url, config);
    console.log(await response.json());
  }

  async function editOrder(order) {
    const config = {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    };
    const url = `http://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_PORT}/editOrder/${order.order_id}`;
    const response = await fetch(url, config);
    console.log(await response.json());
  }


function EnhancedTableHead(props) {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
        </TableCell>
        {headCells.map((headCell) => ( 
            headCell.id != 'actions' ?
          <TableCell
            key={headCell.id}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            align='center'
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            align='center'
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
          :
        <TableCell
          key={headCell.id}
          padding={headCell.disablePadding ? 'none' : 'normal'}
          onClick={onSelectAllClick}
            align='center'
        >
            <div style={{display: 'flex'}}>
            <HighlightOffIcon fontSize="small" style={{ color: '#E2434D', margin:'5px' }}/>
            <Typography style={{ color: '#E2434D' }}>{headCell.label} </Typography></div>
        </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: '1 1 100%',
  },
}));


const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { numSelected } = props;

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {/* {numSelected > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : ( */}
        {/* <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
          Open Positions
        </Typography> */}
      {/* )} */}

      {/* {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton aria-label="filter list">
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )} */}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

export default function OpenPositions() {
  const classes = useStyles();
  const [state, dispatch] = useContext(Context);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("lastUpdateTime");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openPositions, setOpenPositions] = useState([]);
  const [rows, setRows] = useState([]);
  const endPoint = `openPositions`;
  const [loadingData, setLoadingData] = useState(true);
  const [refreshData, setRefreshData] = useState(false);

  const apiUrl = `http://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_PORT}/${endPoint}`;
  
  async function getOpenPositions() {
    // Profit/Loss (RoE) = Price Difference X (Contract Notional Value / Exit Price) 
    // ROE = (PL/Initial Margin) X 100
    // PL = (Exit Price - Entry Price) X Contract Notional Value

    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log("getOpenPositions",data.openPositions);
    setOpenPositions(data.openPositions);
    setRows(data.openPositions); 
    setLoadingData(false);
    dispatch({ type: ACTIONS.SET_OPEN_POSITION_AMOUNT, payload: data.openPositions?.length })
}

  async function updateOpenPositionsFromSocket() {
    if (state.openPositionsStream?.positions) {
    setRows( existingRows => {
      return existingRows.map( row => {
        const found = state.openPositionsStream?.positions.find( p => p?.instrument.toLowerCase() === row?.symbol.toLowerCase() );
        if (found) {
          return { ...row, 
            pnl : found.pnl, effective_leverage: found.effective_leverage, 
            entry_price: found.entry_price, index_price: found.index_price, 
            mark_price:found.mark_price,return_on_equity : found.return_on_equity,
            initial_margin : found.initial_margin, maintenance_margin : found.maintenance_margin,
            liquidation_threshold : found.liquidation_threshold,
            unrealized_funding:found.unrealized_funding
          };
        }
        return row;
      });
    });
}
  }

useEffect(() => {

  //   {
  //     'order_id': '2ce038ae-c144-4de7-a0f1-82f7f4fca864',
  //     'symbol': 'pi_ethusd',
  //     'side': 'buy',
  //     'orderType': 'lmt',
  //     'price': 1200,
  //     'unfilledSize': 100,
  //     'receivedTime': '2023-04-07T15:18:04.699Z',
  //     'status': 'untouched',
  //     'filledSize': 0,
  //     'reduceOnly': False,
  //     'lastUpdateTime': '2023-04-07T15:18:04.699Z'
  // }

  getOpenPositions();

  // let ws = new WebSocket(`ws://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_PORT}/ws/${endPoint}`)
  // ws.onmessage = (event) => {
  //     setLastCandle(JSON.parse(event.data.candles))
  // };
  // return () => ws.close()
}, [ refreshData]);


useEffect(() => {
  updateOpenPositionsFromSocket();
}, [state.openPositionsStream]);
  // Dialog
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    console.log('property')
    console.log(property)
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };


  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const handleMarketOrder = (id) => {
    console.log('Market order')
    cancelOrder(id)
    setRefreshData(!refreshData);
}
  const handleLimitOrder = (id) => {
    console.log('Limit order')
    // editOrder(id)
    setRefreshData(!refreshData);
  }
  const handleOrderDetail = (id) => {
    console.log('Order Detail')
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        {/* <EnhancedTableToolbar numSelected={selected.length} /> */}
        {rows.length > 0 && (
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleClickOpen}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
            {/* {emptyRows > 0 && ( <TableRow><TableCell colSpan={6}>no records found</TableCell></TableRow> )} */}
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  // const isItemSelected = isSelected(row.name);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      // onClick={(event) => handleClick(event, row.name)}
                      role="checkbox"
                    //   aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.name}
                    //   selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        {/* <Checkbox
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                        /> */}
                        {/*  symbol, side, price, fillTime, size, unrealizedFunding, pnlCurrency */}
                      </TableCell>
                      <TableCell align="center">
                      <img src={`${iconBaseUrl}/${row.symbol?.split('_')[1].slice(0,-3)}.svg`} alt={row.symbol?.split('_')[1].slice(0,-3)} width={24} height={24} />
                        {row.symbol}</TableCell>
                        <TableCell align="center"><Typography style={{
                              color: row.side == "short" ? "#EE3333" : "#3C9B4A",
                            }}>{row.side}</Typography> {row.size}</TableCell>
                      <TableCell align="center">
                      <Typography>{parseFloat(row.entry_price).toFixed(2)}</Typography>
                        <Typography style={{color:'#999999'}}>USD</Typography>
                        <Typography>{parseFloat(row.mark_price).toFixed(2)}</Typography>
                        <Typography style={{color:'#999999'}}>USD</Typography></TableCell>                        
                        <TableCell align="center">
                      <Typography>{parseFloat(row.liquidation_threshold).toFixed(2)}USD</Typography>
                        </TableCell>

                      <TableCell align="center">
                      <Typography>{parseFloat(row.effective_leverage).toFixed(2)}X</Typography>
                        </TableCell>
                        <TableCell align="center">
                      <Typography>{parseFloat(row.initial_margin).toFixed(2)}</Typography>
                        <Typography style={{color:'#999999'}}>USD</Typography>
                        <Typography>{parseFloat(row.maintenance_margin).toFixed(2)}</Typography>
                        <Typography style={{color:'#999999'}}>USD</Typography></TableCell>                        

                      <TableCell component="th" id={labelId} scope="row" padding="none">
                      <Typography style={{color: row.pnl <0 ? "#EE3333" : "#3C9B4A"}}> {parseFloat(row.pnl).toFixed(2)} USD</Typography>
                      <Typography style={{color: row.return_on_equity <0 ? "#EE3333" : "#3C9B4A"}}>{parseFloat(row.return_on_equity).toFixed(2)}%</Typography>
                      </TableCell>
                      <TableCell align="center">
                      <Button onClick={() => {handleOrderDetail(row)}}>
                        <AssignmentIcon />
                      </Button>
                        <Button onClick={()=> {handleLimitOrder(row)}}>{'Limit'}</Button><Button style={{color:'#EE3333'}} onClick={()=> {handleMarketOrder(row.order_id)}}>{'Market'}</Button></TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>)}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Order Cancellation"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          <Typography gutterBottom>
            Are you sure?</Typography>
            <Typography gutterBottom></Typography>
            <Typography gutterBottom>This will cancel all of your orders and triggers for all markets.</Typography>
            Are you sure this is what you want to do?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelAllOrders} style={{backgroundColor:"#3C9B4A"}}>
            Yes
          </Button>
          <Button onClick={handleClose} style={{backgroundColor:"#E2434D"}}>
            No
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}
