
let products = JSON.parse(localStorage.getItem('products')) || [];
let counts = JSON.parse(localStorage.getItem('counts')) || {};
let currentView = localStorage.getItem('view') || 'edit';

const app = document.getElementById('app');

const categories = ['Essen', 'Trinken', 'Pfand'];

function saveState() {
  localStorage.setItem('products', JSON.stringify(products));
  localStorage.setItem('counts', JSON.stringify(counts));
  localStorage.setItem('view', currentView);
}

function resetOrder() {
  counts = {};
  saveState();
  renderOrder();
}

function renderEdit() {
  currentView = 'edit';
  saveState();
  app.innerHTML = '';

  products.forEach((prod, i) => {
    const nameInput = document.createElement('input');
    nameInput.value = prod.name;
    nameInput.placeholder = 'Produktname';
    nameInput.oninput = () => {
      products[i].name = nameInput.value;
      saveState();
    };

    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.value = prod.price;
    priceInput.placeholder = 'Preis';
    priceInput.oninput = () => {
      products[i].price = parseFloat(priceInput.value) || 0;
      saveState();
    };

    const categorySelect = document.createElement('select');
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      if (prod.category === cat) opt.selected = true;
      categorySelect.append(opt);
    });
    categorySelect.onchange = () => {
      products[i].category = categorySelect.value;
      saveState();
    };

    app.append(nameInput, priceInput, categorySelect);
  });

  const addBtn = document.createElement('button');
  addBtn.textContent = '+ Produkt hinzufügen';
  addBtn.onclick = () => {
    products.push({ name: '', price: 0, category: 'Essen' });
    saveState();
    renderEdit();
  };

  const finishBtn = document.createElement('button');
  finishBtn.textContent = 'Fertig';
  finishBtn.onclick = renderOrder;

  const copyright = document.createElement('div');
  copyright.style.fontSize = '0.8rem';
  copyright.style.opacity = '0.6';
  copyright.style.textAlign = 'center';
  copyright.textContent = 'Geistiges Eigentum Niklas Förster';

  app.append(addBtn, finishBtn, document.createElement('hr'), copyright);
}

function renderOrder() {
  currentView = 'order';
  saveState();
  app.innerHTML = '';

  const topBar = document.createElement('div');
  topBar.style.display = 'flex';
  topBar.style.justifyContent = 'space-between';
  topBar.style.alignItems = 'center';

  const title = document.createElement('h2');
  title.textContent = 'Bestellung';

  const total = document.createElement('h2');
  total.textContent = 'Ergebnis: ' + calcTotal();

  topBar.append(title, total);
  app.append(topBar);

  categories.forEach(cat => {
    const catTitle = document.createElement('h3');
    catTitle.textContent = cat;
    app.append(catTitle);

    const grid = document.createElement('div');
    grid.className = 'tile-grid';

    products.forEach((prod, i) => {
      if (prod.category !== cat) return;

      const box = document.createElement('div');
      box.className = 'tile';
      box.onclick = () => {
        counts[i] = (counts[i] || 0) + 1;
        saveState();
        renderOrder();
      };

      box.innerHTML = `
        <strong>${prod.name}</strong><br>
        ${prod.price} €<br>
        Ausgewählt: ${counts[i] || 0}
      `;

      grid.append(box);
    });

    app.append(grid);
  });

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Bearbeiten';
  editBtn.onclick = renderEdit;

  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Neue Bestellung';
  resetBtn.onclick = resetOrder;

  app.append(editBtn, resetBtn);
}

function calcTotal() {
  return products.reduce((sum, p, i) => {
    return sum + (counts[i] || 0) * p.price;
  }, 0).toFixed(2) + ' €';
}

currentView === 'edit' ? renderEdit() : renderOrder();
