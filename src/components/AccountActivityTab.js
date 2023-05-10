import { useContext, useMemo, useState } from "react";
import { makeStyles} from "@material-ui/core/styles";
import { Badge } from '@material-ui/core';

import Typography from '@material-ui/core/Typography';

import { TradeButton, TradeAction } from "./TradeAction";
import { ACTIONS, Context } from '../store/Store';
import Tab from "@material-ui/core/Tab";
import TabContext from "@material-ui/lab/TabContext";
import TabList from "@material-ui/lab/TabList";
import TabPanel from "@material-ui/lab/TabPanel";
import OpenOrders from "./OpenOrders";
import OpenPositions from "./OpenPositions";

export default function ActivityTable() {

  const [state, dispatch] = useContext(Context);
  const [selectedTab, setTab] = useState("1");

  const onTickerClick = (ticker) => {
    dispatch({ type: ACTIONS.SET_TICKER, payload: ticker });
  };
  const handleTab = (event, newValue) => {
    setTab(newValue);
    var type = "";
    if (newValue == "1") type = "Open Positions";
    else if (newValue == "2") type = "Open Orders";
    else if (newValue == "3") type = "Trigger Orders";
    else if (newValue == "3") type = "Filled Orders";
  };

    return (
      <TabContext value={selectedTab}>
        <TabList onChange={handleTab} aria-label="Activity Tabs">
        
          <Tab label={<Badge badgeContent={1} max={99} color="primary" >Open Positions</Badge>} value="1" />
          <Tab label={<Badge badgeContent={1} max={99} color="primary" >Open Orders</Badge>}  value="2" />
          <Tab label="Trigger Orders" value="3" />
          <Tab label="Filled Orders" value="4" />
        </TabList>
        <TabPanel value="1">
          <OpenPositions />
        </TabPanel>
        <TabPanel value="2">
          <OpenOrders />
        </TabPanel>
        <TabPanel value="3">
        </TabPanel>
        <TabPanel value="4">
        </TabPanel>
      </TabContext>);
  }