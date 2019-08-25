import * as React from 'react';


interface IMessageContext {
  errorMessage: string | null;
  showError: (error: string | {message: string}) => void;
  hideError: () => void;
}

export const MessageContext = React.createContext<IMessageContext>({
  errorMessage: null,
  showError: () => void 0,
  hideError: () => void 0,
});

export function MessageContextProvider({children}: { children: React.ReactNode }) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  return (
    <MessageContext.Provider value={{
      errorMessage,
      showError: (error: string | {message: string}) => setErrorMessage(typeof error === "string" ? error : error && error.message),
      hideError: () => setErrorMessage(null)
    }}>
      {children}
    </MessageContext.Provider>
  )
}
