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
    },
    removeOrder: async (orderId, dishId) => {
      const removeFormData = new FormData();
      removeFormData.append('product_id', dishId);

      await fetch('https://wix.getmeido.com/order/remove', {
        body: removeFormData,
        method: 'POST',
        redirect: 'manual',
      });

      const editRemoveFormData = new FormData();
      editRemoveFormData.append('product_id', dishId);
      editRemoveFormData.append('order_id', orderId);
      await fetch('https://wix.getmeido.com/order/editremove', {
        body: editRemoveFormData,
        method: 'POST',
        redirect: 'manual',
      });
    }
  });

  server.mount(window);

  const client = new PostMessageClient(window.parent);
  client.mount(window);

  window.addEventListener('DOMContentLoaded', () => client.request('parentLoaded'));
  window.addEventListener('beforeunload', () => client.request('parentBeforeUnload'));
}
