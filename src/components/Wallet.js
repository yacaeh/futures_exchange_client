import { useState, useEffect,useContext } from 'react';
import { ACTIONS, Context } from "../store/Store";
import { Typography } from '@material-ui/core';

// Write a wallet component that displays the user's balance and allows them to deposit and withdraw funds.
// The wallet component should have the following features:
// - A balance display that shows the user's balance in USD and BTC
// - A deposit button that allows the user to deposit funds into their account

var nf = new Intl.NumberFormat("en", { minimumFractionDigits: 2 });

const Wallet = () => {
    
    const [state, dispatch] = useContext(Context);
    const [balance, setBalance] = useState(0);
    const [deposit, setDeposit] = useState(0);
    const [withdraw, setWithdraw] = useState(0);
    const [btc, setBtc] = useState(0);
    const [usd, setUsd] = useState(0);

    const handleDeposit = (e) => {
        e.preventDefault();
        setBalance(balance + deposit);
        setDeposit(0);
    }

    const handleWithdraw = (e) => {
        e.preventDefault();
        setBalance(balance - withdraw);
        setWithdraw(0);
    }

    async function getWallet() {
        const response = await fetch(`http://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_PORT}/wallets`);
        const data = await response.json();
        setUsd(data.accounts?.flex?.portfolioValue);
    }

    useEffect(() => {
        getWallet();
    }
    , [usd]);
    
    return (
        <Typography variant="subtitle1" color="textSecondary" >TOTAL EQUITY {nf.format(usd)} USD</Typography>
    )
};

export default Wallet;