let board = [];
let check;
let blocks;
let playing = false;
let clicked = false;
let sizeArray = {
  mode1: 81,
  mode2: 225,
  mode3: 441,
  mode4: 1089
}
let bombArray = {
  81: 10,
  225: 40,
  441: 90,
  1089: 250
}
let maxBlocks = 1089
placeleboard(81)

function drawBoard() {

  for (let i = 1; i <= maxBlocks; i++) {
    try {
      if (i % 2 == 0) $('#' + i).css('background-color', '#060')
      else $('#' + i).css('background-color', '#040')
      if (board[i - 1].shown == true) {
        if (i % 2 == 0) $('#' + i).css('background-color', '#666')
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

$('div').mousedown(function(event) {
  if (event.which == 3) {
    if ($("#" + this.id + "i").length == 0 && !board[this.id-1].shown) addFlag(this.id, this.id)
    else removeFlag(this.id)
  }
});
$("body").on("click", ".block", function() {
  click(this.id);
});

function click(id) {
  id = parseInt(id)
  if (!clicked && (board[id - 1].amntOfBombs != 0 || board[id - 1].bomb == true)) {
    redoBoard(blocks, id)
  }
  clicked = true
  if ($("#" + id + "i").length != 0) return;
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
  if (shownBlocks == blocks - bombArray[blocks]) win();
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
      $(`#${id+a}i`).remove()
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
      id: 0
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
    board[i - 1].id = i
    if (board[i - 1].amntOfBombs > 5 && !board[i - 1].bomb) {
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
    board[i - 1].id = i
    if (board[i - 1].amntOfBombs > 6 && !board[i - 1].amntOfBombs) {
      console.log(board[i - 1].amntOfBombs + " " + board[i - 1].id)
    }
  }
  if (board[id - 1].amntOfBombs != 0 || board[id - 1].bomb == true) redoBoard(mode, id)
}

function win() {
  $("html").addClass('win')
  $("#result").text("YOU WIN");
  board.forEach((a) => {
    if (a.bomb) $(`#${a.id}`).css("background-color", "green")
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
const flagSprite = "data:image/png;base64,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";


function createBombs(int) {
  for (let a = 1; a <= int; a++) {
    let ara = Math.floor(Math.random() * blocks)
    if (board[ara].bomb == false) board[ara].bomb = true;
    else {
      createBombs(1)
    }
  }
}


function addFlag(containerId, imageId) {
	console.log(imageId)
  var img = $(`<img src="${flagSprite}" class="flag" id="${imageId}i" style='height:calc(50vw/${Math.sqrt(blocks)}); width:calc(50vw/${Math.sqrt(blocks)}); max-width: ${720/Math.sqrt(blocks)}px;  max-height: ${720/Math.sqrt(blocks)}px;'></img>`)
  $(`#${imageId}`).append(img)
  return imageId;
}

function removeFlag(imageId) {
  $(`${imageId}i`).remove()
}
