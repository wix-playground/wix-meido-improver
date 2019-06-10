function waitForSelector(selector) {
  return new Promise(resolve => {
    const el = document.querySelector(selector);
    if (el) {
      resolve(el);
    } else {
      setTimeout(() => resolve(waitForSelector(selector)), 100)
    }
  })
}

function waitForEmptySelector(selector) {
  return new Promise(resolve => {
    const el = document.querySelector(selector);
    if (el) {
      setTimeout(() => resolve(waitForEmptySelector(selector)), 100)
    } else {
      resolve(el);
    }
  })
}