import * as React from 'react';
import {OrdersContextProvider} from "../context/OrdersContext";
import {Root} from "../components/Root";

export const App = () => (
  <OrdersContextProvider>
    <Root/>
  </OrdersContextProvider>
);
