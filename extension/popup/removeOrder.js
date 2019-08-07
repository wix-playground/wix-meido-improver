async function tryRemoveOrder(orderId, dishId) {
  await callInQueue(async () => {
    if (!await isLoggedIn()) {
      throw new Error('Open Meido to login');
    }

    await removeOrder(orderId, dishId);
    await refreshOrderedDishesCache();
  });
}

const removingButtons = {};

function isRemovingButton(orderId) {
  return !!removingButtons[orderId];
}

function startRemovingButton(orderId, button) {
  removingButtons[orderId] = true;
  button.classList.add('spinning');
  button.disabled = true;
}

function stopRemovingButton(orderId, button) {
  delete removingButtons[orderId];
  button.classList.remove('spinning');
  button.disabled = false;
}
