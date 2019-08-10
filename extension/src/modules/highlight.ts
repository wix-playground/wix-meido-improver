const NODE_TYPE_TEXT = 3;
const CLASS_NAME = '__HIGHLIGHTED';

export function highlight(elem: HTMLElement | ChildNode, keywords: string[]): boolean {
  let found = false;

  // Sort longer matches first to avoid
  // highlighting keywords within keywords.
  keywords.sort((a, b) => b.length - a.length);

  unionTextNodes(elem);

  Array.from(elem.childNodes).forEach(child => {
    const keywordRegex = RegExp(keywords.map(escapeRegExp).join('|'), 'gi');
    if (child.nodeType !== NODE_TYPE_TEXT) {
      highlight(child, keywords);
    } else if (keywordRegex.test(child.textContent)) {
      const frag = document.createDocumentFragment();
      let lastIdx = 0;
      child.textContent.replace(keywordRegex, (match, idx) => {
        const part = document.createTextNode(child.textContent.slice(lastIdx, idx));
        const highlighted = document.createElement('span');
        highlighted.textContent = match;
        highlighted.className = CLASS_NAME;

        frag.appendChild(part);
        frag.appendChild(highlighted);

        lastIdx = idx + match.length;
        found = true;

        return match;
      });
      const end = document.createTextNode(child.textContent.slice(lastIdx));
      frag.appendChild(end);
      child.parentNode.replaceChild(frag, child);
    }
  });

  return found;
}

export function unHighlight(elem: HTMLElement): void {
  [...elem.querySelectorAll('.' + CLASS_NAME)].forEach(mark => {
    const newTextNode = document.createTextNode(mark.textContent);
    mark.parentNode.insertBefore(newTextNode, mark);
    mark.parentNode.removeChild(mark);
  });
}

function unionTextNodes(elem: HTMLElement | ChildNode): void {
  for (let i = 0; i < elem.childNodes.length; i++) {
    const child = elem.childNodes[i];

    if (child.nodeType !== NODE_TYPE_TEXT) {
      unionTextNodes(child);
    } else {
      if (child.nodeType === NODE_TYPE_TEXT) {
        const next = elem.childNodes[i + 1];
        if (next && next.nodeType === NODE_TYPE_TEXT) {
          child.textContent += next.textContent;
          child.parentNode.removeChild(next);
          unionTextNodes(elem);
          return;
        }
      }
    }
  }
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
