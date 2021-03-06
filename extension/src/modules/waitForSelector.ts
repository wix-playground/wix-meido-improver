export function waitForSelector(selector: string): Promise<HTMLElement> {
  return new Promise(resolve => {
    const el: HTMLElement | null = document.querySelector(selector);
    if (el) {
      resolve(el);
    } else {
      setTimeout(() => resolve(waitForSelector(selector)), 100);
    }
  });
}

export function waitForEmptySelector(selector: string): Promise<HTMLElement> {
  return new Promise(resolve => {
    const el: HTMLElement | null = document.querySelector(selector);
    if (el) {
      setTimeout(() => resolve(waitForEmptySelector(selector)), 100);
    } else {
      resolve();
    }
  });
}
