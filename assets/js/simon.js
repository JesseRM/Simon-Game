const pads = document.querySelectorAll(".pad");
const counter = document.querySelector(".counter");

const buttons = {
    on: document.querySelector(".on-btn"),
    off: document.querySelector(".off-btn"),
    playReset: {
        elem: document.querySelector(".play-reset-btn"),
        setPlay: function(){
            buttons.playReset.elem.classList.remove(icons.reset);
            buttons.playReset.elem.classList.add(icons.play);
        },
        setReset: function(){
            buttons.playReset.elem.classList.remove(icons.play);
            buttons.playReset.elem.classList.add(icons.reset);
        }
    },
    settings: document.querySelector(".settings-btn"),
    audio: document.querySelector(".audio-btn"),
    easy: document.querySelector(".easy-btn"),
    hard: document.querySelector(".hard-btn"),
    extreme: document.querySelector(".extreme-btn"),
    strict: document.querySelector(".strict-btn")
}

let game = {
    counter: 0,
    sequence: [],
    currentIndex: 0,
    difficulty: "Easy",
    currentCheck: buttons.easy,
    strict: false,
    on: false,
    running: false,
    sequencePlaying: false,
    menuOn: false,
}

const containers = {
    pads: {
        elem: document.querySelector(".simonboard"),
        setSpin: function(){
            containers.pads.elem.classList.add("spin");
        },
        removeSpin: function(){
            containers.pads.elem.classList.remove("spin");
        }
    },
    on: document.querySelector(".on"),
    play: document.querySelector(".play"),
    buttons: document.querySelector(".button-block"),
    settings: document.querySelector(".settings-menu")
}

let timeouts = {
    user: null,
    continue: null,
    pads: []
}

const sounds = {
    0: {
        sound: new Howl({
            src: ["https://s3.amazonaws.com/freecodecamp/simonSound1.mp3"]
        })
    },
    1: {
        sound: new Howl({
            src: ["https://s3.amazonaws.com/freecodecamp/simonSound2.mp3"]
        })
    },
    2: {
        sound: new Howl({
            src: ["https://s3.amazonaws.com/freecodecamp/simonSound3.mp3"]
        })
    },
    3: {
        sound: new Howl({
            src: ["https://s3.amazonaws.com/freecodecamp/simonSound4.mp3"]
        })
    }
}

const icons = {
    reset: "fa-undo",
    check: "fa-check",
    play: "fa-play",
    x: "fa-times-circle",
    checkCircle: "fa-check-circle",
    soundOn: "fa-volume-up",
    soundOff: "fa-volume-off"
}

const activeColors = {
    green: "#5cff4c",
    red: "#ff4c4c",
    yellow: "#f7ff4c",
    blue: "#4c80ff"
}

buttons.on.addEventListener("click", () => {
    if(game.on === false){
        turnGameOn();
    }
});

buttons.off.addEventListener("click", () => {
    if(game.on === true){
        turnGameOff();
    }
});

buttons.easy.addEventListener("click", () => {
    handleDifficulty("Easy");
});

buttons.hard.addEventListener("click", () => {
    handleDifficulty("Hard");
});

buttons.extreme.addEventListener("click", () => {
    handleDifficulty("Extreme");
});

buttons.strict.addEventListener("click", () => {
    handleStrict();
});

buttons.playReset.elem.addEventListener("click", () => {
    if(game.running === false){
        game.running = true;
        if(game.difficulty === "Extreme"){
            containers.pads.setSpin();
        }
        buttons.playReset.setReset();
        start();
    } else {
        buttons.playReset.setPlay();
        reset("user");
    }
});

buttons.settings.addEventListener("click", () => {
    if(game.menuOn === false){
        containers.play.style.display = "none";
        counter.style.display = "none";
        containers.settings.style.display = "block";
        game.menuOn = true;
    } else {
        containers.settings.style.display = "none";
        containers.play.style.display = "block";
        counter.style.display = "block";
        game.menuOn = false;
    }
});

pads.forEach((pad) => {
    pad.addEventListener("click", () => {
        if(game.sequencePlaying === false && game.running === true){
            sounds[pad.id].sound.play();
            clearTimeout(timeouts.user); //clear timeout that waits 5 sec for user response
            if(pad.id == game.sequence[game.currentIndex]){
                if(checkWin()){
                    gameWon();
                } else {
                    game.currentIndex++;
                    let c = game.currentIndex;
                    if(game.currentIndex === game.sequence.length){
                        start();
                    } else {

                        //Give user 5 secs to click next pad in sequence
                        timeouts.user = setTimeout(() => {
                            if(game.currentIndex === c){
                                lose();
                            }
                        }, 5000)
                    }
                }
            } else {
                lose();
            }
        } else if (game.sequencePlaying === false){
            sounds[pad.id].sound.play(); //if game is not running simply play sound
        }
    });
});

function start(){
    game.running = true;
    updateCounter();
    updateSequence();
    playSequence();
}

function checkWin(){
    return game.currentIndex === 19 ? true: false;
}

function gameWon(){
    counter.textContent = "U WIN!";
}

function lose(){
    game.sequencePlaying = true; //keep pad from playing during lose function
    counter.textContent = "U LOSE!";
    if(game.strict === true){
        timeouts.continue = setTimeout(() => {
            reset("game");
            start();
        }, 1500);
    } else {
        timeouts.continue = setTimeout(() => {
            counter.textContent = game.counter < 10 ? "0" + game.counter: game.counter;
            playSequence();
        }, 1500);
    }
}

function reset(mode){
    clearTimeout(timeouts.user);
    timeouts.pads.forEach(function(pad) {
        console.log(pad);
        clearTimeout(pad);
    });
    pads.forEach((pad) => pad.style.cssText = "");
    counter.textContent = "00";
    game.counter = 0;
    game.sequence.length = 0;
    game.currentIndex = 0;
    game.running = false;
    game.sequencePlaying = false;
    if(mode === "user"){
        if(game.difficulty === "Extreme"){
            containers.pads.removeSpin();
        }
    }
}

function turnGameOff(){
    game.on = false;

    deActivateControls();
    padsAnimation("off");

    buttons.strict.innerHTML = `Strict<span class='fa ${icons.x} '></span>`;
    buttons.playReset.classList.remove(icons.reset);
    buttons.playReset.classList.add(icons.play);
    handleDifficulty("Easy");
    game = {
        counter: 0,
        sequence: [],
        currentIndex: 0,
        difficulty: "Easy",
        currentCheck: buttons.easy,
        strict: false,
        on: false,
        running: false,
        sequencePlaying: false,
        menuOn: false,
        userTimeout: null
        }
}

function playSequence(sequence){
    game.sequencePlaying = true;
    let sec = 0;
    if(game.difficulty === "Easy" || game.difficulty === "Extreme"){
        sec = 1000;
    } else if(game.difficulty === "Hard"){
        sec = 500;
    }

    for(let i = 0; i < game.sequence.length; i++){
        let index = game.sequence[i];
        timeouts.pads[i] = setTimeout(() => {
            sounds[index].sound.play();
            pads[index].style.backgroundColor = getActiveColor(pads[index]);
            timeouts.pads[i + 1] = setTimeout(() => {
                pads[index].style.cssText = "";
                if(i + 1  >= game.sequence.length && game.running === true){
                    game.sequencePlaying = false;
                    //Giver user 5 seconds to respond
                    timeouts.user = setTimeout(() => {
                            if(game.currentIndex === 0){
                                lose();
                            }
                        }, 5000);
                }
            }, 250);
        }, sec * (i + 1));
    }
    game.currentIndex = 0;
}

function updateCounter(){
    game.counter++;
    counter.textContent = game.counter < 10 ? "0" + game.counter: game.counter;
}

function getActiveColor(elem){
    if(elem.id == 0){
        return activeColors.green;
    } else if(elem.id == 1){
        return activeColors.red;
    } else if(elem.id == 2){
        return activeColors.yellow;
    } else if(elem.id == 3){
        return activeColors.blue;
    }
}

function updateSequence(){
    game.sequence.push(Math.floor(Math.random() * 4));
}

function turnGameOn(){
    game.on = true;

    padsAnimation("on");
    activateControls();
}

function activateControls(){
    containers.on.classList.toggle("turn-off");

    setTimeout(() => {
        containers.on.style.display = "none";
    }, 1000);

    setTimeout(() => {
        counter.style.display = "block";
        counter.classList.remove("turn-off");
        counter.classList.add("turn-on");
    }, 1100);

    setTimeout(() => {
        containers.play.style.display = "block";
        containers.play.classList.remove("turn-off");
        containers.play.classList.add("turn-on");
    }, 1200)

    setTimeout(() => {
        containers.buttons.style.display = "block";
        containers.buttons.classList.remove("turn-off");
        containers.buttons.classList.add("turn-on");
    }, 1300);
}

function deActivateControls(){
    if(containers.settings.style.display === "block"){
        containers.settings.classList.add("turn-off");
        setTimeout(() => {
            containers.settings.style.display = "none";
            containers.settings.classList.remove("turn-off");
            game.menuOn = false;
        },1100);
    }
    counter.classList.add("turn-off");
    setTimeout(() => {
        counter.style.display = "none";
    }, 1000)

    containers.play.classList.add("turn-off");
    setTimeout(() => {
        containers.play.style.display = "none";
    }, 1100)

    containers.buttons.classList.add("turn-off");
    setTimeout(() => {
        containers.buttons.style.display = "none";
    }, 1200);

    setTimeout(() => {
        containers.on.style.display = "block";
        containers.on.classList.remove("turn-off");
        containers.on.classList.add("turn-on");
    }, 1300);
}

function padsAnimation(state){
    if(state === "on"){
        containers.pads.elem.classList.toggle("rotate-on");
        pads.forEach((pad) => {
            pad.classList.remove("turn-off");
            pad.classList.add("turn-on");
        });
    } else if(state === "off"){
        containers.pads.elem.classList.toggle("rotate-on");
        pads.forEach((pad) => {
            pad.classList.add("turn-off");
            pad.classList.remove("turn-on");
        });
    }
}

function handleDifficulty(difficulty){
    switch (difficulty) {
        case "Easy":
            if(game.difficulty === "Easy"){
                break;
            } else {
                game.currentCheck.innerHTML = game.difficulty;
                game.difficulty = "Easy";
                buttons.easy.innerHTML += "<span class='fa fa-check'></span>";
                game.currentCheck = buttons.easy;
                break;
            }
        case "Hard":
            if(game.difficulty === "Hard"){
                break;
            } else {
                game.currentCheck.innerHTML = game.difficulty;
                game.difficulty = "Hard";
                buttons.hard.innerHTML += "<span class='fa fa-check'></span>";
                game.currentCheck = buttons.hard;
                break;
            }
        case "Extreme":
            if(game.difficulty === "Extreme"){
                break;
            } else {
                game.currentCheck.innerHTML = game.difficulty;
                game.difficulty = "Extreme";
                buttons.extreme.innerHTML += "<span class='fa fa-check'></span>";
                game.currentCheck = buttons.extreme;
                break;
            }
    }
}

function handleStrict(){
    if(game.strict === false){
        game.strict = true;
        buttons.strict.innerHTML = `Strict<span class='fa ${icons.checkCircle} '></span>`;
    } else {
        game.strict = false;
        buttons.strict.innerHTML = `Strict<span class='fa ${icons.x} '></span>`;
    }
}
