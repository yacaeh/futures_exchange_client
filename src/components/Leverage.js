import { useState, useEffect,useContext } from 'react';
import { ACTIONS, Context } from "../store/Store";
import { Typography } from '@material-ui/core';
import WebSocketService from './service/WebSocketService';
import Slider from '@material-ui/core/Slider';
import Button from '@material-ui/core/Button';

// import  getWebSocketSignature  from './utils/getWebSocketSignature';
// Write a wallet component that displays the user's balance and allows them to deposit and withdraw funds.
// The wallet component should have the following features:
// - A balance display that shows the user's balance in USD and BTC
// - A deposit button that allows the user to deposit funds into their account

const Leverage = () => {
    
    const [state, dispatch] = useContext(Context);
    const [leverageType, setLeverageType] = useState('isolated');
    const [leverageAmount, setLeverageAmount] = useState(1);

    async function getLeverage() {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/getLeverage`);
        const data = await response.json();
        const currentLeverage = data.leveragePreferences.filter( leverage => leverage.symbol === state.ticker);
        if (currentLeverage.length === 0) {
            setLeverageAmount(0);
            setLeverageType('cross')
        }
        else {
            console.log("CurrentLeverage", currentLeverage[0].maxLeverage);
            setLeverageType('isolated');
            setLeverageAmount(currentLeverage[0].maxLeverage);
        }            
    }

    const openSnackbar = (message, color = '#43a047') => {
        dispatch({ type: ACTIONS.SET_OPEN_SNACKBAR, payload: true })
        dispatch({ type: ACTIONS.SET_SNACKBAR_MESSAGE, payload: message })
        dispatch({ type: ACTIONS.SET_SNACKBAR_COLOR, payload: color }) //  '#43a047' #E2434D
      }
    
    async function setLeverage(amount) {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/setLeverage${state.ticker}/${amount}`);
        const data = await response.json();
        console.log(data);
        getLeverage();
    }


    useEffect(() => {
        getLeverage();
    }, [leverageAmount, leverageType]);

    return (
        <Button onClick={()=> openSnackbar("Update Leverage!")}>
        <Typography variant="subtitle1" color="textSecondary" >{leverageType.toUpperCase()}</Typography>
        {(leverageType === 'isolated') &&  
        (<Typography variant="body3" color="primary" > x {leverageAmount}</Typography>)}
        </Button>
    )
};

export default Leverage;