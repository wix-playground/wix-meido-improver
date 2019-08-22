import * as React from 'react';
import {Order} from "../Order";
import {Header} from "../Header";
import {Footer} from "../Footer";

export const Root = () => {
  return (
    <React.Fragment>
      <Header/>

      <div id="error"></div>
      <div id="warning"></div>

      <Order day={'monday'}/>
      <Order day={'tuesday'}/>
      <Order day={'wednesday'}/>
      <Order day={'thursday'}/>
      <Order day={'friday'}/>

      <Footer/>
    </React.Fragment>
  )
};
