let from = document.querySelector('#from');
let to = document.querySelector('#to');
let buttons = document.querySelector('.btns');
let list = document.querySelector('.list');

function getRandomWithoutRepeat(min, max, quantity) {
    let arr = [];
    for (let i = min; i <= max; i++) {
        arr.push(i);
    }
    let result = [];
    for (let i = 0; i < quantity; i++) {
        let randomIndex = getRandomIntInclusive(0, arr.length - 1);
        result.push(arr[randomIndex]);
        arr.splice(randomIndex, 1);
    }
    return result;
}

function clear() {
    list.innerHTML = '';
}

function quantityFilter(min, max, quantity) {
    let quantityMax = max - min + 1;
    if (quantity < 1 || quantity === '') return 1;
    else if (quantity > quantityMax) return (quantityMax > 100) ? 100 : quantityMax;
    else if (quantity > 100) return 100;

    return Math.round(quantity);

}

function getMinMaxValue(min, max) {
    let minMax = {};
    minMax.min = (min < 0) ? 0 : (min >= 150) ? 150 : min;
    minMax.max = (max <= 0) ? 1 : (max > 150) ? 150 : max;

    if (minMax.max < minMax.min)[minMax.max, minMax.min] = [minMax.min, minMax.max];

    minMax.min = Math.round(minMax.min);
    minMax.max = Math.round(minMax.max);
    return minMax;

}

buttons.addEventListener('click', e => {
    if (e.target.classList.contains('clear'))
        clear();
    else {
        clear();
        let minMaxValue = getMinMaxValue(from.value, to.value)
        let minValue = from.value = minMaxValue.min;
        let maxValue = to.value = minMaxValue.max;


        let quantityElement = document.querySelector('.quantity');
        let quantityValue = quantityFilter(minValue, maxValue, quantityElement.value);
        quantityElement.value = quantityValue;

        let checkbox = document.querySelector('#unique');
        let isUnique = checkbox.checked;
        if (isUnique) {
            let numbers = getRandomWithoutRepeat(minValue, maxValue, quantityValue)
            numbers.forEach(el => {
                let li = document.createElement('li');
                li.innerText = el;
                list.appendChild(li);
            })
        } else {
            for (let i = 0; i < quantityValue; i++) {
                let listItem = document.createElement('li');
                listItem.innerText = getRandomIntInclusive(minValue, maxValue);
                list.appendChild(listItem);
            }
        }



    }

})

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
