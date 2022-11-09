const calculatorBody = document.querySelector('.calculator-body');
const inputField = document.querySelector('.input-field');

let operator = '';
let dotsNumber = 0;
let key = true;
let result = 0;
calculatorBody.addEventListener('click', (event) => {
    let target = event.target;
    if (target.classList.contains('digit')) {
        onDigitHandler(target);

    } else if (target.classList.contains('operator')) {

        if (isBinaryOpeartor(target.innerText) && !checkNumericLength(inputField.innerText)) {
            if (!operator) {
                operator = operatorConverter(target.innerText);
                inputField.innerText += operator;

            } else {
                if (!inputField.innerText.split(operator).includes('') || (inputField.innerText.split(operator)[0] === '' && inputField.innerText.split(operator).reverse()[0] !== '')) {
                    operator = operatorConverter(target.innerText);
                    let result = round(eval(inputField.innerText));
                    inputField.innerText = result + operator;
                } else {

                    let operatorIndex = inputField.innerText.split('').reverse().indexOf(operator);
                    operator = operatorConverter(target.innerText);
                    let input = inputField.innerText.split('').reverse();
                    input.splice(operatorIndex, 1, operator);
                    inputField.innerText = input.reverse().join('');

                }

            }
            dotsNumber = 0;
        } else { //unary operators
            unaryOperation(target.innerText);
        }

    } else if (target.innerText === '.') {
        dotsFilter();


    } else if (target.innerText === '%') {
        calculatePercentage(inputField.innerText);
    }

})

document.querySelector('.clear').addEventListener('click', (e) => {
    clearInputField();
})
document.querySelector('.equals').addEventListener('click', (e) => {

    let nums = inputField.innerText.split(operator);
    if (nums[nums.length - 1] !== '') {
        let result = round(eval(inputField.innerText));
        inputField.innerText = result;
        operator = '';
        if (!inputField.innerText.includes('.')) { dotsNumber = 0; }
    }


})

function dotsFilter() {
    if (dotsNumber === 0 && isDigit(inputField.innerText.at(-1)) && !checkNumericLength(inputField.innerText)) {
        if (!operator && !isNaN(inputField.innerText + '.') || operator) {
            let key = false;
            inputField.innerText.split(operator).forEach(el => {
                if (isNaN(el + '.')) key = false;
                else key = true;
            })
            if (key) {
                inputField.innerText += '.';
                dotsNumber++;
            }
        }
    }
}

function operatorConverter(operator) {
    return (operator === '÷') ? '/' : ((operator === 'x') ? '*' : operator);
}

function checkNumericLength(input) {
    let counter = 0;
    input.split('').forEach(el => {
        if (isDigit(el)) counter++;
    })

    return counter >= 9;
}

function onDigitHandler(input) {
    if (checkNumericLength(inputField.innerText))
        return;

    if (inputField.innerText === '0') {
        inputField.innerText = input.innerText;
    } else inputField.innerText += input.innerText;
}

function clearInputField() {
    inputField.innerText = '0';
    number = '';
    operator = '';
    dotsNumber = 0;
}

function unaryOperation(unaryOperator) {
    if (!operator) {
        switch (unaryOperator) {
            case '√':
                inputField.innerText = round(Math.sqrt(inputField.innerText));
                break;
            case '±':
                if (inputField.innerText !== '0') {
                    inputField.innerText *= -1;
                }
                break;
        }
    }
}


function calculatePercentage(str) {
    if (operator && isDigit(str[str.length - 1])) {
        let num1 = str.split(operator)[1];
        let num2 = str.split(operator)[0];
        let percentage = num2 / 100 * num1;
        percentage = round(percentage);

        str = str.split(operator);
        str.splice(str.length - 1, 1, percentage);

        inputField.innerText = str.join(operator);
    } else if (!operator) {
        let result = round(inputField.innerText / 100);
        inputField.innerText = result;
    }
}

function round(number) {
    return Number(number.toFixed(7));
}

function isBinaryOpeartor(str) {
    return ('+-x÷'.includes(str)) ? true : false;
}

function containsBinaryOpeartor(str) {
    let operators = '+-*/';
    let contains = false;
    operators
        .split('')
        .forEach(el => {
            if (str.includes(el))
                contains = true;
        })
    return contains
}

function isDigit(str) {
    return ('0123456789'.includes(str)) ? true : false;
}
