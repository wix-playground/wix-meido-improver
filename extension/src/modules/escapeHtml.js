export function escapeHtml(text) {
  const elem = document.createElement('div');
  elem.innerText = text;
  return elem.innerHTML;
}

export function unescapeHtml(html) {
  const elem = document.createElement('div');
  elem.innerHTML = html;
  return elem.innerText;
}
