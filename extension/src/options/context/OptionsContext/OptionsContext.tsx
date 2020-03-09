import * as React from 'react';
import {browser} from 'webextension-polyfill-ts';
import {DEFAULT_OPTIONS, IOptions} from "../../storage";

interface IOptionsContext {
  options: IOptions;
  setOptions: (options: IOptions) => void;
}

export const OptionsContext = React.createContext<IOptionsContext>({
  options: DEFAULT_OPTIONS,
  setOptions: () => void 0,
});
export const OptionsProvider = ({children}: { children: React.ReactNode }) => {
  const [options, setOptions] = useStorageSync<IOptions>('options', DEFAULT_OPTIONS);
  return (
    <OptionsContext.Provider value={{options: {...DEFAULT_OPTIONS, ...options}, setOptions}}>
      {children}
    </OptionsContext.Provider>
  )
};

function useStorageSync<T>(key: string, defaultValue: T): [T, (newValue: T) => Promise<void>] {
  const [state, setState] = React.useState<T>(defaultValue);


  const getMyState = async () => {
    const items = await browser.storage.sync.get(key);
    return items[key] as T;
  };

  const setMyState = async (value: T) => {
    await browser.storage.sync.set({[key]: value})
      .then(() => setState(value))
  };

  void getMyState().then(value => setState(value));
  const onChanges = async (changes: { [key: string]: { newValue: T } }) => {
    if (changes[key]) {
      setState(changes[key].newValue);
    }
  };

  React.useEffect(() => {
    browser.storage.onChanged.addListener(onChanges);
    return () => browser.storage.onChanged.removeListener(onChanges);
  });

  return [state, setMyState];
}
