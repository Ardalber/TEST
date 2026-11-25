// Calculette simple : un nombre, une opération, un nombre, puis « = ».
// Les opérations s'enchaînent de gauche à droite, comme une calculette de poche.

const display = document.getElementById('display');
const history = document.getElementById('history');
const SYMBOLS = { '+': '+', '-': '−', '*': '×', '/': '÷' };

let current = '0';      // nombre en cours de saisie (texte)
let previous = null;    // premier nombre de l'opération
let operator = null;    // opération choisie
let fresh = false;      // vrai après un résultat ou un choix d'opération

function format(text) {
  // Affiche la virgule à la française
  return text.replace('.', ',');
}

function render() {
  display.classList.remove('error');
  display.textContent = format(current);
  history.textContent = previous !== null && operator
    ? `${format(String(previous))} ${SYMBOLS[operator]}`
    : '';
  document.querySelectorAll('.key.op').forEach(k =>
    k.classList.toggle('active', k.dataset.op === operator && fresh));
}

function showError(message) {
  current = '0';
  previous = null;
  operator = null;
  fresh = true;
  history.textContent = '';
  display.textContent = message;
  display.classList.add('error');
}

function round(n) {
  // Évite les résultats du style 0,1 + 0,2 = 0,30000000000000004
  return parseFloat(n.toPrecision(12));
}

function compute(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? null : a / b;
  }
  return b;
}

function inputDigit(d) {
  if (fresh) {
    current = d;
    fresh = false;
  } else if (current === '0') {
    current = d;
  } else if (current.replace(/[-.]/g, '').length < 15) {
    current += d;
  }
  render();
}

function inputDot() {
  if (fresh) {
    current = '0.';
    fresh = false;
  } else if (!current.includes('.')) {
    current += '.';
  }
  render();
}

function chooseOperator(op) {
  if (operator && !fresh) {
    if (!evaluate()) return;
  }
  previous = parseFloat(current);
  operator = op;
  fresh = true;
  render();
}

function evaluate() {
  if (!operator || previous === null) return true;
  const result = compute(previous, parseFloat(current), operator);
  if (result === null) {
    showError('Division par 0 impossible');
    return false;
  }
  if (!Number.isFinite(result)) {
    showError('Nombre trop grand');
    return false;
  }
  const line = `${format(String(previous))} ${SYMBOLS[operator]} ${format(current)} =`;
  current = String(round(result));
  previous = null;
  operator = null;
  fresh = true;
  render();
  history.textContent = line;
  return true;
}

function clearAll() {
  current = '0';
  previous = null;
  operator = null;
  fresh = false;
  render();
}

function backspace() {
  if (fresh) return;
  current = current.length > 1 ? current.slice(0, -1) : '0';
  if (current === '-') current = '0';
  render();
}

function toggleSign() {
  if (current === '0') return;
  current = current.startsWith('-') ? current.slice(1) : '-' + current;
  render();
}

function percent() {
  // Avec une opération en cours : 200 + 10 % = 200 + 20
  const value = parseFloat(current);
  const result = previous !== null && (operator === '+' || operator === '-')
    ? previous * value / 100
    : value / 100;
  current = String(round(result));
  render();
}

function press(button) {
  if (!button) return;
  button.classList.add('pressed');
  setTimeout(() => button.classList.remove('pressed'), 100);
  const { digit, op, action } = button.dataset;
  if (digit !== undefined) return inputDigit(digit);
  if (op) return chooseOperator(op);
  switch (action) {
    case 'dot': return inputDot();
    case 'equals': return evaluate();
    case 'clear': return clearAll();
    case 'back': return backspace();
    case 'sign': return toggleSign();
    case 'percent': return percent();
  }
}

document.querySelector('.keys').addEventListener('click', e => press(e.target.closest('.key')));

// Clavier de l'ordinateur
document.addEventListener('keydown', e => {
  const k = e.key;
  let selector = null;
  if (/^[0-9]$/.test(k)) selector = `[data-digit="${k}"]`;
  else if (k === '+' || k === '-' || k === '*' || k === '/') selector = `[data-op="${k}"]`;
  else if (k === '.' || k === ',') selector = '[data-action="dot"]';
  else if (k === 'Enter' || k === '=') selector = '[data-action="equals"]';
  else if (k === 'Backspace') selector = '[data-action="back"]';
  else if (k === 'Escape' || k === 'Delete') selector = '[data-action="clear"]';
  else if (k === '%') selector = '[data-action="percent"]';
  if (!selector) return;
  e.preventDefault();
  press(document.querySelector(selector));
});

render();
