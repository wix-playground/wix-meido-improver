import * as React from 'react';


interface IMessageContext {
  errorMessage: string | null;
  statusMessage: string | null;
  showStatus: (status: string | null) => void;
  showError: (error: string | {message: string}) => void;
  hideError: () => void;
}

export const MessageContext = React.createContext<IMessageContext>({
  errorMessage: null,
  statusMessage: null,
  showStatus: () => void 0,
  showError: () => void 0,
  hideError: () => void 0,
});

export function MessageContextProvider({children}: { children: React.ReactNode }) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  return (
    <MessageContext.Provider value={{
      errorMessage,
      statusMessage,
      showError: error => setErrorMessage(typeof error === "string" ? error : error && error.message),
      hideError: () => setErrorMessage(null),
      showStatus: newStatus => setStatusMessage(newStatus),
    }}>
      {children}
    </MessageContext.Provider>
  )
}
