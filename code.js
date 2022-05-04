let board = [];
let check;
let blocks;
let playing = false;
let clicked = false;
let sizeArray = {mode1: 81,mode2: 225,mode3: 441, mode4: 1089}
let bombArray = {81: 10,225: 40,441: 90,1089:250}
let maxBlocks = 1089
placeleboard(81)

function drawBoard() {
  
  for (let i = 1; i <= maxBlocks; i++) {
    try {
      if(i%2==0) $('#' + i).css('background-color', '#060')
      else $('#' + i).css('background-color', '#040')
      if (board[i - 1].shown == true) {
        if(i%2==0) $('#' + i).css('background-color', '#666')
        else $('#' + i).css('background-color', '#444');
        if (board[i - 1].amntOfBombs != 0 && !board[i - 1].bomb) $(`#${i}p`).html(board[i - 1].amntOfBombs);
        switch (board[i - 1].amntOfBombs) {
          case 1:
            $(`#${i}p`).css("color", "#4287c5");
            break;
          case 2:
            $(`#${i}p`).css("color", "#069518");
            break;
          case 3:
            $(`#${i}p`).css("color", "#cc0000");
            break;
          case 4:
            $(`#${i}p`).css("color", "#7c0091");
            break;
          case 5:
            $(`#${i}p`).css("color", "#6e0000");
            break;
          case 6:
            $(`#${i}p`).css("color", "#00bf93");
            break;
          case 7:
            $(`#${i}p`).css("color", "#080808");
            break;
          case 8:
            $(`#${i}p`).css("color", "#424242");
            break;
          default:
        }
      }
      if (board[i - 1].shown == true && board[i - 1].bomb == true)
        $("#" + i).css("background", "red");
    } catch (e) {}
  }
}

$(".modes").click(function() {
  
  $("#mode1").css("background-color", "#333");
  $("#mode2").css("background-color", "#333");
  $("#mode3").css("background-color", "#333");
  $("#mode4").css("background-color", "#333");
  $("#" + this.id).css("background-color", "#666");
  placeleboard(sizeArray[this.id]);
});

/* $('.body').mousedown(function(event) {
  switch (event.which) {
    case 1:
      alert('Left Mouse button pressed.');
      break;
    case 2:
      $(this.id).css("background-color", "black")
      break;
  }
}); */
$("body").on("click", ".block", function() {
  click(this.id);
});

function click(id) {
  if (!clicked && (board[id - 1].amntOfBombs != 0 || board[id-1].bomb == true)) {
    redoBoard(blocks, id)
  } 
  clicked = true
  id = parseInt(id)
  if (!playing) return;
  if (board[id - 1].bomb == true) {
    board[id - 1].shown = true;
    drawBoard();
    lost();
    return;
  }
  if (board[id - 1].amntOfBombs == 0) recurse(id, 0)
  board[id - 1].shown = true;
  let shownBlocks = 0;
  board.forEach((a) => {
    if (a.shown) shownBlocks++
  })
  console.log(`${shownBlocks} ${blocks-bombArray[blocks]}`)
  drawBoard();
  if (shownBlocks == blocks-bombArray[blocks]) win();
}

function recurse(id) {
  if (board[id - 1].exposed == true) return;
  let row1 = Math.floor((id + Math.sqrt(blocks) - 1) / Math.sqrt(blocks));
  check.forEach((a) => {
    let row2 = Math.floor((id + a + Math.sqrt(blocks) - 1) / Math.sqrt(blocks));
    if (
      board[id - 1 + a] != null &&
      ((a < -1 && row1 - 1 == row2) ||
        ((a == -1 || a == 1) && row1 == row2) ||
        (a > 1 && row1 + 1 == row2))
    ) {
      board[id - 1 + a].shown = true
      board[id - 1].exposed = true
      if (board[id + a - 1].amntOfBombs == 0 && board[id + a - 1].exposed != true) recurse(id + a)
    }
  })
}

function placeleboard(mode, redo, id) {
  $("html").removeClass('lost')
  $("html").removeClass('win')
  $("#result").text("placeholder")
  clicked = false
  playing = true
  board = []
  for (let i = 1; i <= maxBlocks; i++) {
    $("#" + i).remove();
  }
  blocks = mode;
  check = [(Math.sqrt(blocks) * -1) - 1, Math.sqrt(blocks) * -1, (Math.sqrt(blocks) * -1) + 1, -1, 1, Math.sqrt(blocks) - 1, Math.sqrt(blocks), Math.sqrt(blocks) + 1]
  for (let i = 1; i <= blocks; i++) {
    board[i - 1] = {
      bomb: false,
      shown: false,
      amntOfBombs: 0,
      exposed: false,
      id:0
    };
    $("body").append(
      $(
        `<div id=${i} class='block' style='height:calc(50vw/${Math.sqrt(blocks)}); width:calc(50vw/${Math.sqrt(blocks)}); max-width: ${720/Math.sqrt(blocks)}px;  max-height: ${720/Math.sqrt(blocks)}px;'><p id=${
          i + "p"
        }></p></div>`
      )
    );
  }
  createBombs(bombArray[mode])
  for (let i = 1; i <= blocks; i++) {
    let row1 = Math.floor((i + Math.sqrt(blocks) - 1) / Math.sqrt(blocks));
    check.forEach((a) => {
      let row2 = Math.floor((i + a + Math.sqrt(blocks) - 1) / Math.sqrt(blocks));
      if (
        board[i - 1 + a] != null &&
        board[i - 1 + a].bomb == true &&
        ((a < -1 && row1 - 1 == row2) ||
          ((a == -1 || a == 1) && row1 == row2) ||
          (a > 1 && row1 + 1 == row2))
      )
        board[i - 1].amntOfBombs += 1;
    });
    board[i-1].id = i
    if(board[i - 1].amntOfBombs >5 && !board[i-1].bomb) {
      console.log(board[i - 1].amntOfBombs + " " + board[i - 1].id)
    }
  }
  drawBoard()
}

function redoBoard(mode, id) {
  board = []
  for (let i = 1; i <= blocks; i++) {
    board[i - 1] = {
      bomb: false,
      shown: false,
      amntOfBombs: 0,
      exposed: false,
      id: 0
    };
  }
  createBombs(bombArray[mode])
  for (let i = 1; i <= blocks; i++) {
    let row1 = Math.floor((i + Math.sqrt(blocks) - 1) / Math.sqrt(blocks));
    check.forEach((a) => {
      let row2 = Math.floor((i + a + Math.sqrt(blocks) - 1) / Math.sqrt(blocks));
      if (
        board[i - 1 + a] != null &&
        board[i - 1 + a].bomb == true &&
        ((a < -1 && row1 - 1 == row2) ||
          ((a == -1 || a == 1) && row1 == row2) ||
          (a > 1 && row1 + 1 == row2))
      )
        board[i - 1].amntOfBombs += 1;
    });
    board[i-1].id = i
    if(board[i - 1].amntOfBombs >6 && !board[i-1].amntOfBombs) {
      console.log(board[i - 1].amntOfBombs + " " + board[i - 1].id)
    }
  }
  if (board[id - 1].amntOfBombs != 0 || board[id-1].bomb == true) redoBoard(mode, id)
}

function win() {
  $("html").addClass('win')
  $("#result").text("YOU WIN");
  board.forEach((a) => {
    if (a.bomb) $(`#${a.id}`).css("background-color", "gree")
  })
  playing = false;
}

function lost() {
  $("html").addClass('lost')
  board.forEach((a) => {
    if (a.bomb) $(`#${a.id}`).css("background-color", "red")
  })
  $("#result").text("you lost");
  playing = false;
}
const flagSprite =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAGNJREFUOE9jZKAQMGLT//c/w3+QODMjA1Z5ZD0YCmCaYYoIGYLVhsWLF4NdEBsbS7oLQBphBsTExoL8gNcQvC4AGQADuAwi2gBcBpFsALpBJBuA7hWiDSA7DCiKBYrTwQgxAAAw+zoR6oCIdQAAAABJRU5ErkJgggAA";


function createBombs(int){
  for (let a = 1; a <= int; a++) {
    let ara = Math.floor(Math.random() * blocks)
    if(board[ara].bomb == false) board[ara].bomb = true;
    else {createBombs(1)}
  }
}