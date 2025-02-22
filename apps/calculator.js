function calculator() {
const calcWindow = createWindow('Calculator', `
    <div id="calculator-app">
        <div id="calc-display">0</div>
        <button class="calc-button">7</button>
        <button class="calc-button">8</button>
        <button class="calc-button">9</button>
        <button class="calc-button">/</button>
        <button class="calc-button">4</button>
        <button class="calc-button">5</button>
        <button class="calc-button">6</button>
        <button class="calc-button">*</button>
        <button class="calc-button">1</button>
        <button class="calc-button">2</button>
        <button class="calc-button">3</button>
        <button class="calc-button">-</button>
        <button class="calc-button">0</button>
        <button class="calc-button">.</button>
        <button class="calc-button">=</button>
        <button class="calc-button">+</button>
    </div>
`, 300, 400);

let display = calcWindow.querySelector('#calc-display');
let firstNumber = null;
let operator = null;
let newNumber = true;

calcWindow.querySelectorAll('.calc-button').forEach(button => {
    button.addEventListener('click', () => {
        const value = button.textContent;
        
        if ('0123456789.'.includes(value)) {
            if (newNumber) {
                display.textContent = value;
                newNumber = false;
            } else {
                display.textContent += value;
            }
        } else if ('+-*/'.includes(value)) {
            firstNumber = parseFloat(display.textContent);
            operator = value;
            newNumber = true;
        } else if (value === '=') {
            const secondNumber = parseFloat(display.textContent);
            let result;
            switch(operator) {
                case '+': result = firstNumber + secondNumber; break;
                case '-': result = firstNumber - secondNumber; break;
                case '*': result = firstNumber * secondNumber; break;
                case '/': result = firstNumber / secondNumber; break;
            }
            display.textContent = result;
            newNumber = true;
        }
    });
});
}