const calculator = document.querySelector('.calculator');
const keys = calculator.querySelector('.calculator__keys');
const display = calculator.querySelector('.calculator__display');

let state = {
  firstValue: 0,
  operator: null,
  waitingForOperand: false,
  displayValue: '0'
};

function updateDisplay(value) {
  // Apple-like formatting: short decimals, no trailing .0, error handling
  if (value === null || isNaN(value) || !isFinite(value)) {
    display.textContent = 'Error';
    return;
  }
  // Parse and format
  let num = parseFloat(value);
  if (isNaN(num)) {
    display.textContent = '0';
    return;
  }
  // Limit precision, use toLocaleString for commas if large
  const formatted = num.toLocaleString(undefined, {
    maximumFractionDigits: 10,
    minimumFractionDigits: 0
  });
  display.textContent = formatted;
}

function inputNumber(num) {
  const { displayValue, waitingForOperand } = state;
  if (waitingForOperand) {
    state.displayValue = num;
    state.waitingForOperand = false;
  } else {
    state.displayValue = displayValue === '0' || displayValue === 'Error' ? num : displayValue + num;
  }
  updateDisplay(state.displayValue);
}

function inputOperator(nextOperator) {
  const { firstValue, operator, displayValue } = state;
  const inputValue = parseFloat(displayValue);

  if (operator && state.waitingForOperand) {
    state.operator = nextOperator;
    return;
  }

  if (firstValue && operator) {
    const currentValue = firstValue || 0;
    let result;
    switch (operator) {
      case 'add':
        result = currentValue + inputValue;
        break;
      case 'subtract':
        result = currentValue - inputValue;
        break;
      case 'multiply':
        result = currentValue * inputValue;
        break;
      case 'divide':
        result = inputValue === 0 ? null : currentValue / inputValue;
        break;
    }
    state.firstValue = result;
    state.displayValue = String(result);
  } else {
    state.firstValue = inputValue;
  }

  state.waitingForOperand = true;
  state.operator = nextOperator;
  updateDisplay(state.firstValue);
}

function inputDecimal(dot) {
  if (state.waitingForOperand) {
    inputNumber('0.');
    state.waitingForOperand = false;
  } else if (!state.displayValue.includes('.')) {
    state.displayValue += '.';
    updateDisplay(state.displayValue);
  }
}

function calculate() {
  if (state.operator) {
    inputOperator(state.operator);
  }
}

function clearAll() {
  state = {
    firstValue: 0,
    operator: null,
    waitingForOperand: false,
    displayValue: '0'
  };
  updateDisplay('0');
}

// Mouse clicks
keys.addEventListener('click', e => {
  if (!e.target.matches('button')) return;

  const key = e.target;
  const action = key.dataset.action;
  const keyContent = key.textContent.trim();

  // Visual feedback
  key.classList.add('is-depressed');
  setTimeout(() => key.classList.remove('is-depressed'), 150);

  if (!action) {
    inputNumber(keyContent);
  } else if (action === 'decimal') {
    inputDecimal();
  } else if (['add', 'subtract', 'multiply', 'divide'].includes(action)) {
    inputOperator(action);
  } else if (action === 'calculate') {
    calculate();
  } else if (action === 'clear') {
    clearAll();
  }
});

// Keyboard support (Apple-like keys)
document.addEventListener('keydown', e => {
  // Find matching key button for visual feedback
  const keyButton = [...keys.querySelectorAll('button')].find(btn => {
    const action = btn.dataset.action;
    const content = btn.textContent.trim();
    if (action) {
      return e.key === action || (action === 'calculate' && e.key === 'Enter') || (action === 'clear' && (e.key === 'Escape' || e.key === 'Backspace'));
    }
    return content === e.key;
  });

  if (keyButton) {
    keyButton.classList.add('is-depressed');
    setTimeout(() => keyButton.classList.remove('is-depressed'), 150);
  }

  // Handle input
  if (e.key >= '0' && e.key <= '9') {
    e.preventDefault();
    inputNumber(e.key);
  } else if (['+', '-', '*', '/'].includes(e.key)) {
    e.preventDefault();
    const op = e.key === '*' ? 'multiply' : e.key === '/' ? 'divide' : e.key;
    inputOperator(op);
  } else if (e.key === '.') {
    e.preventDefault();
    inputDecimal();
  } else if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    calculate();
  } else if (e.key === 'Escape' || e.key === 'Backspace') {
    e.preventDefault();
    clearAll();
  }
});

// Initial display
updateDisplay('0');
