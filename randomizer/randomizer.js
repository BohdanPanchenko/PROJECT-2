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
        console.log(arr[randomIndex]);
        result.push(arr[randomIndex]);
        arr.splice(randomIndex, 1);
    }
    return result;
}

function clear() {
    list.innerHTML = '';
}

buttons.addEventListener('click', e => {
    if (e.target.classList.contains('clear'))
        clear();
    else {
        clear();

        let minValue = from.value;
        let maxValue = to.value;

        let quantity = document.querySelector('.quantity').value;

        let checkbox = document.querySelector('#unique');
        let isUnique = checkbox.checked;
        if (isUnique) {
            let numbers = getRandomWithoutRepeat(minValue, maxValue, quantity)
            numbers.forEach(el => {
                let li = document.createElement('li');
                li.innerText = el;
                list.appendChild(li);
            })
        } else {
            for (let i = 0; i < quantity; i++) {
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