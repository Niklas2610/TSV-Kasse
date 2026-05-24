let products = JSON.parse(localStorage.getItem('products')) || [];
let counts = JSON.parse(localStorage.getItem('counts')) || {};
let currentView = localStorage.getItem('view') || 'edit';
let receivedAmount = '';

const app = document.getElementById('app');

const categories = ['Essen', 'Trinken', 'Pfand'];

function saveState() {
  localStorage.setItem('products', JSON.stringify(products));
  localStorage.setItem('counts', JSON.stringify(counts));
  localStorage.setItem('view', currentView);
}

function resetOrder() {
  counts = {};
  receivedAmount = '';
  saveState();
  renderOrder();
}

function getTotalValue() {
  return products.reduce((sum, p, i) => {
    return sum + (counts[i] || 0) * p.price;
  }, 0);
}

function formatMoney(value) {
  return value.toFixed(2).replace('.', ',') + ' €';
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
    priceInput.step = '0.01';
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

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️ Löschen'; deleteBtn.style.backgroundColor = '#b00020'; deleteBtn.style.color = '#fff';
    deleteBtn.onclick = () => {
      products.splice(i, 1);
      delete counts[i];
      saveState();
      renderEdit();
    };

    app.append(nameInput, priceInput, categorySelect, deleteBtn);
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

function createTopBar() {
  const topBar = document.createElement('div');
  topBar.className = 'top-bar';

  const title = document.createElement('h2');
  title.textContent = currentView === 'checkout' ? 'Bezahlung' : 'Bestellung';

  const total = document.createElement('h2');
  total.className = 'total-display';
  total.textContent = 'Gesamt: ' + calcTotal();

  topBar.append(title, total);
  return topBar;
}

function renderOrder() {
  currentView = 'order';
  saveState();
  app.innerHTML = '';
  app.append(createTopBar());

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
      if (prod.category === 'Essen') box.style.backgroundColor = '#2e7d32';
      else if (prod.category === 'Trinken') box.style.backgroundColor = '#f5f5f5';
      else box.style.backgroundColor = '#1e1e1e';

      box.style.color = prod.category === 'Trinken' ? '#000' : '#fff';
      box.onclick = () => {
        counts[i] = (counts[i] || 0) + 1;
        saveState();
        renderOrder();
      };

      box.innerHTML = `
        <strong>${prod.name}</strong><br>
        ${formatMoney(prod.price)}<br>
        Ausgewählt: ${counts[i] || 0}
      `;

      grid.append(box);
    });

    app.append(grid);
  });

  const doneBtn = document.createElement('button');
  doneBtn.textContent = 'Fertig / Bezahlen';
  doneBtn.className = 'primary-button';
  doneBtn.onclick = renderCheckout;

  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Neue Bestellung'; resetBtn.style.backgroundColor = '#b00020'; resetBtn.style.color = '#fff';
  resetBtn.onclick = resetOrder;

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Bearbeiten';
  editBtn.onclick = renderEdit;

  app.append(doneBtn, resetBtn, editBtn);
}

function renderCheckout() {
  currentView = 'checkout';
  saveState();
  app.innerHTML = '';
  app.append(createTopBar());

  const totalValue = getTotalValue();

  const checkoutBox = document.createElement('div');
  checkoutBox.className = 'checkout-box';

  const label = document.createElement('label');
  label.textContent = 'Gegebenen Betrag eingeben:';
  label.htmlFor = 'received-amount';

  const receivedInput = document.createElement('input');
  receivedInput.id = 'received-amount';
  receivedInput.type = 'number';
  receivedInput.step = '0.01';
  receivedInput.min = '0';
  receivedInput.inputMode = 'decimal';
  receivedInput.placeholder = 'z. B. 20,00';
  receivedInput.value = receivedAmount;

  const changeText = document.createElement('div');
  changeText.className = 'change-display';

  function updateChange() {
    receivedAmount = receivedInput.value;
    const received = parseFloat(receivedInput.value.replace(',', '.'));

    if (receivedInput.value === '') {
      changeText.textContent = 'Passend bekommen? Dann einfach unten „Neue Bestellung“ drücken.';
      changeText.className = 'change-display muted';
      return;
    }

    if (Number.isNaN(received)) {
      changeText.textContent = 'Bitte einen gültigen Betrag eingeben.';
      changeText.className = 'change-display warning';
      return;
    }

    const change = received - totalValue;
    if (change < 0) {
      changeText.textContent = 'Es fehlen noch: ' + formatMoney(Math.abs(change));
      changeText.className = 'change-display warning';
    } else {
      changeText.textContent = 'Wechselgeld: ' + formatMoney(change);
      changeText.className = 'change-display success';
    }
  }

  receivedInput.oninput = updateChange;
  updateChange();

  const newOrderBtn = document.createElement('button');
  newOrderBtn.textContent = 'Neue Bestellung';
  newOrderBtn.className = 'primary-button';
  newOrderBtn.onclick = resetOrder;

  const backBtn = document.createElement('button');
  backBtn.textContent = 'Zurück zur Bestellung';
  backBtn.onclick = renderOrder;

  checkoutBox.append(label, receivedInput, changeText, newOrderBtn, backBtn);
  app.append(checkoutBox);
}

function calcTotal() {
  return formatMoney(getTotalValue());
}

if (currentView === 'edit') renderEdit();
else if (currentView === 'checkout') renderCheckout();
else renderOrder();
