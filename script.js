class Calculator {
  constructor(historyElement, mainElement) {
    this.historyElement = historyElement;
    this.mainElement = mainElement;
    this.clear();
  }

  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.resetScreen = false;
    this.updateDisplay();
  }

  delete() {
    if (this.resetScreen) return;
    if (this.currentOperand === '0') return;
    if (this.currentOperand.length === 1) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }
    this.updateDisplay();
  }

  appendNumber(number) {
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number;
    } else if (this.resetScreen) {
      this.currentOperand = number;
      this.resetScreen = false;
    } else {
      if (number === '.' && this.currentOperand.includes('.')) return;
      if (this.currentOperand.length >= 12) return; // Prevent overflow
      this.currentOperand += number;
    }
    this.updateDisplay();
  }

  chooseOperation(operation) {
    if (this.currentOperand === '' && operation !== '-') return;
    if (this.previousOperand !== '') {
      this.compute();
    }
    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.resetScreen = true;
    this.updateDisplay();
  }

  percent() {
    if (this.currentOperand === '') return;
    this.currentOperand = (parseFloat(this.currentOperand) / 100).toString();
    this.updateDisplay();
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current)) return;

    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '-':
        computation = prev - current;
        break;
      case '×':
      case '*':
        computation = prev * current;
        break;
      case '÷':
      case '/':
        if (current === 0) {
          alert("Cannot divide by zero");
          this.clear();
          return;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    // Handle precision issues (e.g. 0.1 + 0.2)
    this.currentOperand = Math.round(computation * 1e10) / 1e10;
    this.operation = undefined;
    this.previousOperand = '';
    this.resetScreen = true;
    this.updateDisplay();
  }

  formatNumber(number) {
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split('.')[0]);
    const decimalDigits = stringNumber.split('.')[1];
    let integerDisplay;

    if (isNaN(integerDigits)) {
      integerDisplay = '';
    } else {
      integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
    }

    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }

  updateDisplay() {
    this.mainElement.innerText = this.formatNumber(this.currentOperand);
    if (this.operation != null) {
      this.historyElement.innerText = `${this.formatNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.historyElement.innerText = '';
    }
  }
}

// Initialization
const historyDisplay = document.getElementById('history-display');
const mainDisplay = document.getElementById('main-display');
const calculator = new Calculator(historyDisplay, mainDisplay);

// Button Click Event Listeners
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', () => {
    if (button.dataset.number) {
      calculator.appendNumber(button.dataset.number);
    } else if (button.dataset.operator) {
      calculator.chooseOperation(button.dataset.operator);
    } else if (button.dataset.action === 'clear') {
      calculator.clear();
    } else if (button.dataset.action === 'delete') {
      calculator.delete();
    } else if (button.dataset.action === 'percent') {
      calculator.percent();
    } else if (button.dataset.action === 'calculate') {
      calculator.compute();
    }
  });
});

// Keyboard Accessibility & Support
window.addEventListener('keydown', e => {
  let key = e.key;
  
  if (key >= '0' && key <= '9') calculator.appendNumber(key);
  if (key === '.') calculator.appendNumber('.');
  if (key === '+' || key === '-') calculator.chooseOperation(key);
  if (key === '*') calculator.chooseOperation('×');
  if (key === '/') {
    e.preventDefault();
    calculator.chooseOperation('÷');
  }
  if (key === '%' || key === '%') calculator.percent();
  if (key === 'Enter' || key === '=') {
    e.preventDefault();
    calculator.compute();
  }
  if (key === 'Backspace') calculator.delete();
  if (key === 'Escape') calculator.clear();

  // Visual feedback for key press
  highlightButton(key);
});

function highlightButton(key) {
  let selector;
  if (key >= '0' && key <= '9') selector = `[data-number="${key}"]`;
  else if (key === '.') selector = `[data-number="."]`;
  else if (key === '+') selector = `[data-operator="+"]`;
  else if (key === '-') selector = `[data-operator="-"]`;
  else if (key === '*') selector = `[data-operator="×"]`;
  else if (key === '/') selector = `[data-operator="÷"]`;
  else if (key === 'Enter' || key === '=') selector = `[data-action="calculate"]`;
  else if (key === 'Backspace') selector = `[data-action="delete"]`;
  else if (key === 'Escape') selector = `[data-action="clear"]`;

  if (selector) {
    const btn = document.querySelector(selector);
    if (btn) {
      btn.classList.add('pressed');
      setTimeout(() => btn.classList.remove('pressed'), 150);
    }
  }
}
