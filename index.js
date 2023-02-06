// ! import statements
import { convertToSevenSegment } from "./utils.js"
// initialize the canvas
let canvas = document.querySelector("canvas")
let context = canvas.getContext("2d")
let menu = document.getElementById("menu")
let buttons = document.querySelectorAll("button")
let playerRange1 = document.getElementById("player1")
let playerRange2 = document.getElementById("player2")
let startMenu = document.getElementById("start")
context.font = "50px Arial"

// initialize all the sounds
let ballBounce = new Audio("./assets/ball-hop.mp3")
let dingSound = new Audio("./assets/ping-sound.mp3")
let countDown = new Audio("./assets/count-down.mp3")

function playBounce() {
    if (!(state.mute[0])) {
        ballBounce.cloneNode(true).play()
    }
}

function playPing() {
    if (!(state.mute[1])) {
        dingSound.cloneNode(true).play()
    }
}

function playCountDown() {
    if (!(state.mute[2])) {
        countDown.play()
    }

}

// ! game menus and interaction

// done
function pauseGame() {
    drawPauseMenu()
}

// done
function actions() {
    if (state.actions.length > 0) {
    for ( let i = 0; i < state.actions.length; i++) {
        if (state.actions[i] == "Escape") {
            state.pause = !(state.pause)
        }

        if (state.actions[i] == "a" && state.players[0].powerups[0] <= 0) {
            state.players[0].activePowerups[0] = true
            state.players[0].powerups[0] = 4000
        }

        if (state.actions[i] == "j" && state.players[1].powerups[0] <= 0) {
            state.players[1].activePowerups[0] = true
            state.players[1].powerups[0] = 4000
        }

        if (state.actions[i] == "d" && state.players[0].powerups[1] <= 0) {
            state.players[0].activePowerups[1] = true
            state.ball.push([30, state.players[0].pos + 40, [false, false], [1], Math.floor(Math.random() * 5), 8]) 
            state.players[0].powerups[1] = 5000
        }

        if (state.actions[i] == "l" && state.players[1].powerups[1] <= 0) {
            state.players[1].activePowerups[1] = true
            state.ball.push([350, state.players[1].pos + 40, [true, false], [1],  Math.floor(Math.random() * 5), 8])
            state.players[1].powerups[1] = 5000
        }
        
        if (state.actions[i] == "q" && state.players[0].powerups[2] <= 0) {
            state.players[0].activePowerups[2] = true
            state.players[0].powerups[2] = 15000
            twoxballspeed(0)
        }

        
        if (state.actions[i] == "u" && state.players[0].powerups[2] <= 0) {
            state.players[1].activePowerups[2] = true
            state.players[1].powerups[2] = 15000
            twoxballspeed(0)
        }

    }
    }
    state.actions = []
}

    
// ! game function
// Loop every 16.6 ms
let loop = setInterval(() => {
    game()
}, 16.6)

// done
function game() {
    actions()
    if (navigator.userAgent.match(/Android/) || navigator.userAgent.match(/Iphone/) || navigator.userAgent.match(/Blackberry/)) {
        state.mobile = true
    }
    
    if (state.pause){
        render()
        return pauseGame()
    } 
    
    if (!(state.pause)) {
        menu.style.visibility = "hidden"
    }
    // check if restart is true
    if (state.restart > 0) {
        destroyBall(state.ball.length)
        context.clearRect(0, 0, canvas.width, canvas.height)
        render()
        renderCountdown(state.restart)
        state.players[0].pos = 150
        state.players[1].pos = 150
        playerRange2.value = state.players[1].pos
        playerRange1.value = state.players[0].pos
        state.restart -= 20
        if (state.restart > 2500 && state.restart < 2550) {
            playCountDown()
            state.ball[0][4] = 0
        }
        return
    }
    
    // check if pause is true
    
    // update positions
    update()
    
    // render the game to the screen
    context.clearRect(0, 0, canvas.width, canvas.height)
    render()
    
}

// done
// Set game state
let state = {
    players: [
        {
            move: [false, false],
            pos: 150,   
            score: 0,
            powerups: [5000, 7000, 10000],
            activePowerups: [false, false, false]
        },
        {
            move: [false, false], 
            pos: 150,
            score: 0,
            powerups: [5000, 7000, 10000],
            activePowerups: [false, false, false]
        }
    ],
    ball: [[200, 200, [true, false], [1], -1, 3]], 
    actions: [],
    pause: false,
    restart: 3100,
    mute: [false, false, false, false],
    theme: "dark",
    mobile: false,
    start: true
}

let themes = {
    normal: ["green", "cornflowerblue", "aquamarine", "tomato", "black", "red", "#3a0000"],
    dark: ["#212127", "white", "#5B8FB9", "#301E67", "#03001C", "#367FB3", "#212145"],
    funky: ["#008080", "#a4debf", "#ef0041", "#ffe33d", "#001bd1", "#cc2da2", "#f4ec5d"],
}

// done
// Update functions
function update() {
    // update playerstate
    let playerState = state.players
    updatePlayers(playerState)
    syncMobileValues()
    
    // update ball state
    let ballState = state.ball
    ballCollision(ballState, playerState)

        
}


// render function
function render() {
    let playerState = state.players

    // render the players
    drawPlayers(playerState)

    // draw the net
    drawNet()

    // draw the ball
    let ball = state.ball
    drawBall(ball)

    // draw the borders
    drawBorder()

    // draw scores
    drawScore(context, [19, 358], convertToSevenSegment(state.players[0].score))
    drawScore(context, [370, 358], convertToSevenSegment(state.players[1].score))

    // draw the powerups
    drawPowerUps(context, [55, 370], playerState[0].powerups, ["orange", themes[state.theme][3], "yellow", "purple", themes[state.theme][0]])
    drawPowerUps(context, [295, 370], playerState[1].powerups, ["blue", themes[state.theme][1], themes[state.theme][2], themes[state.theme][5], themes[state.theme][5]])

    // draw powerup menus
    drawPowerupMenu(context)
}

// ! Under the hood functions

// ? update player State
function updatePlayers(playerState) {
    for (let i = 0; i < 2; i++) {
        playerState[i].powerups[0] -= 17
        playerState[i].powerups[1] -= 17
        playerState[i].powerups[2] -= 17
        // syncMobileValues()
        if (playerState[i].move[0] && !(playerState[i].pos >= 285)) {
            playerState[i].pos += 5
        }

        if (playerState[i].move[1] && !(playerState[i].pos < 15)) {
            playerState[i].pos -= 5
        }
        
    }

    if (playerState[0].score > 9 || playerState[1].score > 9) {
        playerState[0].score = 0
        playerState[1].score = 0
    }

}

// ? player 2x powerup
function twoxpowerup(playerstate) {
    if (playerstate.activePowerups[0]) {
        return 2
    }
    return 1
}

//  ?  check ball collision
function ballCollision(ballState, playerState) {
    for (let i = 0; i < ballState.length; i++) {
        // check the collision of padel 1
        if (ballState[i][0] < 30 && ballState[i][1] >= playerState[0].pos - 50  && ballState[i][1] <= playerState[0].pos + 100 ) {
            ballState[i][2][0] = false
            ballState[i][2][1] = Math.floor(Math.random() * 2) == 1 ? true : false
            ballState[i][4] = Math.floor(Math.random() * 3)
            ballState[i][3] = 1
            playBounce()
            setBallSpeed(i)   
            destroyBall(i)
        } 
        
        // check for the collision of padel 2
        if (ballState[i][0] > 360 && ballState[i][1] >= playerState[1].pos - 50  && ballState[i][1] <= playerState[1].pos + 100 ) {
            ballState[i][2][0] = true
            ballState[i][2][1] = Math.floor(Math.random() * 2) == 1 ? true : false
            ballState[i][4] = Math.floor(Math.random() * 3)
            ballState[i][3] = 0
            playBounce()
            setBallSpeed(i)   
            destroyBall(i)

        }
        
        // check if padel 1 missed ball
        if (ballState[i][0] < 10) {
            // ballState[i][0] = 175
            ballState[i][2][0] = false
            ballState[i][1] = 175
            ballState[i][0] = 175
            playerState[0].activePowerups[0] = false
            playerState[0].score <= 9 ? playerState[1].score += twoxpowerup(playerState[1]) : null
            playPing()
            setBallState()
            state.restart = 3100
            setBallSpeed(i)   
            playerState[1].activePowerups[0] === true ? playerState[1].activePowerups[0] = false : null
        }
        
        // check if padel 2 missed ball 
        if (ballState[i][0] > 390) {
            ballState[i][2][0] = true
            ballState[i][0] = 175
            ballState[i][1] = 175
            playerState[1].activePowerups[0] = false
            playerState[1].score <= 9 ? playerState[0].score += twoxpowerup(playerState[0]) : null
            playPing()
            setBallSpeed(i)   
            state.restart = 3100
            setBallState()
            playerState[0].activePowerups[0] === true ? playerState[0].activePowerups[0] = false : null

        }

        // check if the ball hit the borders

        if (ballState[i][1] < 10) {
            ballState[i][2][1] = false
            playBounce()
            setBallSpeed(i)   

        }

        if (ballState[i][1] > 350) {
              ballState[i][2][1] = true
            playBounce()
            setBallSpeed(i)   

        }
        updateBall(ballState, i)
    }
}

// ? update ball collision
function updateBall(ballState, i) {
    // check the ball orientation
    if (ballState[i][2][0]) {
        ballState[i][0] -= ballState[i][5]
    }

    if (!(ballState[i][2][0])) {
        ballState[i][0] += ballState[i][5]
    }


    if (ballState[i][2][1]) {
        ballState[i][1] -= ballState[i][4] 
    }

    
    if (!(ballState[i][2][1])) {
        ballState[i][1] += ballState[i][4] 
    }

}

// ? draw the players
function drawPlayers(playerState) {
    
    for (let i = 0; i < playerState.length; i++) {
        if (i === 1) {
            context.beginPath()
            context.fillStyle = themes[state.theme][2]
            context.fillRect(375, playerState[i].pos, 20, 100)
            context.stroke()
            continue
        }    

        context.beginPath()
            context.fillStyle = themes[state.theme][3]
            context.fillRect(5, playerState[i].pos, 20, 100)
            context.stroke()
    }

}

// ?  draw the net
function drawNet() {
    for (let i = 1; i < 26; i++) {
        context.beginPath()
        context.fillStyle = themes[state.theme][1]
        context.fillRect(205, i * 15, 10, 10)
        context.stroke()
    }
}

// ? staw the player powerups
function drawPowerUps(context, coordinates, delays, fillStyle) {
    context.beginPath()
    context.strokeStyle = "white"
    context.lineWidth = 5
    context.moveTo(coordinates[0], coordinates[1])
    context.lineTo(coordinates[0] + 10, coordinates[1] - 10)
    context.stroke()
    context.moveTo(coordinates[0], coordinates[1] - 10)
    context.lineTo(coordinates[0] + 10 , coordinates[1])
    context.stroke()

    context.beginPath()
    context.fillStyle = fillStyle[0]
    context.fillRect(coordinates[0] + 18, coordinates[1] - 10, 10, 10)
    context.fillStyle = fillStyle[1]
    context.fillRect(coordinates[0] + 21, coordinates[1] - 10, 7, 7)
    context.fillStyle = fillStyle[2]
    context.fillRect(coordinates[0] + 18, coordinates[1] - 11, 5, 11)
    context.fillStyle = fillStyle[3]
    context.fillRect(coordinates[0] + 24, coordinates[1] - 5, 3, 3)

    context.beginPath()
    context.fillStyle = fillStyle[2]
    context.fillRect(coordinates[0] + 35, coordinates[1] - 10, 7, 7)
    context.fillStyle = fillStyle[4]
    context.fillRect(coordinates[0] + 40, coordinates[1] - 7, 7, 7)
    context.stroke()

    if (delays[0] <= 0) {
        context.lineWidth = 2
        context.moveTo(coordinates[0] + 5, coordinates[1] + 10)
        context.lineTo( coordinates[0] + 5, coordinates[1] + 20)
        context.stroke()
        context.moveTo(coordinates[0] + 10, coordinates[1] + 14)
        context.lineTo(coordinates[0] + 5, coordinates[1] + 7)
        context.stroke()
        context.moveTo(coordinates[0], coordinates[1] + 15)
        context.lineTo(coordinates[0] + 5, coordinates[1] + 7)
        context.stroke()
    }

    
    if (delays[1] <= 0) {
        context.lineWidth = 2
        context.moveTo(coordinates[0] + 22, coordinates[1] + 10)
        context.lineTo( coordinates[0] + 22, coordinates[1] + 20)
        context.stroke()
        context.moveTo(coordinates[0] + 27, coordinates[1] + 14)
        context.lineTo(coordinates[0] + 22, coordinates[1] + 7)
        context.stroke()
        context.moveTo(coordinates[0] + 17, coordinates[1] + 15)
        context.lineTo(coordinates[0] + 22, coordinates[1] + 7)
        context.stroke()
    }

    
    if (delays[2] <= 0) {
        context.lineWidth = 2
        context.moveTo(coordinates[0] + 40, coordinates[1] + 10)
        context.lineTo( coordinates[0] + 40, coordinates[1] + 20)
        context.stroke()
        context.moveTo(coordinates[0] + 45, coordinates[1] + 14)
        context.lineTo(coordinates[0] + 40, coordinates[1] + 7)
        context.stroke()
        context.moveTo(coordinates[0] + 35, coordinates[1] + 15)
        context.lineTo(coordinates[0] + 40, coordinates[1] + 7)
        context.stroke()
    }

}

// ? draw the scores
function drawScore(context, coordinates, number) {
    checkNum(context, number[0])
    context.fillRect(coordinates[0], coordinates[1], 10, 5)

    checkNum(context, number[1])
    context.fillRect(coordinates[0] + 10, coordinates[1] + 5, 5, 10)

    checkNum(context, number[2])
    context.fillRect(coordinates[0] + 10, coordinates[1] + 17, 5, 10)

    checkNum(context, number[3])
    context.fillRect(coordinates[0], coordinates[1] + 28, 10, 5)
    
    checkNum(context, number[4])
    context.fillRect(coordinates[0] -5, coordinates[1] + 17, 5, 10)
    
    checkNum(context, number[5])
    context.fillRect(coordinates[0] - 5, coordinates[1] + 5, 5, 10)

    checkNum(context, number[6])
    context.fillRect(coordinates[0], coordinates[1] + 14, 10, 5)

}

// ? check num
function checkNum(context, num) {
    if (num === 0) {
        context.beginPath()
        context.fillStyle = themes[state.theme][6]
    } else {
        context.fillStyle = themes[state.theme][5]
    }
}

// ? draw ball
function drawBall(ball) {
    for (let i = 0; i < ball.length; i++) {
    context.beginPath()
    context.fillStyle = ball[i][3] == 1 ? themes[state.theme][3] : themes[state.theme][2] 
    context.fillRect(ball[i][0], ball[i][1], 20, 20)
    context.stroke()
    }
}

// ? draw the borders
function drawBorder() {
    // draw the borders
    context.beginPath()
    context.fillStyle = themes[state.theme][0]
    context.fillRect(0, 0, 400, 15)
    // draw the bottom borders
    context.fillRect(0, 350, 400, 50)
    context.fillStyle = themes[state.theme][4]
    context.fillRect(5, 355, 40, 40)
    context.fillRect(50, 355, 60, 20)
    context.fillRect(355, 355, 40, 40)
    context.fillRect(290, 355, 60, 20)
    context.stroke()
}

// ? draw countdown
function renderCountdown(time) {
    context.font = "Arial 50px"
    context.strokeText((time / 1000).toFixed(2), 160, 100)
}

// ? destroy if ball 2 hits a padel
function destroyBall(i) {
    if (state.ball.length > 1 && i > 0) {
        state.ball.pop()
    }
}

// ? set ball state to middle
function setBallState() {
    state.ball[0][0] = 175 
    state.ball[0][1] = 175 
}

// ? reset ball x speed
function setBallSpeed(i) {
    state.ball[i][5] = 8
}

// ? 2x ball speed
function twoxballspeed(r) {
    for (let i = 0; i < state.ball.length; i++) {
        state.ball[i][5] = 18        
    }
}

// ? draw the powerup menus
function drawPowerupMenu(context) {
    
}

// ? draw the pauseMenu
function drawPauseMenu() {
    menu.style.visibility = "visible"
    menu.style.backgroundColor = themes[state.theme][0]
    menu.style.border = `10px solid ${themes[state.theme][6]}`
    menu.style.color = `${themes[state.theme][5]}`
    buttons.forEach(e => {
        e.style.background = themes[state.theme][1]
        e.style.border = `${themes[state.theme][6]} solid 5px`
    }) 

}

// ? draw the start screen
function drawStartMenu() {
    startMenu.style.visibility = "visible"

}

// ? set game to not start
function startGame() {
    state.start = false
}

// ? swap theme
function swapTheme(theme) {
    state.theme = theme
}

// ? change range buttons to player values
function syncMobileValues() {
    if (state.mobile) {
        state.players[0].pos = Number(playerRange1.value)
        state.players[1].pos = Number(playerRange2.value)
    }
}


// ! //////////////////////////////////////// ! /////////////////

// Set Player Key detection
window.addEventListener("keydown", (e) => {
    if (e.key ==  "w") {
        state.players[0].move[1] = true
    }
    if (e.key == "s") {
        state.players[0].move[0] = true
    }

    if (e.key == "i") {
        state.players[1].move[1] = true
    }
    
    if (e.key == "k") {
        state.players[1].move[0] = true
    }

    if (e.key == "a") {
        state.actions += e.key
    }

    if (e.key == "l") {
        state.actions += e.key
    }

    if (e.key == "d") {
        state.actions += e.key
    } 

    if (e.key == "j") {
        state.actions = e.key
    }

    if (e.key == "q") {
        state.actions = e.key
    }

    
    if (e.key == "u") {
        state.actions = e.key
    }

    if (e.key === "Escape") {
        state.actions +=  e.key
        state.pause = !(state.pause)
    }

})

window.addEventListener("keyup", (e) => {
    if (e.key ==  "w") {
        state.players[0].move[1] = false
    }
    if (e.key == "s") {
        state.players[0].move[0] = false
    }

    if (e.key == "i") {
        state.players[1].move[1] = false
    }
    
    if (e.key == "k") {
        state.players[1].move[0] = false
    }
})

document.querySelectorAll("button").forEach((e) => {
    e.addEventListener("click", (button) => {
        if (e.innerText == "x") {
            return state.pause = false
        }
        swapTheme(e.innerText)
    })
})

document.querySelectorAll("input").forEach((e) => {
    if (!(e.id == "player1") || !(e.id == "player2")) {
        e.addEventListener("click", button => {
            state.mute[e.dataset.set] = !(state.mute[e.dataset.set])
        })
    }
})

// run the game function on page load
    game()
