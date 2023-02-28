let defaultGameTime = 2400; //second
let boomsCountOnTable = 200; 

let minutesBlock = document.querySelector('.sapper-minutes');
let secondBlock = document.querySelector('.sapper-seconds');
let mainButton = document.querySelector('.sapper-button');

const startTimer = () => {
 let gamePastTense = 0;
 return setInterval(()=>{
  gamePastTense++;
  
  if(gamePastTense >= defaultGameTime) {
    alert('Время вышло! Попробуй еще разок :)');
    startGame(16,16,boomsCountOnTable); 
    gamePastTense = 0;
    return;
  }

  const timeLeft = defaultGameTime - gamePastTense;
  const minutesLeft = Math.floor(timeLeft/60);
  const minutesLeftText = minutesLeft>10?String(minutesLeft):'0'+String(minutesLeft);
  const secondsLeft = timeLeft%60;
  const secondsLeftText = secondsLeft>10?String(secondsLeft):'0'+String(secondsLeft);
  
  const minutesPair = minutesBlock.querySelectorAll('span');
  const secondsPair = secondBlock.querySelectorAll('span');

  for(let i = 1;i<minutesPair.length;i++){
   minutesPair[i].className = '';
   minutesPair[i].classList.add(`time-0${minutesLeftText.split('')[i-1]}`);
  }
  for(let i = 1;i<secondsPair.length;i++){
   secondsPair[i].className = '';
   secondsPair[i].classList.add(`time-0${secondsLeftText.split('')[i-1]}`);
  }

},1000)
};

function restartTimer(){
  const minutesPair = minutesBlock.querySelectorAll('span');
  const secondsPair = secondBlock.querySelectorAll('span');
  minutesPair[1].className = '';
  minutesPair[1].classList.add('time-04');
  minutesPair[2].className = '';
  minutesPair[2].classList.add('time-00');
  secondsPair[1].className = '';
  secondsPair[1].classList.add('time-00');
  secondsPair[2].className = '';
  secondsPair[2].classList.add('time-00');
}

startGame(16,16,boomsCountOnTable); // width Table, height Table, bomb count on table
let endGame = false;

let timerController = undefined;
function startGame(width,height,boomsCount){
  const field = document.querySelector('.sapper-fields');

  const cellsCount = width*height;

  let closedCount = cellsCount;

  field.innerHTML = '<button class="close-cell"></button>'.repeat(cellsCount);
  const allCells = [...field.children];

  const bombs = [...Array(cellsCount).keys()]
    .sort(()=> Math.random() - 0.5)
      .slice(0,boomsCount);

  field.addEventListener('click',e=>clickToCell(e));

  mainButton.addEventListener('click',restartGame);

  function restartGame(){
    if(cellsCount === closedCount) return;
    endGame = false;
    mainButton.querySelector('span').className = '';
    mainButton.querySelector('span').classList.add('smile-default');
    clearInterval(timerController);
    timerController = undefined;
    mainButton.removeEventListener('click',restartGame);
    restartTimer();
    startGame(16,16,boomsCountOnTable);
  }

  function clickToCell(e){
    if(e.target.tagName !== 'BUTTON' || endGame) return;
    if(timerController === undefined){
      timerController = startTimer();
    }
    const index = allCells.indexOf(e.target);
    const column = index % width;
    const row = Math.floor(index/width);
    openCell(row,column);
  }

  function minesAroundCell(row,column){
    let count = 0;
    for(let x = -1;x<=1;x++){
      for(let y = -1;y<=1;y++){
        if(isCellWithBomb(row + y,column+x)){
          count++;
        }
      }
    }

    return count;
  }

  function openCell(row,column){
    if(!isValidCell(row,column)) return;
    const index = row*width + column;
    const cell = allCells[index];
    if(!cell.classList.contains('close-cell') && !isCellMarked(cell)) return;
    if(closedCount === cellsCount){
      if(isCellWithBomb(row,column)){
        bombs.splice(bombs.indexOf(index),1);
      }
    }
    closedCount--;
    if(!isCellWithBomb(row,column)){
      cell.className = '';
      const countMinesAround = minesAroundCell(row,column);

      if(countMinesAround === 0){
        cell.classList.add('open-cell');
        for(let x = -1;x<=1;x++){
          for(let y = -1;y<=1;y++){
              openCell(row + y,column + x);
          }
        }
      }else{
        cell.classList.add(`around-0${countMinesAround}`);
      }
    }else{
      lossGame(cell);
    }

    if(closedCount<=boomsCount){
      mainButton.querySelector('span').className = '';
      mainButton.querySelector('span').classList.add('smile-win');
      field.removeEventListener('mouseup',mouseUpHandler);
      stopGame();
    }
  }


  function lossGame(cell){
    cell.className = '';
    cell.classList.add('mines-click');
    mainButton.querySelector('span').className = '';
    mainButton.querySelector('span').classList.add('smile-dead');
    field.removeEventListener('mouseup',mouseUpHandler);
    stopGame();
  }

  function stopGame(){  
    showAllBombs();
    if(timerController!==undefined){
      clearInterval(timerController);
    }
    endGame = true;
  }

  function showAllBombs(){
    for(let i = 0;i<bombs.length;i++){
      if(allCells[bombs[i]].classList.contains('flag')){
        allCells[bombs[i]].className = '';
        allCells[bombs[i]].classList.add('bomb-search');
      }else{
        allCells[bombs[i]].className = '';
        allCells[bombs[i]].classList.add('show-bombs');
      }
    }
  }

  function isValidCell(row,column){
    return row>=0
      && row < height
      && column >= 0
      && column < width;
  }

  function isCellWithBomb(row,column){
    if(!isValidCell(row,column)) return false;
    const index = row*width + column;
    return bombs.includes(index);
  }
}

document.body.oncontextmenu = (e) =>{
  return false;
}

function mouseUpHandler(){
  if(endGame) return;
  mainButton.querySelector('span').className = '';
  mainButton.querySelector('span').classList.add('smile-default');
}

function mouseDowHandler(e){
  if(endGame) return;
  if(e.button == '0' && (e.target.classList.contains('close-cell') || isCellMarked(e.target))){
    mainButton.querySelector('span').className = '';
    mainButton.querySelector('span').classList.add('smile-scary');
  }
  if(e.button == '2' 
  && (e.target.classList.contains('close-cell') || isCellMarked(e.target))){
    if(e.target.classList.contains('question-full')){
      e.target.classList.remove('question-full');
      e.target.classList.add('question-empty');
    }
    if(e.target.classList.contains('flag')){
      e.target.classList.remove('flag');
      e.target.classList.add('question-full');
    }
    if(e.target.classList.contains('close-cell')){
      e.target.classList.remove('close-cell');
      e.target.classList.add('flag');
    }
  }
}

function isCellMarked(cell){
  return cell.classList.contains('question-empty') 
  || cell.classList.contains('flag')
  || cell.classList.contains('question-full')
}


document.body.addEventListener('mouseup',e=>{
    mouseUpHandler(e);
});
document.body.addEventListener('mousedown',e=>{
  mouseDowHandler(e);
})