import * as React from 'react';
import {browser} from 'webextension-polyfill-ts';
import {DEFAULT_OPTIONS, IOptions} from "../../storage";

interface IOptionsContext {
  options: IOptions;
  setOptions: (options: IOptions) => Promise<void>;
  resetOptions: () => Promise<void>;
}

export const OptionsContext = React.createContext<IOptionsContext>({
  options: DEFAULT_OPTIONS,
  setOptions: () => Promise.resolve(undefined),
  resetOptions: () => Promise.resolve(undefined),
});

export const OptionsProvider = ({children}: { children: React.ReactNode }) => {
  const [options, setOptions, resetOptions] = useStorageSync<IOptions>('options', DEFAULT_OPTIONS);
  return (
    <OptionsContext.Provider value={{
      options: {...DEFAULT_OPTIONS, ...options},
      setOptions,
      resetOptions,
    }}>
      {children}
    </OptionsContext.Provider>
  )
};

function useStorageSync<Value>(key: string, defaultValue: Value): [Value, (value: Value) => Promise<void>, () => Promise<void>] {
  const [value, setValue] = React.useState<Value>(defaultValue);
  const getStorageValue = (): Promise<Value> => browser.storage.sync.get(key).then(items => items[key]);
  const setStorageValue = (value: Value): Promise<void> => browser.storage.sync.set({[key]: value}).then(() => setValue(value));
  const resetValue = () => setStorageValue(defaultValue);

  React.useEffect(() => {
    const onStorageChanges = async (changes: { [key: string]: { newValue: Value } }) => {
      if (changes[key]) {
        setValue(changes[key].newValue);
      }
    };

    browser.storage.onChanged.addListener(onStorageChanges);
    return () => browser.storage.onChanged.removeListener(onStorageChanges);
  }, []);

  React.useEffect(() => {
    void getStorageValue().then(value => setValue(value));
  }, []);

  return [value, setStorageValue, resetValue];
}
