export function escapeHtml(text: string): string {
  const elem = document.createElement('div');
  elem.innerText = text;
  return elem.innerHTML;
}

export function unescapeHtml(html: string): string {
  const elem = document.createElement('div');
  elem.innerHTML = html;
  return elem.innerText;
}
