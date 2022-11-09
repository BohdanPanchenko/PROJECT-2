import questions from './questions.js';
let questionCounter;
let prize = ['0', '1 000', '25 000', '1 000 000'];
let prizeCurrentValue;
let extraQuestions = [];
let gameQuestions = [];
let loseSound = new Audio('./audio/lose.mp3');
let winSound = new Audio('./audio/win.mp3');

let btnBgHover = new Image();
btnBgHover.src = './images/btn-orange.png';
btnBgHover.onload = () => { console.log('success!') };

// console.log(questions.filter((el) => el.complexity === 1).length);
// console.log(questions.filter((el) => el.complexity === 2).length);
// console.log(questions.filter((el) => el.complexity === 3).length);



let timerId;
const timeTransition = 6500; // время, требующееся для отображения вопроса с варинтами ответов(с запасом) + отображение таймера
let questionField = document.querySelector('.question-field');
let lifelines = document.querySelector('.lifelines');
let progressBar = document.querySelectorAll('.progress-bar');
let progressBarItems = [...document.querySelectorAll('.progress-bar li')];
let options = document.querySelector('.question-options');
let countdown = document.querySelector('.countdown-circle');

const questionBody = document.querySelector('.question-body');
const optionsItems = [...document.querySelectorAll('.option-text')];

let countdownCurrentValue;

const popUp = document.getElementsByClassName('pop-up')[0];
const popUpMessage = document.querySelector('.pop-up-message')
const popUpBtn = document.querySelector('.pop-up-btn');

popUpBtn.addEventListener('click', startGame);

lifelines.addEventListener('click', useLifelines);

function useLifelines(event) {
    if (event.target.closest('.lifeline-img') && countdownCurrentValue < 29) {
        const lifeline = event.target.closest('.lifeline-img');
        const lifelineType = lifeline.getAttribute('data-lifelines');

        switch (lifelineType) {
            case '50/50':
                UseFiftyFifty(lifeline);
                break;
            case 'ask-audience':
                drawDiagram(askAudience(lifeline))
                break;
            case 'change-question':
                changeQuestion(lifeline);
                break;
        }
    }
}

function askAudience(lifeline) {
    let input = [];
    let coeficientTrue = (gameQuestions[questionCounter].complexity === 1) ? 9.5 : 4;
    let coeficientFalse = (gameQuestions[questionCounter].complexity === 1) ? 3.5 : 2;
    let incorrectOptionNumber = 3;

    for (let i = 0; i < coeficientTrue; i++)
        input.push(gameQuestions[questionCounter].correctAnswer);
    for (let i = 0; i < optionsItems.length; i++) {
        for (let j = 0; j < coeficientFalse; j++) {
            if (i !== gameQuestions[questionCounter].options.indexOf(gameQuestions[questionCounter].correctAnswer))
                input.push(gameQuestions[questionCounter].options[i]);
        }
    }


    let output = [];
    for (let i = 0; i < coeficientTrue * 1 + coeficientFalse * incorrectOptionNumber; i++) {
        let randomIndex = getRandomIntInclusive(0, input.length - 1)
        output.push(input[randomIndex]);
    }

    let percentage = [];
    for (let i = 0; i < 4; i++) {
        percentage.push(output.filter(el => el === gameQuestions[questionCounter].options[i]).length)
    }

    percentage = percentage.map(el => {
        return Math.round((el / (coeficientFalse * incorrectOptionNumber + coeficientTrue) * 100));
    });
    disableElements(lifeline);

    pauseCountdownTimer();
    return percentage;
}

function drawDiagram(percentage) {

    const markers = ['A', 'B', 'C', 'D'];
    const diagramElement = document.createElement('div');
    diagramElement.classList.add('audience-percentage');

    for (let i = 0; i < percentage.length; i++) {
        const column = document.createElement('div');
        column.classList.add('column');
        column.innerHTML = `<div class="marker">${markers[i]}</div>${percentage[i]}%`;
        setTimeout(() => {
            column.style.height = `${percentage[i]*1.5}%`;
            column.style.color = '#fff';
        }, 300)

        diagramElement.appendChild(column);
    }
    const closeBtn = document.createElement('div');
    closeBtn.classList.add('close-btn');
    closeBtn.innerHTML = `<div></div><div></div>`;
    closeBtn.addEventListener('click', e => {
        hideElement(popUp);
        setCountdownTimer(countdownCurrentValue);
    }, { once: true })

    const popUp = document.querySelector('.pop-up')
    popUp.innerHTML = '';
    diagramElement.appendChild(closeBtn);
    popUp.appendChild(diagramElement);

    showElement(popUp);

}

function UseFiftyFifty(lifeline) {

    let optionArray = Array.from(optionsItems); // элементы .option-text
    optionArray.forEach((el, index) => {
        if (el.innerText === gameQuestions[questionCounter].correctAnswer)
            optionArray.splice(index, 1);
    })
    let resultArray = []; // элементы .option-text, которые будут скрыты
    for (let i = 0; i < 2; i++) {
        let randomIndex = getRandomIntInclusive(0, optionArray.length - 1);
        resultArray.push(optionArray[randomIndex]);
        optionArray.splice(randomIndex, 1);
    }
    resultArray.forEach((el) => {
        el.innerText = '';

    })
    resultArray = resultArray.map(el => {
        return el.closest('.option-item');
    })
    disableElements(lifeline);
    disableElements(...resultArray);
}

function changeQuestion(lifeline) {
    let extraQuestionComplexety = gameQuestions[questionCounter].complexity;
    let extraQuestion = extraQuestions.filter(el => el.complexity === extraQuestionComplexety)[0];

    gameQuestions.splice(questionCounter, 1, extraQuestion);
    clearFields();
    displayQuestion(gameQuestions[questionCounter], true);

    disableElements(lifeline);
    resetCountdownTimer();

}

function displayQuestion(question, isReplaced = false) { // поочередно выводим вопрос, варианты ответа и таймер с разницей в 1 секунду
    disableOptions();
    let latency = 1000; // 
    let countdownValue = countdown.querySelector('.countdown-value');
    // countdownValue.innerText = 30 // перезагружаем таймер либо оставляем значение неизменным
    // countdownValue.innerText = (!isReplaced) ? 30 : countdownValue.innerText; // перезагружаем таймер либо оставляем значение неизменным
    for (let i = -1; i <= optionsItems.length; i++) {
        setTimeout(() => {
            if (i === optionsItems.length) { // показываем таймер
                // if (i === optionsItems.length && !isReplaced) { // показываем таймер
                countdownValue.innerText = 30;
                showElement(countdown);
                setCountdownTimer(countdownCurrentValue);
                return;
            }

            if (i === -1) { // если индекс -1 показываем сам вопрос
                questionBody.innerText = question.body;
                questionBody.classList.add('visible');
                return;
            }
            if (i === optionsItems.length) return; //если значение индекса превосходит кол-во опций прерываем выполнение ф-ции
            questionBody.classList.add('visible'); // показываем варианты ответов
            optionsItems[i].classList.add('visible');
            optionsItems[i].innerText = question.options[i];

        }, latency)
        latency += 1000;
    }
}

function clearFields() {
    questionBody.classList.remove('visible');
    optionsItems.forEach(el => {
        el.classList.remove('visible');
    })
}



function startGame() {
    gameQuestions = shuffleQuestions();

    questionCounter = 0;
    prizeCurrentValue = 0;
    countdownCurrentValue = 29;
    [...lifelines.querySelectorAll('.lifeline-img')].forEach(el => el.classList.remove('disabled'));
    progressBar = document.querySelector('.progress-bar');
    progressBarItems.forEach(el => { if (el.classList.contains('current')) el.classList.remove('current') });
    progressBarItems[questionCounter].classList.add('current');
    onProgressBarChanging(false);
    questionField = document.querySelector('.question-field');

    lifelines = document.querySelector('.lifelines');


    let optionItems = Array.from(options.querySelectorAll('.option-item'));
    showElements(questionField, lifelines, progressBar, questionBody, ...optionItems);

    hideElement(document.querySelector('.pop-up'));

    options.addEventListener('click', gameIteration);
    displayQuestion(gameQuestions[questionCounter]);
    popUpBtn.removeEventListener('click', startGame);


}

function gameIteration(event) {

    optionsItems.forEach(el => { // делаем наши опции доступными для событий
        if (el.classList.contains('disabled'))
            el.classList.remove('disabled')
    });
    if (event.target.closest('.option-item')) {
        const selectedOption = event.target.classList.contains('option-text') ? event.target : event.target.querySelector('.option-text');
        const currentQuestion = gameQuestions[questionCounter];

        if (checkIfAnswerCorrect(currentQuestion, selectedOption)) {
            correctAnswerHandler(selectedOption.closest('.option-item'));
        } else {
            incorrectAnswerHandler(selectedOption.closest('.option-item'));
        }
    }


}

function checkIfAnswerCorrect(question, option) {
    return (question.correctAnswer === option.innerText);

}


function showDialogBox(message = '', reload, ...btns) {
    let dialogBox = document.createElement('div');
    dialogBox.classList.add('pop-up');
    if (message) {
        let dialogBoxMessage = document.createElement('div');
        dialogBoxMessage.classList.add('pop-up-message');
        dialogBoxMessage.innerText = message;
        dialogBox.appendChild(dialogBoxMessage);

        let prizeField = document.createElement('div');
        prizeField.classList.add('pop-up-prize');
        prizeField.innerText = `Your win ${prize[prizeCurrentValue]}$`;
        dialogBox.appendChild(prizeField);
    }

    btns.forEach(item => {
        if (item) {
            item.element.innerText = item.text;
            item.element.addEventListener('click', item.callback, { once: true });
            dialogBox.appendChild(item.element)
            showElement(item.element);
        }
    })
    const popUp = document.querySelector('.pop-up');
    popUp.replaceWith(dialogBox);
    if (reload) {
        hideAllElements();
        clearFields();
        pauseCountdownTimer();
        clearInterval(timerId);
    }
}


function correctAnswerHandler(selectedOption) {

    if (questionCounter === 4 || questionCounter === 9) {
        prizeCurrentValue++;
    } else if (questionCounter === 14) {
        prizeCurrentValue++;
    }

    blink(selectedOption, true);
    winSound.play();
    onProgressBarChanging();
    resetCountdownTimer();

    setTimeout(() => {
        clearFields();
        if (questionCounter <= 14)
            displayQuestion(gameQuestions[questionCounter]);
    }, 4000)

}

function incorrectAnswerHandler(selectedOption) {
    blink(selectedOption, false);
    loseSound.play();
    resetCountdownTimer();
    let dialogParams = {
        text: 'Try again!',
        element: popUpBtn,
        callback: startGame
    }

    setTimeout(() => {
        showDialogBox('Oh no! You got the answer wrong!', true, dialogParams);
    }, 4000)


}

function shuffleQuestions() { // генерируем вопросы случайным образом + дополнительный вопрос в качестве подсказки
    let output = []; // результирующий массив с вопросами
    let difficultyLevels = 3;
    let questionsTotalNumber = 15;
    for (let i = 1; i <= difficultyLevels; i++) {
        let input = questions.filter(el => el.complexity === i);
        for (let j = 0; j <= questionsTotalNumber / difficultyLevels; j++) {
            let randomQuestion = input[getRandomIntInclusive(0, input.length - 1)];
            if (j === questionsTotalNumber / difficultyLevels) {
                extraQuestions.push(randomQuestion);
                break;
            }
            output.push(randomQuestion);
            input.splice(input.indexOf(randomQuestion), 1);
        }
    }

    return output;
}

function setCountdownTimer() {
    let countdownTextField = countdown.querySelector('.countdown-value');
    let countdownHandler = function() {
        countdownTextField.innerText = countdownCurrentValue--;
        document.querySelector('.countdown-circle circle').style.animationPlayState = 'unset';

        if (countdownCurrentValue < 0) {
            let dialogParams = {
                text: 'Try again!',
                element: popUpBtn,
                callback: startGame
            }
            showDialogBox('Out of time!', true, dialogParams);
            loseSound.play();
            hideElement(countdown);
            clearFields();
            clearInterval(timerId);
            countdownCurrentValue = 29;
        }
    }

    let timer = timerId = setInterval(countdownHandler, 1000);


}

function pauseCountdownTimer() {
    clearInterval(timerId);
    document.querySelector('.countdown-circle circle').style.animationPlayState = 'paused';

}

function resetCountdownTimer() {
    clearInterval(timerId);
    countdownCurrentValue = 29;
    hideElement(countdown);
}

function onProgressBarChanging(success = true) {
    if (!success) { // если мы дали неправильный ответ на вопрос - теряем весь прогресс
        progressBarItems.forEach(el => { if (el.classList.contains('next')) el.classList.remove('next'); });
        return;
    }
    if (questionCounter > 0) progressBarItems[questionCounter - 1].classList.remove('next');
    progressBarItems[questionCounter].classList.remove('current');
    progressBarItems[questionCounter].classList.add('next');

    questionCounter++;
    if (questionCounter === gameQuestions.length) {
        let dialogParams = {
            text: 'Start over',
            element: popUpBtn,
            callback: startGame
        }
        new Audio('./audio/final-answer.mp3').play();
        setTimeout(() => {
            showDialogBox(`Congratulations! You're A Millionaire!`, true, dialogParams);
        }, 4000)

        return;
    }
    progressBarItems[questionCounter].classList.add('current');
}

function blink(selectedOption, isCorrect) {
    let optionItems = [...document.querySelectorAll('.option-item')];
    disableElements(...optionItems);
    let color = (isCorrect) ? 'bg-green' : 'bg-red';
    let total = 8;
    let latency = 500;
    let correctOption;
    options.querySelectorAll('.option-text').forEach((el, index) => {
        if (el.innerText === gameQuestions[questionCounter].correctAnswer)
            correctOption = options.querySelectorAll('.option-item')[index];
    })
    for (let i = 0; i < total; i++) {
        setTimeout(() => {
            if (!isCorrect) {
                correctOption.classList.add('bg-green');
                if (i === total - 1)
                    correctOption.classList.remove('bg-green');
            }
            selectedOption.classList.toggle(color);
        }, latency)
        latency += 500;

    }

}

function disableOptions() {
    let optionsItems = Array.from(options.querySelectorAll('.option-item'));
    optionsItems.forEach(el => {
        el.classList.add('disabled');
    });
    setTimeout(() => {
        optionsItems.forEach((el) => {
            el.classList.remove('disabled');

        })
    }, timeTransition);
}

function disableElements(...arr) {
    if (Array.isArray(arr)) {
        arr.forEach(el => el.classList.add('disabled'));
    }

}

function hideElement(el) {
    el.classList.add('animation-out');
    let animationDuration = window.getComputedStyle(el).animationDuration;
    animationDuration = getAnimationDurationFromString(animationDuration);
    setTimeout(() => {
        el.classList.add('hidden');
        el.classList.remove('animation-out');
    }, animationDuration + 50)
}

function hideElements(...arr) {
    arr.forEach(el => {
        el.classList.add('animation-out');
        let animationDuration = window.getComputedStyle(el).animationDuration;
        animationDuration = getAnimationDurationFromString(animationDuration);
        setTimeout(() => {
            el.classList.add('hidden');
            el.classList.remove('animation-out');
        }, animationDuration + 1000)
    })

}

function hideAllElements() {
    let optionItems = Array.from(options.querySelectorAll('.option-item'));
    hideElements(questionField, lifelines, progressBar, questionBody, countdown, ...optionItems);
}

function showElement(el) {
    el.classList.remove('hidden');
}

function showElements(...arr) {
    arr.forEach(el => el.classList.remove('hidden'))
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getAnimationDurationFromString(el) {

    return Number(el.split('s')[0]) * 1000;

}

function getPrizeValueFromString(str) {
    return Number(str.split(' ').join('').replace('$', ''));
}
