const CATEGORIES_LIST_CLASS = '__ITDXER_menu-item__categories';
const CATEGORY_CLASS = '__ITDXER_menu-item__category';

export function addCategoryAll() {
  const categoryTabs = document.querySelector('.suppliers .container .nav.nav-tabs.new-tabs');
  if (categoryTabs) {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.innerText = 'SHOW ALL';
    link.dataset.toggle = "tab";
    link.href = "#category_all";
    link.setAttribute('onclick', "typeof saveTabPosition === 'function' && saveTabPosition('category_all')");
    link.setAttribute('aria-controls', "category_all");
    link.setAttribute('role', "tab");
    li.appendChild(link);

    renderCategoryAll();
    categoryTabs.prepend(li);
  }
}

function renderCategoryAll() {
  const categoryTabLinks = document.querySelectorAll('.suppliers .container .nav.nav-tabs.new-tabs li a');
  const categoryNameByKey = Object.fromEntries([...categoryTabLinks].map(link => [
    link.getAttribute('aria-controls'), link.innerText
  ]));

  const categoryAllPane = document.createElement('div');
  categoryAllPane.id = 'category_all';
  categoryAllPane.className = 'tab-pane';
  categoryAllPane.setAttribute('role', "tabpanel");

  const categoriesTabContent = document.querySelector('.suppliers > .suppliers-content .tab-content');
  const panes = categoriesTabContent.querySelectorAll('.tab-pane');

  const allItems = {};

  [...panes].forEach(pane => {
    const items = [...pane.children].map(node => ({
      contractors: [pane.id],
      id: node.querySelector('.btn.buy').href.split('/').pop(),
      node
    }));

    items.forEach(item => {
      if (allItems[item.id]) {
        allItems[item.id].contractors = [...allItems[item.id].contractors, ...item.contractors];
      } else {
        allItems[item.id] = item;
      }
    })
  });

  Object.values(allItems).forEach(item => {
    const cloned = item.node.cloneNode();
    cloned.innerHTML = item.node.innerHTML;
    const oldBuyButton = item.node.querySelector('.menu-item__info > a.btn.btn-success.buy');
    const clonedBuyButton = cloned.querySelector('.menu-item__info > a.btn.btn-success.buy');
    clonedBuyButton.onclick = event => {
      event.preventDefault();
      oldBuyButton.click();
    };
    const content = cloned.querySelector('.menu-item__content');
    const info = content.querySelector('.menu-item__info');
    const categories = document.createElement('div');
    categories.className = CATEGORIES_LIST_CLASS;
    item.contractors.forEach(contractorKey => {
      const link = document.createElement('a');
      link.innerText = categoryNameByKey[contractorKey];
      link.className = CATEGORY_CLASS;
      link.href = "#";
      link.onclick = () => document.querySelector(`[href="#${contractorKey}"]`).click();
      categories.append(link);
    });
    content.insertBefore(categories, info);
    categoryAllPane.append(cloned);
  });

  categoriesTabContent.prepend(categoryAllPane);
}
