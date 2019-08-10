function randomStr() {
  return (
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15)
  );
}

export class PostMessageClient {
  constructor(targetWindow) {
    this.targetWindow = targetWindow;
    this.dispatches = new Map();
    this.handleMessage = this.handleMessage.bind(this);
  }

  handleMessage(event) {
    if (!event.data || typeof event.data.id === 'undefined' || !event.data.jsonrpc || 'method' in event.data) {
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

  mount(window) {
    window.addEventListener('message', this.handleMessage);
  }

  unmount(window) {
    window.removeEventListener('message', this.handleMessage);
  }

  _dispatch(method, id, ...params) {
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

  request(method, ...params) {
    return this._dispatch(method, randomStr(), ...params);
  }
}

export class PostMessageServer {
  constructor(handlers) {
    this.handlers = handlers;
    this.handleMessage = this.handleMessage.bind(this);
  }

  mount(window) {
    window.addEventListener('message', this.handleMessage);
  }

  unmount(window) {
    window.removeEventListener('message', this.handleMessage);
  }

  callHandler(message) {
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

  handleMessage(event) {
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
