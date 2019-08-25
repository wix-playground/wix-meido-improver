import * as React from 'react';
import {OrdersContextProvider} from "../context/OrdersContext";
import {Root} from "../components/Root";
import {LoadingContextProvider} from "../context/LoadingContext";
import {RpcContextProvider} from "../context/RpcContext";
import {MessageContextProvider} from "../context/MessagesContext";
import {IntlProvider} from 'react-intl'
import './App.module.scss';

export const App = () => (
  <MessageContextProvider>
    <LoadingContextProvider>
      <RpcContextProvider>
        <OrdersContextProvider>
          <IntlProvider locale={'en'}>
          <Root/>
          </IntlProvider>
        </OrdersContextProvider>
      </RpcContextProvider>
    </LoadingContextProvider>
  </MessageContextProvider>
);
