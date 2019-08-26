function randomStr(): string {
  return (
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15)
  );
}

interface IWindow {
  postMessage: (message: any, origin: string) => void;
  addEventListener: (eventName: string, handler: (event: IRpcEvent) => void) => void;
  removeEventListener: (eventName: string, handler: (event: IRpcEvent) => void) => void;
}

interface IRpcEvent {
  data: {
    id: string;
    jsonrpc: string;
    method: string;
    params?: any[];
    error?: any;
    result?: any;
  };
  source: IWindow;
}

export class PostMessageClient {
  private readonly targetWindow: IWindow;
  private dispatches: Map<string, { resolve: (...props: any[]) => void; reject: (...props: any[]) => void }>;

  constructor(targetWindow: IWindow) {
    this.targetWindow = targetWindow;
    this.dispatches = new Map();
    this.handleMessage = this.handleMessage.bind(this);
  }

  handleMessage(event: IRpcEvent) {
    if (
      !event.data ||
      typeof event.data.id === 'undefined' ||
      !event.data.jsonrpc ||
      typeof event.data.method !== 'undefined'
    ) {
      return;
    }

    const dispatch = this.dispatches.get(event.data.id);
    this.dispatches.delete(event.data.id);

    if (dispatch) {
      if (event.data.error) {
        dispatch.reject(event.data.error);
      } else {
        dispatch.resolve(event.data.result);
      }
    }
  }

  mount(window: IWindow) {
    window.addEventListener('message', this.handleMessage);
  }

  unmount(window: IWindow) {
    window.removeEventListener('message', this.handleMessage);
  }

  _dispatch(method: string, id: string, ...params: any[]) {
    return new Promise((resolve, reject) => {
      this.dispatches.set(id, { resolve, reject });

      try {
        const message = {
          jsonrpc: '2.0',
          id,
          method,
          params,
        };
        this.targetWindow.postMessage(message, '*');
      } catch (error) {
        this.dispatches.delete(id);
        reject(error);
      }
    });
  }

  request(method: string, ...params: any[]) {
    return this._dispatch(method, randomStr(), ...params);
  }
}

interface IHandlers {
  [handler: string]: (...args: any[]) => any;
}

export class PostMessageServer {
  private readonly handlers: IHandlers;

  constructor(handlers: IHandlers) {
    this.handlers = handlers;
    this.handleMessage = this.handleMessage.bind(this);
  }

  mount(window: IWindow) {
    window.addEventListener('message', this.handleMessage);
  }

  unmount(window: IWindow) {
    window.removeEventListener('message', this.handleMessage);
  }

  callHandler(message: IRpcEvent) {
    if (
      message.data &&
      message.data.method &&
      message.data.jsonrpc &&
      !('error' in message.data || 'result' in message.data)
    ) {
      const handler = this.handlers[message.data.method];
      if (!handler) {
        throw new Error(`No handler found for method '${message.data.method}'`);
      }

      try {
        return Promise.resolve(handler.apply(null, message.data.params || []));
      } catch (error) {
        return Promise.reject(error);
      }
    }
  }

  handleMessage(event: IRpcEvent) {
    const resultPromise = this.callHandler(event);
    if (!resultPromise) {
      return;
    }

    resultPromise
      .then(result => ({ result: JSON.parse(JSON.stringify(result || null)) }))
      .catch(error => ({
        error: {
          code: -32000,
          message: error && error.message,
          data: JSON.parse(JSON.stringify(error || null)),
        },
      }))
      .then(response => ({
        jsonrpc: '2.0',
        id: event.data.id,
        ...response,
      }))
      .then(response => event.source.postMessage(response, '*'));
  }
}
