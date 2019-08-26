const CATEGORIES_LIST_CLASS = '__ITDXER_menu-item__categories';
const CATEGORY_CLASS = '__ITDXER_menu-item__category';

export function addCategoryAll(): void {
  const categoryTabs = document.querySelector('.suppliers .container .nav.nav-tabs.new-tabs');
  if (categoryTabs) {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.innerText = 'SHOW ALL';
    link.dataset.toggle = 'tab';
    link.href = '#category_all';
    link.setAttribute('onclick', "typeof saveTabPosition === 'function' && saveTabPosition('category_all')");
    link.setAttribute('aria-controls', 'category_all');
    link.setAttribute('role', 'tab');
    li.appendChild(link);

    renderCategoryAll();
    categoryTabs.prepend(li);
  }
}

interface IItem {
  contractors: string[];
  dishId: string;
  node: Element;
}

function renderCategoryAll() {
  const categoryTabLinks = document.querySelectorAll('.suppliers .container .nav.nav-tabs.new-tabs li a');
  const categoryNameByKey = Object.fromEntries(
    [...categoryTabLinks].map((link: HTMLAnchorElement) => [link.getAttribute('aria-controls'), link.innerText])
  );

  const categoryAllPane = document.createElement('div');
  categoryAllPane.id = 'category_all';
  categoryAllPane.className = 'tab-pane';
  categoryAllPane.setAttribute('role', 'tabpanel');

  const categoriesTabContent = document.querySelector('.suppliers > .suppliers-content .tab-content');
  if (categoriesTabContent === null) {
    return;
  }
  const panes = categoriesTabContent.querySelectorAll('.tab-pane');

  const allItems: { [key: string]: IItem } = {};

  [...panes].forEach(pane => {
    const items: IItem[] = [...pane.children].map(node => ({
      contractors: [pane.id],
      dishId: (<HTMLAnchorElement>node.querySelector('.btn.buy')).href.split('/').pop() || '',
      node,
    }));

    items.forEach(item => {
      if (typeof item.dishId === 'undefined') {
        return;
      }
      if (allItems[item.dishId]) {
        allItems[item.dishId].contractors = [...allItems[item.dishId].contractors, ...item.contractors];
      } else {
        allItems[item.dishId] = item;
      }
    });
  });

  Object.values(allItems).forEach((item: { node: Element; contractors: string[] }) => {
    const cloned = <HTMLElement>item.node.cloneNode();
    cloned.innerHTML = item.node.innerHTML;
    const oldBuyButton = <HTMLAnchorElement>item.node.querySelector('.menu-item__info > a.btn.btn-success.buy');
    const clonedBuyButton = <HTMLAnchorElement>cloned.querySelector('.menu-item__info > a.btn.btn-success.buy');
    clonedBuyButton.onclick = event => {
      event.preventDefault();
      oldBuyButton.click();
    };
    const content = cloned.querySelector('.menu-item__content');
    if (!content) {
      return;
    }
    const info = content.querySelector('.menu-item__info');
    const categories = document.createElement('div');
    categories.className = CATEGORIES_LIST_CLASS;
    item.contractors.forEach(contractorKey => {
      const link = document.createElement('a');
      link.innerText = categoryNameByKey[contractorKey];
      link.className = CATEGORY_CLASS;
      link.href = '#';
      link.onclick = () => (<HTMLAnchorElement>document.querySelector(`[href="#${contractorKey}"]`)).click();
      categories.append(link);
    });
    content.insertBefore(categories, info);
    categoryAllPane.append(cloned);
  });

  categoriesTabContent.prepend(categoryAllPane);
}
