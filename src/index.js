// Data
let gameBoardData = {
    level: "",
    numOfRows: 0,
    numOfColumns: 0,
    board: [],
    playerName: "Abdullah",
    time: "20:00",
};
let timer;
let isSaved = false;
const results = [];
const customGames = []; // used to collect the costum games so that we later place them in the local storage
/// new types
const GameState = {
    INGAME: 0,
    WON: 1,
    LOST: 2
};
let gameState = GameState.INGAME;
function WhiteCell(color = "white", holdsLamb = false, illuminateOtherLightBulb = false, numOfConflictingBulbs = 0) {
    this.numOfBulbsWhoseLightIsOnThisCell = 0;
    this.color = color; // will change when a light is placed on it.
    this.holdsLamb = holdsLamb;
    this.illuminateOtherLightBulb = illuminateOtherLightBulb;
    this.type = 'W'; // type of the object -> w represents WhiteCell
    this.numOfConflictingBulbs = numOfConflictingBulbs;
};
function BlackCell(number, position, textColor = "white") {
    this.position = position;
    this.number = number;
    this.type = 'B'; // type of the object -> B represents BlackCell
    this.textColor = textColor; // will change when a black tile is surrounded by the correct number of light bulbs   
}
function Position(x, y) {
    this.x = x;
    this.y = y;
}
function Time(s, m, h) {
    this.seconds = s;
    this.minutes = m;
    this.hours = h;
}

// Utilities
function xyCoord(td) {
    const x = td.cellIndex
    const tr = td.parentNode
    const y = tr.sectionRowIndex
    return { x, y }
}
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
const sleepFunc = async () => { await sleep(2000) }
function fomatTime(time) {
    return `${time.hours > 9 ? time.hours : `0${time.hours}`}:${time.minutes > 9 ? time.minutes : `0${time.minutes}`}:${time.seconds > 9 ? time.seconds : `0${time.seconds}`} `;

}

///////////////////////////////////////////////////////////////////////
// Elemnts
const playerNameInp = document.querySelector("#name");
const startGameButton = document.querySelector("#start-game-button");
const mapSelecorContainer = document.querySelector(".map-selecor-container");
const gameBoardContainer = document.querySelector(".game-board-container");
const table = document.querySelector("#normal-table");
const customeTable = document.querySelector("#custome-table");
const time = document.querySelector("#time");
const playerNameHolder = document.querySelector("#player-name");
const menuBtn = document.querySelector("#Menu");
const lose = document.querySelector("#lose");
const winDiv = document.querySelector("#win");
const saveBtn = document.querySelector("#Save");
const restartBtn = document.querySelector("#Restart");
const resumeBtn = document.querySelector("#Resume");
const savedGameSection = document.querySelector("#saved-game");
const resultsBtn = document.querySelector("#results-button");
const resultsContainer = document.querySelector("#results-info-container");
const backBtn = document.querySelector("#back-btn");
const lastResults = document.querySelector("#last-results");
const aboutBtn = document.querySelector("#about");
const back = document.querySelector("#back");
const aboutContianer = document.querySelector("#about-container");
const customeDimInput = document.querySelector("#custome-dim-input-container");
const startCustomeGameBtn = document.querySelector("#start-custome-game");
const topnav = document.querySelector("#topnav");
// On game load
updateSavedGameSection();
///////////////////////////////////////////////////////////////////////
// Event Listeners
playerNameInp.addEventListener('input', onChangeNameState)
startGameButton.addEventListener('click', onStartGame);
table.addEventListener("click", onCell);
menuBtn.addEventListener('click', onMenu);
winDiv.addEventListener('click', onWinBtns);
saveBtn.addEventListener('click', onSave);
resumeBtn.addEventListener('click', onResume);
restartBtn.addEventListener('click', onRestart);
resultsBtn.addEventListener('click', onResultsBtn);
backBtn.addEventListener('click', onBackBtn);
aboutBtn.addEventListener('click', onAboutBtn);
back.addEventListener('click', onBackBtn);
startCustomeGameBtn.addEventListener('click' , onStartCustomeGameBtn);

window.addEventListener('beforeunload', function (e) {
    const temp = results;
    const previousResults = JSON.parse(localStorage.getItem('results'));
    if (previousResults) {
        for (item of previousResults) {
            temp.push(item)
        }
    }
    localStorage.setItem('results', JSON.stringify(temp));


    const previousCustomGames = JSON.parse(localStorage.getItem('customGames'));
    if(previousCustomGames){
        for (el of  previousCustomGames){
            customGames.push(el);
        }
    }
    localStorage.setItem('customGames', JSON.stringify(customGames));
});


function updateSavedGameSection() {
    const gameData = JSON.parse(localStorage.getItem('gameData'));
    savedGameSection.innerHTML = `
            <strong> Last Saved game:</strong>
            ${gameData === null ? "NONE" :
            `
            <section id="last-game-results" style="font-size:large ;">${gameData.playerName}  --- ${gameData.level} --- ${gameData.time.hours < 10 ? `0${gameData.time.hours}` : gameData.time.hours}:
            ${gameData.time.minutes < 10 ? `0${gameData.time.minutes}` : gameData.time.minutes}: 
            ${gameData.time.seconds < 10 ? `0${gameData.time.seconds}` : gameData.time.seconds} 
            </section>
            `}
`;
}

///////////////////////////////////////////////////////////////////////
// handlers
function onStartCustomeGameBtn(event){
    table.innerHTML = customeTable.innerHTML ; 
    startCustomeGameBtn.hidden = true;
    customeDimInput.hidden = true;
    customeTable.parentNode.hidden = true;
    topnav.hidden = false;
    table.parentNode.hidden = false;
    clearInterval(timer);
    updateTime();
}
function onAboutBtn(event) {
    mapSelecorContainer.hidden = true;
    aboutContianer.hidden = false;
}

function onBackBtn(event) {
    mapSelecorContainer.hidden = false;
    resultsContainer.hidden = true;
    aboutContianer.hidden = true;

}
function onResultsBtn(event) {
    resultsContainer.hidden = false;
    mapSelecorContainer.hidden = true;
    lastResults.innerHTML = `${results.reverse().map(res =>
        `<section style="font-size:x-large ;"> ${res.playerName + " -- " + res.level + ' -- ' + fomatTime(res.timeToken)}</section>`
    ).join("")}`;

    const previousResults = JSON.parse(localStorage.getItem('results'));
    if (previousResults) {
        for (item of previousResults) {
            lastResults.innerHTML += `<section style="font-size:x-large ;"> ${item.playerName + " -- " + item.level + ' -- ' + fomatTime(item.timeToken)}</section>`

        }
    }
}
function onRestart(event) {
    if(gameBoardData.level === "Custome"){
        onCustomRestart(gameBoardData.playerName)
        
    }else{
        startGame(gameBoardData.level, gameBoardData.playerName);
    }
}
function onResume(event) {
    const gameDataInLocalStorage = JSON.parse(localStorage.getItem('gameData'));
    if (gameDataInLocalStorage !== null) {
        gameBoardData = gameDataInLocalStorage;
        table.innerHTML = genTable(gameBoardData.board);
        playerNameHolder.innerHTML = gameBoardData.playerName;
        clearInterval(timer);
        time.innerHTML = `${gameBoardData.time.hours > 9 ? gameBoardData.time.hours : `0${gameBoardData.time.hours}`}:${gameBoardData.time.minutes > 9 ? gameBoardData.time.minutes : `0${gameBoardData.time.minutes}`}:${gameBoardData.time.seconds > 9 ? gameBoardData.time.seconds : `0${gameBoardData.time.seconds}`} `;
        updateTime();
        mapSelecorContainer.hidden = true;
        gameBoardContainer.hidden = false;
        localStorage.removeItem("gameData");
    }
}
function onSave(event) {
    localStorage.removeItem("gameData")
    localStorage.setItem('gameData', JSON.stringify(gameBoardData));
    updateSavedGameSection();
}

function onWinBtns(event) {
    if (event.target.matches('button')) {
        if (event.target.id === "Menu") {
            winDiv.hidden = true;
            gameBoardContainer.hidden = true;
            mapSelecorContainer.hidden = false;
            updateSavedGameSection();
            clearInterval(timer);
        }
        else {
            if(gameBoardData.level === "Custome"){
                gameBoardContainer.hidden = false;
                onCustomRestart(gameBoardData.playerName);
            }else{
                startGame(gameBoardData.level, gameBoardData.playerName);
            }
            winDiv.hidden = true;
        }
    }
}
function onChangeNameState(event) { /// checks if the length of the input is bigger than the allowed length
    if (this.value.length === parseInt(this.maxLength)) {
        this.nextElementSibling.hidden = false;
    } else {
        this.nextElementSibling.hidden = true;
    }
}
function onStartGame(event) {
    // read
    const levelsSelect = document.querySelector("#levels");
    const level = levelsSelect.value;
    const playerName = playerNameInp.value;

    if (playerNameInp.value.length === 0) {
        const nameError = document.getElementById("nameError");
        nameError.classList.add("visible");
        playerNameInp.classList.add("invalid");
        nameError.setAttribute("aria-hidden", false);
        nameError.setAttribute("aria-invalid", true);
    } else {
        nameError.classList.remove("visible");
        playerNameInp.classList.remove("invalid");
        if (level === "Custome") {
            handleCustome(playerName);
        } else {
            mapSelecorContainer.hidden = true;
            gameBoardContainer.hidden = false;
            startGame(level, playerName);
        }
    }
}
function onMenu(event) {
    let text = "Make sure to press the save button if you want to save the game!.\nCancel -> keep you in the game\nok -> go to menu";
    if (confirm(text)) {
        winDiv.hidden = true;
        gameBoardContainer.hidden = true;
        mapSelecorContainer.hidden = false;
        updateSavedGameSection();
        clearInterval(timer);
    }
}
function onCell(event) {  
    if (gameState !== GameState.WON) {
    
        const { x, y } = xyCoord(event.target);
        if (event.target.matches('td') && event.target.dataset.id === "cell") {
            if (isWhiteCell(y, x)) {
                if (gameBoardData.board[y][x].holdsLamb) {
                    updateGameBoardData(y, x, "white");
                    gameBoardData.board[y][x].holdsLamb = false;
                } else {
                    updateGameBoardData(y, x, "yellow");
                    gameBoardData.board[y][x].holdsLamb = true;
                }
                table.innerHTML = genTable(gameBoardData.board);
            }
        }
        else {
            if (event.target.matches('td img')) {
                const { x, y } = xyCoord(event.target.parentNode);
                gameBoardData.board[y][x].holdsLamb = false;
                updateGameBoardData(y, x, "white");
                table.innerHTML = genTable(gameBoardData.board);
            }
        }
        if (checkWon()) {
            if(gameBoardData.level === "Custome"){
                customGames.push(gameBoardData);
            }
            const child = winDiv.firstElementChild;
            child.innerHTML = `
                                <span>Congrats ${gameBoardData.playerName} You Solved The Puzzle!</span>
                                <span> Time: ${time.innerHTML}
                                <br>
                                <button>Play again</button>
                                <button id="Menu">Menu</button>
                                `
            winDiv.hidden = false;
            gameBoardContainer.hidden = true;
            let resultData = { playerName: gameBoardData.playerName, level: gameBoardData.level, timeToken: gameBoardData.time }
            results.push(resultData);
        }
    }
}
function onCustomeCell (e) {
    if(e.target.matches('td')){
        const {x,y} = xyCoord(e.target);
        if(gameBoardData.board[y][x].type === "W"){
            gameBoardData.board[y][x] = new BlackCell(-1,new Position(y,x));
            e.target.style.backgroundColor = "black";
            e.target.style.color= "white";
            e.target.style.fontSize= "1.5em";
        }else{
            if(gameBoardData.board[y][x].number !== 4){                        
                gameBoardData.board[y][x].number =  gameBoardData.board[y][x].number + 1;
                e.target.innerHTML = gameBoardData.board[y][x].number;
            }
        }
    }
};

///////////////////////////////////////////////////////////////////////

function onCustomRestart(playerName){
    for (let i = 0; i < gameBoardData.numOfRows; i++){
        for (let j = 0; j < gameBoardData.numOfColumns; j++){
            if(gameBoardData.board[i][j].type === "W"){
                gameBoardData.board[i][j] = new WhiteCell();
            }
        }
    }
    time.innerHTML = "00:00:00";
    gameBoardData.time = new Time(0,0,0);
    clearInterval(timer);
    updateTime();
    table.innerHTML = genTable(gameBoardData.board);
}

function handleCustomAux(playerName) {
    customeTable.parentNode.hidden = false;
    startCustomeGameBtn.hidden = false;
    gameBoardData.level = "Custome";
    gameBoardData.board = [];

    gameBoardContainer.hidden = false;
    gameBoardData.playerName = playerName;
    gameBoardData.time = new Time(0, 0, 0);
    time.innerHTML = "00:00:00";
    playerNameHolder.innerHTML = playerName;
    for (let i = 0; i < gameBoardData.numOfRows; i++) {
        let row = [];
        for (let j = 0; j < gameBoardData.numOfColumns; j++) {
            row.push(new WhiteCell());
        }
        gameBoardData.board.push(row);
    }
    customeTable.innerHTML = genTable(gameBoardData.board);
    customeTable.addEventListener('click', onCustomeCell);
}
// Business logic
function handleCustome(playerName) {
    table.parentNode.hidden = true;
    customeDimInput.hidden = false;
    mapSelecorContainer.hidden = true;
    const inputs = Array.from(customeDimInput.querySelectorAll('input'));
    topnav.hidden = true;
    customeDimInput.querySelector('button').addEventListener('click', (e) => {
        customeDimInput.hidden = true;
        gameBoardData.numOfColumns = inputs[0].valueAsNumber;
        gameBoardData.numOfRows = inputs[1].valueAsNumber;
        handleCustomAux(playerName);
    });

}
function startGame(level, playerName) {
    initializeGame(level, playerName);
}
function initializeGame(level, playerName) {
    switch (level) {
        case "Easy":
            init(level, 7, 7, playerName);
            break;
        case "Advanced":
            init("Advanced", 7, 7, playerName);
            break;
        case "Extreme":
            init("Extreme", 10, 10, playerName);
            break;
    }
    gameBoardContainer.hidden = false;
}

function init(level, numOfRows, numOfCols, playerName) {
    gameState = GameState.INGAME;
    gameBoardData.level = level;
    gameBoardData.playerName = playerName;
    gameBoardData.board = [];
    gameBoardData.time = new Time(0, 0, 0);
    time.innerHTML = "00:00:00";

    clearInterval(timer);
    updateTime();
    playerNameHolder.innerHTML = gameBoardData.playerName;

    gameBoardContainer.hidden = false;
    gameBoardData.board = [];
    gameBoardData.numOfColumns = numOfCols;
    gameBoardData.numOfRows = numOfRows;
    for (let i = 0; i < gameBoardData.numOfRows; i++) {
        let row = [];
        for (let j = 0; j < gameBoardData.numOfColumns; j++) {
            row.push(new WhiteCell())
        }
        gameBoardData.board.push(row);
    }
    let blackCells = [];
    blackCells = genBlackCells(level);
    let idx = 0;
    for (bc of blackCells) {
        gameBoardData.board[bc.position.x][bc.position.y] = blackCells[idx++];
    }
    table.innerHTML = genTable(gameBoardData.board);
}
function isWhiteCell(x, y) {
    return gameBoardData.board[x][y].type == 'W';
}
function hasAlamb(i, j) {
    if (i < 0 || j < 0 || i >= gameBoardData.numOfRows || j >= gameBoardData.numOfColumns) return 0;
    return gameBoardData.board[i][j].type === "W" && gameBoardData.board[i][j].holdsLamb ? 1 : 0;
}
function checkNeighbouringBulbs(i, j) {
    let cnt = 0;
    cnt += hasAlamb(i - 1, j);
    cnt += hasAlamb(i, j + 1);
    cnt += hasAlamb(i + 1, j);
    cnt += hasAlamb(i, j - 1);
    return cnt === gameBoardData.board[i][j].number;
}
function validate(i, j) {
    if (gameBoardData.board[i][j].type === "W") {
        return gameBoardData.board[i][j].numOfBulbsWhoseLightIsOnThisCell > 0 && gameBoardData.board[i][j].numOfConflictingBulbs <= 0;
    } else {
        if (gameBoardData.board[i][j].number === -1) {
            return true
        } else {
            return checkNeighbouringBulbs(i, j);
        }
    }
}
function checkWon() {
        for (let i = 0; i < gameBoardData.numOfRows; i++) {
        for (let j = 0; j < gameBoardData.numOfColumns; j++) {
            let flag = validate(i, j);
            if (!flag) {
                return false;
            }
        }
    }
    return true;
}
function updateTime() {
    let seconds = gameBoardData.time.seconds;
    let minutes = gameBoardData.time.minutes;
    let hours = gameBoardData.time.hours;
    timer = setInterval(function () {
        seconds = (seconds + 1);
        if (seconds === 60) {
            minutes = minutes + 1;
        }
        if (minutes === 60) {
            hours = hours + 1 % 24;
        }
        seconds = seconds % 60;
        minutes = minutes % 60;

        gameBoardData.time.hours = hours;
        gameBoardData.time.minutes = minutes;
        gameBoardData.time.seconds = seconds;
        time.innerHTML = `${gameBoardData.time.hours > 9 ? gameBoardData.time.hours : `0${gameBoardData.time.hours}`}:${gameBoardData.time.minutes > 9 ? gameBoardData.time.minutes : `0${gameBoardData.time.minutes}`}:${gameBoardData.time.seconds > 9 ? gameBoardData.time.seconds : `0${gameBoardData.time.seconds}`} `;
        if (hours === 23 && minutes === 59 && seconds === 59 || gameState === GameState.WON) {
            clearInterval(timer);
        }
    },
        1000);
}
function illuminateTilesAux(xCounter, yCounter, xCoord, yCoord, color) {
    let flag = true;
    if (gameBoardData.board[xCounter][yCounter].holdsLamb) {
        if (gameBoardData.board[xCounter][yCounter].color === "red") {
            if (color === "white") {
                if (gameBoardData.board[xCounter][yCounter].numOfConflictingBulbs == 1) {
                    gameBoardData.board[xCoord][yCoord].holdsLamb = false;
                    if (xCoord === xCounter && yCoord === yCounter) {
                        gameBoardData.board[xCounter][yCounter].numOfConflictingBulbs--;
                    } else {

                        gameBoardData.board[xCounter][yCounter].numOfConflictingBulbs--;
                        gameBoardData.board[xCoord][yCoord].numOfConflictingBulbs--;
                    }
                    gameBoardData.board[xCoord][yCoord].color = "yellow";
                    gameBoardData.board[xCounter][yCounter].color = "yellow";

                } else {
                    if (xCoord == xCounter && yCoord == yCounter) {
                        if (gameBoardData.board[xCounter][yCounter].numOfConflictingBulbs > 0) {
                            gameBoardData.board[xCounter][yCounter].numOfConflictingBulbs--;
                        }
                    } else {
                        if (gameBoardData.board[xCounter][yCounter].numOfConflictingBulbs > 0) {
                            gameBoardData.board[xCoord][yCoord].numOfConflictingBulbs--;
                            gameBoardData.board[xCounter][yCounter].numOfConflictingBulbs--;

                        }
                    }
                    if (flag) {
                        gameBoardData.board[xCoord][yCoord].holdsLamb = false;
                        gameBoardData.board[xCoord][yCoord].color = "yellow";
                        flag = false;
                    }
                }
                gameBoardData.board[xCounter][yCounter].numOfBulbsWhoseLightIsOnThisCell--;
            } else {
                gameBoardData.board[xCounter][yCounter].numOfBulbsWhoseLightIsOnThisCell++;
                gameBoardData.board[xCounter][yCounter].numOfConflictingBulbs++;
                gameBoardData.board[xCoord][yCoord].color = "red";
                gameBoardData.board[xCounter][yCounter].color = "red";
                gameBoardData.board[xCoord][yCoord].numOfConflictingBulbs++;
            }
        } else {
            gameBoardData.board[xCounter][yCounter].numOfBulbsWhoseLightIsOnThisCell++;
            gameBoardData.board[xCounter][yCounter].numOfConflictingBulbs++;
            gameBoardData.board[xCoord][yCoord].color = "red";
            gameBoardData.board[xCounter][yCounter].color = "red";
            gameBoardData.board[xCoord][yCoord].numOfConflictingBulbs++;
        }
    } else {
        gameBoardData.board[xCounter][yCounter].numOfConflictingBulbs = 0;

        if (color === "yellow") {
            gameBoardData.board[xCounter][yCounter].numOfBulbsWhoseLightIsOnThisCell++;
            gameBoardData.board[xCounter][yCounter].color = color;
        } else {
            if (gameBoardData.board[xCounter][yCounter].numOfBulbsWhoseLightIsOnThisCell === 1) {
                gameBoardData.board[xCounter][yCounter].color = color;
            }
            gameBoardData.board[xCounter][yCounter].numOfBulbsWhoseLightIsOnThisCell--;
        }

    }
}
function illuminateTiles(xCoord, yCoord, color) {
    let xCounter = xCoord;
    let yCounter = yCoord;

    while (yCounter < gameBoardData.numOfColumns && gameBoardData.board[xCounter][yCounter].type === "W") {
        illuminateTilesAux(xCounter, yCounter, xCoord, yCoord, color);
        yCounter++;
    }

    yCounter = yCoord - 1;
    while (yCounter >= 0 && gameBoardData.board[xCounter][yCounter].type === "W") {
        illuminateTilesAux(xCounter, yCounter, xCoord, yCoord, color);
        yCounter--;
    }

    yCounter = yCoord;
    xCounter = xCoord + 1;
    while (xCounter < gameBoardData.numOfRows && gameBoardData.board[xCounter][yCounter].type === "W") {
        illuminateTilesAux(xCounter, yCounter, xCoord, yCoord, color);

        xCounter++;
    }

    xCounter = xCoord - 1;
    while (xCounter >= 0 && gameBoardData.board[xCounter][yCounter].type === "W") {
        illuminateTilesAux(xCounter, yCounter, xCoord, yCoord, color);
        xCounter--;
    }
}
function updateGameBoardData(xCoord, yCoord, color) {
    illuminateTiles(xCoord, yCoord, color);
}
// Genrators
function genTds(row) {
    return row.map(cell =>
        cell.type === 'W' ? `
        <td 
        ${cell.holdsLamb ? `data-id="bulb"` : `data-id="cell"`} 
        ${`style= "background-color: ${cell.color};"`}
        >
        ${cell.holdsLamb ? `<img src="../resources/bulb.png" alt="bulb" style= "height:90%; width:%; background-color:${cell.color};">`
                : ''
            }
         </td>`:
            `<td  style= "background-color: black; color: ${validate(cell.position.x, cell.position.y) ? "green" : "white"};font-size: 1.5em;">
        ${cell.number !== -1 ? cell.number : ''}</td>`).join("");
}
function genTable(board) {
    return board.map(row => `<tr>${genTds(row)}</tr>`).join("");
}
function genBlackCells(level) {
    switch (level) {
        case "Easy":
            // -1 represents that there is no number on the black cell
            return [new BlackCell(1, new Position(0, 3)), new BlackCell(0, new Position(1, 1)), new BlackCell(2, new Position(1, 5)), new BlackCell(-1, new Position(3, 0)), new BlackCell(-1, new Position(3, 3)), new BlackCell(-1, new Position(3, 6)), new BlackCell(-1, new Position(5, 1)), new BlackCell(2, new Position(5, 5)), new BlackCell(3, new Position(6, 3))];
        case "Advanced":
            return [new BlackCell(0, new Position(0, 2)), new BlackCell(-1, new Position(0, 4)), new BlackCell(-1, new Position(2, 0)), new BlackCell(-1, new Position(2, 2)),
            new BlackCell(3, new Position(2, 4)), new BlackCell(-1, new Position(2, 6)), new BlackCell(1, new Position(3, 3)), new BlackCell(2, new Position(4, 0)), new BlackCell(-1, new Position(4, 2)), new BlackCell(-1, new Position(4, 4)), new BlackCell(-1, new Position(4, 6)), new BlackCell(-1, new Position(6, 2)), new BlackCell(2, new Position(6, 4))]
        case "Extreme":
            return [new BlackCell(-1, new Position(0, 1)), new BlackCell(3, new Position(1, 5)), new BlackCell(2, new Position(1, 7)), new BlackCell(-1, new Position(1, 9)),
            new BlackCell(0, new Position(2, 1)), new BlackCell(-1, new Position(2, 2)), new BlackCell(-1, new Position(2, 7)), new BlackCell(-1, new Position(3, 4)), new BlackCell(1, new Position(4, 1)), new BlackCell(-1, new Position(4, 4)), new BlackCell(1, new Position(4, 5)), new BlackCell(-1, new Position(4, 6)), new BlackCell(-1, new Position(5, 3)),
            new BlackCell(-1, new Position(5, 4)), new BlackCell(-1, new Position(5, 5)), new BlackCell(3, new Position(5, 8)), new BlackCell(-1, new Position(6, 5))
                , new BlackCell(1, new Position(7, 2)), new BlackCell(0, new Position(7, 7)), new BlackCell(-1, new Position(7, 8)), new BlackCell(3, new Position(8, 0)), new BlackCell(-1, new Position(8, 2)), new BlackCell(0, new Position(8, 4)), new BlackCell(0, new Position(9, 8))]
    }
}