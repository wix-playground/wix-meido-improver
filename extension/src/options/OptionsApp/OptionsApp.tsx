import * as React from 'react';
import {Root} from "../components/Root";
import {OptionsProvider} from "../context/OptionsContext";

export const OptionsApp = () => {
  return (
    <OptionsProvider>
      <Root/>
    </OptionsProvider>
  )
};
