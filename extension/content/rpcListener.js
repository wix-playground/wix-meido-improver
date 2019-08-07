function inIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

if (inIframe()) {
  const server = new PostMessageServer({
    isLoggedIn: () => !window.location.href.includes('wix.getmeido.com/auth'),
    openContractor: contractorName => {
      const all = document.querySelectorAll('.restaurants__nav > li > a');
      const found = [...all].find(link => link.innerText.trim() === contractorName.trim());
      if (!found) {
        return Promise.reject(new Error(`Contractor "${contractorName}" not found`));
      }
      found.click();
    },
    clickOneClickBuy: dishId => {
      const button = document.querySelector(`.__ITDXER_oneClickBuy[data-dish-id="${dishId}"]`);
      if (!button) {
        return Promise.reject(new Error(`Dish with id "${dishId}" not found`));
      }
      button.click();
    },
    confirmOrder: dateStr => {
      const input = document.querySelector(`input[value="${dateStr}"]`);
      if (!input) {
        return Promise.reject(new Error(`Can't make an order for ${dateStr}. Probably you already made an order, or it's a holiday`));
      }
      input.nextSibling.nextSibling.click();
    }
  });

  server.mount(window);


  const client = new PostMessageClient(window.parent);
  client.mount(window);

  window.addEventListener('load', () => client.request('parentLoaded'));
  window.addEventListener('beforeunload', () => client.request('parentBeforeUnload'));
}
