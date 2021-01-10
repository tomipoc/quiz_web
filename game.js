const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
//console.log(choices);

const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("score");

const progressBarFull = document.getElementById("progressBarFull");

const loader = document.getElementById("loader");
const game = document.getElementById("game");

let currentQuestion = {};
let acceptingAnswers = false;
let scrope = 0;
let questionCounter = 0;
let availableQuestions = {};

let questions = [];

//fetch("questions.json")
fetch("https://opentdb.com/api.php?amount=10&type=multiple")
    .then(res => {
        console.log(res);
        return res.json();
    })
    .then(loadedQuestions => {
        console.log(loadedQuestions.results);
        //questions = loadedQuestions;

        // api question transformation
        questions = loadedQuestions.results.map(loadedQuestion => {
            const fomrattedQuestion = {
                question: loadedQuestion.question,
            }

            const answerChoices = [...loadedQuestion.incorrect_answers]
            fomrattedQuestion.answer = Math.floor(Math.random() * 3) + 1;
            answerChoices.splice(fomrattedQuestion.answer - 1, 0, loadedQuestion.correct_answer);

            answerChoices.forEach( (choice, index) => {
                fomrattedQuestion["choice" + (index+1)] = choice;
            });

            return fomrattedQuestion;
        });
        
        startGame();
    })
    .catch(err => {
        console.error(err);
    }
);

//constants
const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 3;

startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuestions = [...questions]; // copy array
    //console.log(availableQuestions);

    game.classList.remove("hidden");
    loader.classList.add("hidden");

    getNewQuestion();
};

getNewQuestion = () => {
    if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
        localStorage.setItem("mostRecentScore", score);
        //go to the end page
        return window.location.assign('./end.html');
    }

    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;

    // update the progress bar
    
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    question.innerHTML = currentQuestion.question;

    choices.forEach(choice => {
        const number = choice.dataset["number"];
        choice.innerHTML = currentQuestion['choice' + number];
    });

    availableQuestions.splice(questionIndex, 1);
    acceptingAnswers = true;
};

choices.forEach((choice) => {
    choice.addEventListener('click', (e) => {
        console.log(e.target);
        if (!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset['number'];

        const classToApply = selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";
        selectedChoice.parentElement.classList.add(classToApply);

        if(classToApply === 'correct') {
            incrementScore(CORRECT_BONUS);
            console.log(currentQuestion);
        }
        else {
            console.log(currentQuestion);
            /* for coloring the correct answer */
            choices.forEach((innerChoice) => {
                if(innerChoice.dataset["number"] == currentQuestion.answer) {
                    innerChoice.parentElement.classList.add("correct");
                    setTimeout(() => {
                        innerChoice.parentElement.classList.remove("correct");
                      }, 1000);
                }
            });
        }

        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply);
            getNewQuestion();
          }, 1000);
    });
});

incrementScore = num => {
    score += num;
    scoreText.innerText = score;
}


