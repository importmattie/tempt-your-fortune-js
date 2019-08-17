var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var screenStopped = false;
var moneyUpdated = true;
var whomperedOut = false;

var lastTime = Date.now();
var spins = 1;
var money = 0;
var whompers = 0;

var squareShuffleFreq = 700;
var sinceShuffle = 1000;
var shuffleOdds = 0.8;
var whomperOdds = 0.5;
var spinOdds = 0.2;

var squareChangeFreq = 300;
var sinceSquareChange = squareChangeFreq;
var currentSquare = 0;

var squareSideLength = 80;
var squarePadding = 20;
var squareXY = [];

var whomperSideLength = 60;
var whomperPadding = 40;
var whomperXY = [];

var s = 0;

// Build the square location info
// Top-left across
for (i=0; i < 6; i++) {
  squareXY[s] = [
    squarePadding+((squareSideLength+squarePadding)*i),
    squarePadding
  ];
  s++;
}

// Top-right down
for (j=1; j < 4; j++) {
  squareXY[s] = [
    squarePadding+((squareSideLength+squarePadding)*5),
    squarePadding+((squareSideLength+squarePadding)*j)
  ];
  s++;
}

// Bottom-right across (backwards)
for (i=5; i > -1; i--) {
  squareXY[s] = [
    squarePadding+((squareSideLength+squarePadding)*i),
    squarePadding+((squareSideLength+squarePadding)*4)
  ];
  s++;
}

// Bottom-left up
for (j=3; j > 0; j--) {
  squareXY[s] = [
    squarePadding,
    squarePadding+((squareSideLength+squarePadding)*j)
  ];
  s++;
}

// Build whomper Locations
for (i = 0; i < 4; i++) {
  // todo - fix so we don't need a manual div 4 correction here
  whomperXY[i] = [
    whomperPadding + ((whomperSideLength+whomperPadding)*(i+1)) - whomperPadding/4,
    whomperPadding + ((whomperSideLength+whomperPadding)) - whomperPadding/4
  ];
}

colorChoices = [
  '#FF4444',
  '#44FF44',
  '#44FFFF',
  '#4444FF',
  '#FF44FF',
  '#8844FF'
];

var squareValues = [];
var activeSquares = [];
for (i=0; i < squareXY.length; i++) {
  squareValues[i] = [];
  squareValues[i]['colors'] = [
    colorChoices[parseInt(Math.random()*colorChoices.length)],
    colorChoices[parseInt(Math.random()*colorChoices.length)],
    colorChoices[parseInt(Math.random()*colorChoices.length)],
  ];
  squareValues[i]['value'] = [
    1000+(parseInt(Math.random()*400))*10,
    1000+(parseInt(Math.random()*400))*10,
    1000+(parseInt(Math.random()*400))*10
  ];
  squareValues[i]['spin'] = [
    Math.random() < spinOdds,
    Math.random() < spinOdds,
    Math.random() < spinOdds
  ];
  squareValues[i]['text'] = [
    '$' + squareValues[i]['value'][0] + (squareValues[i]['spin'][0] ? ' +Spin' : ''),
    '$' + squareValues[i]['value'][1] + (squareValues[i]['spin'][1] ? ' +Spin' : ''),
    '$' + squareValues[i]['value'][2] + (squareValues[i]['spin'][2] ? ' +Spin' : ''),
  ];
  squareValues[i]['font'] = [
    "bold 20px Arial",
    "bold 20px Arial",
    "bold 20px Arial",
  ];

  if (Math.random() < whomperOdds) {
    squareValues[i]['colors'][2] = '#FFDD22';
    squareValues[i]['value'][2] = -999999;
    squareValues[i]['spin'][2] = false;
    squareValues[i]['text'][2] = "WHOMPER!";
    squareValues[i]['font'][2] = "bold 14px Arial";
  }

  activeSquares[i] = parseInt(Math.random()*3);
}

// prizes overrides
var prizeSquareDeck = Array.from({length: squareXY.length}, (x,i) => i);
prizeSquareDeck.splice(3, 1);
for (i=0; i < 7; i++) {
  prizeSquare = prizeSquareDeck.shift();
  squareValues[prizeSquare]['colors'][0] = '#BB0000';
  squareValues[prizeSquare]['value'][0] = 5000 + parseInt((Math.random()*50)*100);
  squareValues[prizeSquare]['spin'][0] = false;
  squareValues[prizeSquare]['text'][0] = getPrizeName();
  squareValues[prizeSquare]['font'][0] = "bold 14px Arial";
}

// mondo money overrides
mondoMoneySquare = 4-1;
squareValues[mondoMoneySquare]['colors'] = [
  colorChoices[parseInt(Math.random()*colorChoices.length)],
  colorChoices[parseInt(Math.random()*colorChoices.length)],
  colorChoices[parseInt(Math.random()*colorChoices.length)],
];
squareValues[mondoMoneySquare]['value'] = [6000, 8000, 10000];
squareValues[mondoMoneySquare]['spin'] = [true, true, true];
squareValues[mondoMoneySquare]['text'] = [
  '$' + squareValues[mondoMoneySquare]['value'][0] + (squareValues[mondoMoneySquare]['spin'][0] ? ' +Spin' : ''),
  '$' + squareValues[mondoMoneySquare]['value'][1] + (squareValues[mondoMoneySquare]['spin'][1] ? ' +Spin' : ''),
  '$' + squareValues[mondoMoneySquare]['value'][2] + (squareValues[mondoMoneySquare]['spin'][2] ? ' +Spin' : ''),
];
squareValues[mondoMoneySquare]['font'] = [
  "bold 20px Arial",
  "bold 20px Arial",
  "bold 20px Arial",
];

document.addEventListener('keydown', function(event) {
  console.log(event.key);
  if (event.key === 'Enter') {
    screenStopped = !screenStopped;
    // Set money update flag if screen was just stopped
    if (screenStopped) moneyUpdated = false;
    // Reset whomperedOut if player hits space on "lose" screen
    if (whomperedOut) whomperedOut = false;
  } else if (event.key === 's') {
    spins += 1;
  } else if (event.key === 'a') {
    spins -= 1;
  } else if (event.key === 'w') {
    whompers += 1;
  } else if (event.key === 'q') {
    whompers -= 1;
  } else if (event.key === 'm') {
    while (true) {
      moneyInput = prompt("Enter new money value:");
      if (isNaN(parseInt(moneyInput))) {
        alert("That was not a valid number - try again!");
      } else {
        money = parseInt(moneyInput);
        break;
      }
    }
  }
});

function getPrizeName() {
  // [adj] [noun]

  tripType = Math.random();

  if (tripType < 0.25) {
    // __ for a year
    var thingsForAYear = [
      'Milk',
      'Charmin',
      'Butter',
      'Wendy\'s',
      'Pants',
      'Weenies',
      'Gas',
      'Mowing',
      'Friskies',
      'Polish'
    ];
    return 'Year of ' + thingsForAYear[parseInt(Math.random()*thingsForAYear.length)];
  } else if (tripType < 0.5) {
    // [art] of [something]
    var art = [
      'Poster of ',
      'Statue of ',
      'Painting of ',
      'Bust of ',
      'Song about ',
      'Musical about ',
      'Movie about ',
      'Tattoo of ',
      'Novel about '
    ];
    var something = [
      'You',
      'Wife',
      'Husband',
      'Child',
      'Pappy',
      'Cat',
      'Dog',
      'House',
      'Fish',
      'Momma',
      'Llama',
      'Surgery'
    ];
    return art[parseInt(Math.random()*art.length)] + something[parseInt(Math.random()*something.length)];
  } else if (tripType < 0.75) {
    // [transportation] to [place]
    var transportation = [
      'Cruise to ',
      'Train through ',
      'Tour of ',
      'Girls Trip: ',
      'Casino in ',
      'Hiking through ',
      'Camping in ',
      'Bus to '
    ];
    var place = [
      'Siberia',
      'Paris',
      'Rome',
      'Tokyo',
      'Peru',
      'Antarctica',
      'Nebraska',
      'Delhi',
      'Jersey',
      'Bowie',
      'Atlantis'
    ];
    return transportation[parseInt(Math.random()*transportation.length)] + place[parseInt(Math.random()*place.length)];
  } else {
    var adjs = [
      'Electric',
      'Musical',
      'Personal',
      'Cleaning',
      'Relaxing',
      'Luxurious',
      'Slippery',
      'New',
      'Sticky',
      'Antique',
      'Natural',
      'Easy'
    ];
    var nouns = [
      'Car',
      'Table',
      'Lamp',
      'Sofa',
      'Guitar',
      'Piano',
      'Billiards',
      'Arcade',
      'Boat',
      'Truck',
      'School'
    ];
    return adjs[parseInt(Math.random()*adjs.length)] + ' ' + nouns[parseInt(Math.random()*nouns.length)];
  }
}

function update() {
  var currentTime = Date.now();
  var elapsed = 0;

  if (whomperedOut) {
    drawGameOver();
    return;
  }

  if (!screenStopped) {
    elapsed = currentTime - lastTime;
    sinceSquareChange += elapsed;
    sinceShuffle += elapsed;
  } else if (!moneyUpdated) {
    updateMoney();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  shuffleSquares();
  updateCurrentSquare();
  drawSubstantialScreen();
  drawMoney();
  drawWhompers();

  lastTime = currentTime;
}

setInterval(update, 10);

function drawGameOver() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#FFDD22";
  ctx.fill();
  ctx.closePath();

  ctx.textAlign = "center";
  ctx.font = "bold 36px Arial";
  ctx.fillStyle = "#FF0000";
  ctx.fillText(
    "You Whompered Out!",
    canvas.width/2,
    canvas.height/2 - 20
  );
  ctx.fillText(
    "Game Over!",
    canvas.width/2,
    canvas.height/2 + 20
  );
}

function updateMoney() {
  if (!squareValues[currentSquare]['spin'][activeSquares[currentSquare]]) spins -= 1;

  money = Math.max(
    0,
    money + squareValues[currentSquare]['value'][activeSquares[currentSquare]]
  );

  if (money == 0) {
    whompers += 1;
    if (whompers == 4) {
      spins = 1;
      money = 0;
      whompers = 0;
      whomperedOut = true;
    }
  }
  moneyUpdated = true;
}

function shuffleSquares() {
  if (sinceShuffle > squareShuffleFreq) {
    // Change the squares!
    for (i = 0; i < squareXY.length; i++) {
      if (Math.random() < shuffleOdds) {
        var newSquare = activeSquares[i];
        while (newSquare == activeSquares[i]) {
          newSquare = parseInt(Math.random()*3);
        }
        activeSquares[i] = newSquare;
      }
    }
    sinceShuffle = 0;
  }
}

function updateCurrentSquare() {
  if (sinceSquareChange > squareChangeFreq) {
    var newSquare = currentSquare;
    while (newSquare == currentSquare) {
      newSquare = parseInt(Math.random()*squareXY.length);
    }
    currentSquare = newSquare;
    sinceSquareChange = 0;
  }
}

function drawSubstantialScreen() {
  for (i = 0; i < squareXY.length; i++) {
    ctx.beginPath();
    ctx.rect(squareXY[i][0], squareXY[i][1], squareSideLength, squareSideLength);
    ctx.fillStyle = squareValues[i]["colors"][activeSquares[i]];
    ctx.fill();
    if (currentSquare === i) {
      ctx.lineWidth = "10";
      ctx.strokeStyle = "yellow";
      ctx.stroke();
    }
    ctx.closePath();

    ctx.textAlign = "center";
    ctx.font = squareValues[i]['font'][activeSquares[i]];
    ctx.fillStyle = "#FFFFFF";

    textArray = squareValues[i]['text'][activeSquares[i]].split(" ");
    if (textArray.length == 1) {
      ctx.fillText(
        textArray[0],
        squareXY[i][0] + squareSideLength/2,
        squareXY[i][1] + squareSideLength/2 + 5
      );
    } else if (textArray.length == 2) {
      ctx.fillText(
        textArray[0],
        squareXY[i][0] + squareSideLength/2,
        squareXY[i][1] + squareSideLength/2 - 5
      );
      ctx.fillText(
        textArray[1],
        squareXY[i][0] + squareSideLength/2,
        squareXY[i][1] + squareSideLength/2 + 15
      );
    } else {
      ctx.fillText(
        textArray[0],
        squareXY[i][0] + squareSideLength/2,
        squareXY[i][1] + squareSideLength/2 - 15
      );
      ctx.fillText(
        textArray[1],
        squareXY[i][0] + squareSideLength/2,
        squareXY[i][1] + squareSideLength/2 + 5
      );
      ctx.fillText(
        textArray[2],
        squareXY[i][0] + squareSideLength/2,
        squareXY[i][1] + squareSideLength/2 + 25
      );
    }

  }
}

function drawMoney() {
  ctx.textAlign = "center";
  ctx.font = "bold 24px Arial";

  ctx.fillText(
    "Spins: " + spins,
    canvas.width/2,
    canvas.height/2 - 20
  );
  ctx.fillText(
    "$" + money,
    canvas.width/2,
    canvas.height/2 + 20
  );
}

function drawWhompers() {
  for (i = 0; i < whompers; i++) {
    ctx.beginPath();
    ctx.rect(whomperXY[i][0], whomperXY[i][1], whomperSideLength, whomperSideLength);
    ctx.fillStyle = "#FFDD22";
    ctx.fill();
    ctx.closePath();
  }
}
