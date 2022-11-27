let board = [];
let flags = 0;
let check;
let blocks;
let playing = false;
let clicked = false;
let timer = 0;
let highscore = {
  81: 0,
  225: 0,
  441: 0,
  1089: 0
};
let timerval = null;
const sizeArray = {
  mode1: 81,
  mode2: 225,
  mode3: 441,
  mode4: 1089
};
const bombArray = {
  25: 5,
  36: 6,
  49: 7,
  64: 8,
  81: 10,
  100: 20,
  144: 30,
  225: 40,
  256: 50,
  289: 70,
  324: 80,
  361: 90,
  400: 100,
  441: 110
};

const maxBlocks = 1089
let pressedKeys = []
let colors = [];
let currentMode = 25;

//keys
window.onkeydown = function(e) {
  const index = pressedKeys.indexOf(e.keyCode);
  if (index == -1) { // only splice array when item is found
    pressedKeys.push(e.keyCode);
  }
}
window.onkeyup = function(e) {
  const index = pressedKeys.indexOf(e.keyCode);
  if (index > -1) { // only splice array when item is found
    pressedKeys.splice(index, 1); // 2nd parameter means remove one item only
  }
}


function init() {
  debug('init start')
  let thing = [0, 1, 0, 1, 0, 1];
  $('.modes').remove();

  $("body").append($("<table id='moddedModes' style='text-align: left; top: 15%; color: white; left: 0%; position: absolute;'></table>"));
  highscore = {}
  for (const [key, value] of Object.entries(bombArray)) {
    debug(`density ${value/key}. ${key}`)
    $('#moddedModes').append($(`<button class='moddedModes' id='blocks${key}' >${Math.sqrt(key)}x${Math.sqrt(key)} (${value})</button><br>`));
    highscore[key] = 0;
  }
  $("#moddedModes").on("click", ".moddedModes", function() {
    let id = this.id;
    id = id.slice(6);
    placeleboard(id);
  });

  placeleboard(25);
  debug("init end")
}

function drawBoard() {
  let lane = 1;
  for (let i = 1; i <= blocks; i++) {
    if (board[i - 1].shown == true) {
      if (lane % 2 == 0 && i % 2 == (parseInt(blocks) + 1) % 2) $('#' + i).css('background-color', '#666');
      else if (lane % 2 == 1 && i % 2 == 0) $('#' + i).css('background-color', '#666');
      else $('#' + i).css('background-color', '#444');
      if (i % Math.sqrt(blocks) == 0) {
        if (lane == 1) lane = 2;
        else if (lane == 2) lane = 1;
      }
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
      if (board[i - 1].bomb == true) $("#" + i).css("background", "red");
    } else {
      if (lane % 2 == 0 && i % 2 == (parseInt(blocks) + 1) % 2) $('#' + i).css('background-color', '#060');
      else if (lane % 2 == 1 && i % 2 == 0) $('#' + i).css('background-color', '#060');
      else $('#' + i).css('background-color', '#040');
      if (i % Math.sqrt(blocks) == 0) {
        if (lane == 1) lane = 2;
        else if (lane == 2) lane = 1;
      }
    }
    if (colors[i] != "") $("#" + i).css("background", colors[i]);
  }
}

$(".modes").click(function() {

  $(".modes").css("background-color", "#333");
  $("#" + this.id).css("background-color", "#666");
  placeleboard(sizeArray[this.id]);
  currentMode = this.id
});

$("body").on("mousedown", ".block", function(e) {
  switch (pressedKeys[0]) {
    case 65:
      if (colors[this.id] == "#f44") colors[this.id] = "";
      else colors[this.id] = "#f44"
      drawBoard()
      return;
    case 83:
      if (colors[this.id] == "#ff4") colors[this.id] = "";
      else colors[this.id] = "#ff4"
      drawBoard()
      return;
    case 68:
      if (colors[this.id] == "#4f4") colors[this.id] = "";
      else colors[this.id] = "#4f4"
      drawBoard()
      return;
    case 70:
      if (colors[this.id] == "#4ff") colors[this.id] = "";
      else colors[this.id] = "#4ff"
      drawBoard()
      return;
    case 71:
      if (colors[this.id] == "#44f") colors[this.id] = "";
      else colors[this.id] = "#44f"
      drawBoard()
      return;
  }
  if (e.button == 2) {
    if ($("#" + this.id + "i").length == 0 && !board[this.id - 1].shown && flags < bombArray[blocks]) addFlag(this.id, this.id + "i")
    else if ($("#" + this.id + "i").length != 0) removeFlag(this.id + "i")
  } else if (e.button == 0) click(this.id);
});

function startTimer() {
  timerval = setInterval(function() {
    timer++
    $('#timer').text(`Time: ${timer}s`)
  }, 1000);
}

function click(id) {
  id = parseInt(id);
  if (!clicked && (board[id - 1].amntOfBombs != 0 || board[id - 1].bomb == true)) {
    redoBoard(blocks, id);
  }
  if (!clicked) startTimer()
  clicked = true;
  if ($("#" + id + "i").length != 0) return;
  if (!playing) return;
  if (board[id - 1].bomb == true) {
    board[id - 1].shown = true;
    drawBoard();
    lost();
    return;
  }
  if (board[id - 1].amntOfBombs == 0) recurse(id, 0);
  board[id - 1].shown = true;
  let shownBlocks = 0;
  board.forEach((a) => {
    if (a.shown) shownBlocks++;
  });
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
      if ($(`#${a+id}i`).length != 0 && !board[id - 1 + a].show) removeFlag(`${id+a}i`)
      board[id - 1 + a].shown = true
      board[id - 1].exposed = true
      if (board[id + a - 1].amntOfBombs == 0 && board[id + a - 1].exposed != true) recurse(id + a)
    }
  })
}

function placeleboard(mode, redo, id) {
  debug(`placeboard(Mode:${mode}, Redo:${redo}, Id:${id})`)
  colors = []
  $('#highscore').text(`Highscore: ${highscore[mode]}s`);
  clearInterval(timerval);
  timer = 0;
  $('#timer').text(`Time: ${timer}s`);
  flags = 0;
  $(`#flagCount`).text('Flags Left: ' + bombArray[mode]);
  $("html").removeClass('lost');
  $("html").removeClass('win');
  $("#result").text("");
  clicked = false;
  playing = true;
  board = [];
  for (let i = 1; i <= maxBlocks; i++) {
    $("#" + i).remove();
  }
  blocks = mode;
  check = [(Math.sqrt(blocks) * -1) - 1, Math.sqrt(blocks) * -1, (Math.sqrt(blocks) * -1) + 1, -1, 1, Math.sqrt(blocks) - 1, Math.sqrt(blocks), Math.sqrt(blocks) + 1];
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
        `<div id=${i} class='block' style='height:calc(50vw/${Math.sqrt(blocks)}); width:calc(50vw/${Math.sqrt(blocks)}); max-width: ${540/Math.sqrt(blocks)}px;  max-height: ${540/Math.sqrt(blocks)}px;'><p id=${
        i + "p"
      }></p></div>`
      )
    );
  }
  debug(`${bombArray} ${mode} ${bombArray[mode]}`)
  createBombs(bombArray[mode]);
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
    board[i - 1].id = i;
  }
  drawBoard();
  debug('placeboard end')
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
  }
  if (board[id - 1].amntOfBombs != 0 || board[id - 1].bomb == true) redoBoard(mode, id)
}

function win() {
  clearInterval(timerval);
  $("html").addClass('win')
  board.forEach((a) => {
    if (a.bomb) $(`#${a.id}`).css("background-color", "green")
  })
  playing = false;
  if (timer < highscore[blocks] || (timer != 0 && highscore[blocks] == 0)) highscore[blocks] = timer
  $('#highscore').text(`Highscore: ${highscore[blocks]}s`)
}

function lost() {
  clearInterval(timerval);
  $("html").addClass('lost')
  board.forEach((a) => {
    if (a.bomb) $(`#${a.id}`).css("background-color", "red")
  })
  playing = false;
}
const flagSprite = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAXNSR0IArs4c6QAAIABJREFUeF7t3FGOBFduRNEWZpeGenUyvMuBDGjkH9ujrkpmKR4zjr/rJclLUn3BsfTLl/9DAAEEEEAAgToCv9RVrGAEEEAAAQQQ+CIAhgABBBBAAIFCAgSgsOlKRgABBBBAgACYAQQQQAABBAoJEIDCpisZAQQQQAABAmAGEEAAAQQQKCRAAAqbrmQEEEAAAQQIgBlAAAEEEECgkAABKGy6khFAAAEEECAAZgABBBBAAIFCAgSgsOlKRgABBBBAgACYAQQQQAABBAoJEIDCpisZAQQQQAABAmAGEEAAAQQQKCRAAAqbrmQEEEAAAQQIgBlAAAEEEECgkAABKGy6khFAAAEEECAAZgABBBBAAIFCAgSgsOlKRgABBBBAgACYAQQQQAABBAoJEIDCpisZAQQQQAABAmAGEEAAAQQQKCRAAAqbrmQEEEAAAQQIgBlAAAEEEECgkAABKGy6khFAAAEEECAAZgABBBBAAIFCAgSgsOlKRgABBBBAgACYAQQQQAABBAoJEIDCpisZAQQQQAABAmAGEEAAAQQQKCRAAAqbrmQEEEAAAQQIgBmIEvjn71+/RxMIB//HL192MNwD4RFoJeAfPq2dP6RuAkAADhlFaSBQR4AA1LX8rIIJAAE4ayJlg0APAQLQ0+sjKyUABODIwZQUAgUECEBBk08ukQAQgJPnU24IPJkAAXhydxfURgAIwIIxlSICjyRAAB7Z1j1FEQACsGdaZYrAswgQgGf1c101BIAArBtaCSPwEAIE4CGNPLWM9j/w07747wRMCXqPAAL/jgABMBsfJUAAZngJwIyf1wgg8O8JEADT8VECBGCGlwDM+HmNAAIEwAyECBCAGXgCMOPnNQIIEAAzECJAAGbgCcCMn9cIIEAAzECIAAGYgScAM35eI4AAATADIQIEYAaeAMz4eY0AAgTADIQIEIAZeAIw4+c1AggQADPwIQL+wH8I7IufJQgvgvIzBBD4PwT8a4CGYkSAAIzwjR8TgDFCH0CglgABqG39PYUTgHs4Xv0KAbhKzjsEECAAZmBEgACM8I0fE4AxQh9AoJYAAaht/T2FE4B7OF79CgG4Ss47BBAgAGZgRIAAjPCNHxOAMUIfQKCWAAGobf09hROAezhe/QoBuErOOwQQIABmYESAAIzwjR8TgDFCH0CglgABqG39a4X7A/8ap1N/RRBO7Yy8EMgTIAD5HhydAQE4uj0/JkcAfkTkBwjUEiAAta1/rXAC8BqnU39FAE7tjLwQyBMgAPkeHJ0BATi6PT8mRwB+ROQHCNQSIAC1rX+tcALwGqdTf0UATu2MvBDIEyAA+R4cnQEBOLo9PyZHAH5E5AcI1BIgALWtf61wAvAap1N/RQBO7Yy8EMgTIAD5HhydAQE4uj0/JkcAfkTkBwjUEiAAta3/V+H+wHcPAEHo7r/quwkQgO7+E4Dy/hOA8gFQfjUBAlDdfheA8vZ/EYD2CVB/MwEC0Nx9/xNAefe/CED9BADQTIAANHefAJR3nwDUDwAA1QQIQHX7/U8A5e13AWgfAPVXEyAA1e0nAOXtJwDtA6D+agIEoLr9BKC8/QSgfQDUX02AAFS3nwCUt58AtA+A+qsJEIDq9hOA8vYTgPYBUH81AQJQ3X4CUN5+AtA+AOqvJkAAqttPAMrbTwDaB0D91QQIQHX7CUB5+wlA+wCov5oAAahuPwEobz8BaB8A9VcTIADV7ScA5e0nAO0DoP5qAgSguv0EoLz9BKB9ANRfTYAAVLefAJS3nwC0D4D6qwkQgOr2E4Dy9hOA9gFQfzUBAlDdfgJQ3n4C0D4A6q8mQACq208AyttPANoHQP3VBAhAdfsJQHn7CUD7AKi/mgABqG4/AShvPwFoHwD1VxMgANXtJwDl7ScA7QOg/moCBKC6/QSgvP0EoH0A1F9NgABUt58AlLefALQPgPqrCRCA6vYTgPL2E4D2AVB/NQECUN1+AlDefgLQPgDqryZAAKrbTwDK208A2gdA/dUECEB1+wlAefsJQPsAqL+aAAGobj8BKG8/AWgfAPVXEyAA1e0nAOXtJwDtA6D+agIEoLr9BKC8/QSgfQDUX02AAFS3/+fi//n71+8//8ovTiXwj1++7PipzZEXAmEC/uEQbsDp4QnA6R366/wIwO7+yR6BTxIgAJ+k+4BvE4DdTSQAu/snewQ+SYAAfJLuA75NAHY3kQDs7p/sEfgkAQLwSboP+DYB2N1EArC7f7JH4JMECMAn6T7g2wRgdxMJwO7+yR6BTxIgAJ+k+4BvE4DdTSQAu/snewQ+SYAAfJLuA75NAHY3kQDs7p/sEfgkAQLwSboF3/60IPzXf/62muJ//Pr90fz9gf8oXh9H4NEECMCj2/v54gjAXzMmAJ+fQREQQOAaAQJwjZtXfxIgAATAMiCAwE4CBGBn347JmgAQgGOGUSIIIPAWAQLwFi4//t8ECAABsBUIILCTAAHY2bdjsiYABOCYYZQIAgi8RYAAvIXLj10A3psB/0+A7/HyawQQ+PsIEIC/j/UjI7kAuAA8crAVhUABAQJQ0ORkiT8JwvZ/z3/K9qcLgX/Pf0rYewQQ+HcECIDZ+CgBAjC7EBCAj46njyNQTYAAVLf/88UTAALw+SkTAQEErhAgAFeoefMyAQJAAF4eFj9EAIG/lQAB+Ftx9wUjAASgb+pVjMAOAgRgR5/WZkkACMDa4ZU4Ag8nQAAe3uB0eQSAAKRnUHwEEPj/CRAAk/FRAgSAAHx0wHwcAQQuEyAAl9F5eAeB33777fc7vrP1G9/f33Zwa/PkjcByAv7hs7yB29MnAARg+wzLH4GtBAjA1s49JG8CQAAeMsrKQGAdAQKwrmXPSpgAEIBnTbRqENhDgADs6dUjMyUABOCRg60oBBYQIAALmvTkFAkAAXjyfKsNgZMJEICTu1OQGwEgAAVjrkQEjiRAAI5sS09SBIAA9Ey7ShE4iwABOKsfddm0C8Cv39+jnv/y9WWHRwQ9RqCXgH949Pb+iMoJAAE4YhAlgUAhAQJQ2PSTSiYABOCkeZQLAk0ECEBTtw+slQAQgAPHUkoIVBAgABVtPrdIAkAAzp1OmSHwbAIE4Nn9Pb46AkAAjh9SCSLwUAIE4KGN3VIWASAAW2ZVngg8jQABeFpHl9VDAAjAspGVLgKPIUAAHtPKnYUQgJkATLvuvyMwJeg9AnsJEIC9vXtE5gSAADxikBWBwEICBGBh056UMgEgAE+aZ7UgsIkAAdjUrQfmSgAIwAPHWkkIrCBAAFa06blJEgAC8NzpVhkCZxMgAGf35/HZEQAC8PghVyAChxIgAIc2piUtAkAAWmZdnQicRoAAnNaRsnwIAAEoG3nlInAMAQJwTCs6EyEAWQGYTp3/jsCUoPcI5AgQgBx7kb++vggAAbAICCCQIUAAMtxF/ZMAASAAlgEBBDIECECGu6gE4A8Cv34TAMuAAAIZAgQgw11UAkAAbAECCEQJEIAofsH9TwAuALYAAQQyBAhAhruoLgAuALYAAQSiBAhAFL/gLgAuALYAAQQyBAhAhruoLgCPuABMB9l/R2BK0HsErhMgANfZeXkDAReA3ReA6QgQgClB7xG4ToAAXGfn5Q0ECAABuGGMfAIBBC4QIAAXoHlyHwECQADumyZfQgCBdwgQgHdo+e3tBAgAAbh9qHwQAQReIkAAXsLkR58iQAAIwKdmy3cRQOCvCRAAExIlQAAIQHQABUegmAABKG7+CaUTAAJwwhzKAYFGAgSgsesH1UwAugVgOor+NcIpQe+bCRCA5u4fUDsBIACTMSQAE3rethMgAO0TEK6fABCAyQgSgAk9b9sJEID2CQjXTwAIwGQECcCEnrftBAhA+wSE6ycABGAyggRgQs/bdgIEoH0CwvUTAAIwGUECMKHnbTsBAtA+AeH6CQABmIwgAZjQ87adAAFon4Bw/QSAAExGkABM6HnbToAAtE9AuH4CQACSI0ggkvTFThMgAOkOlMcnAAQguQIEIElf7DQBApDuQHl8AkAAkitAAJL0xU4TIADpDpTHJwAEILkCBCBJX+w0AQKQ7kB5fAJAAJIrQACS9MVOEyAA6Q6UxycABCC5AgQgSV/sNAECkO5AeXwCQACSK0AAkvTFThMgAOkOlMcnAAQguQIEIElf7DQBApDuQHl8AkAANq8AgdjcPbkTADMQJUAACEB0AIfBCcAQoOdRAgQgil9wAkAANm8BAdjcPbkTADMQJUAACEB0AIfBCcAQoOdRAgQgil9wAkAANm8BAdjcPbkTADMQJUAACEB0AIfBCcAQoOdRAgQgil9wAkAANm8BAdjcPbkTADMQJUAACEB0AIfBCcAQoOdRAgQgil9wAkAAmreAQDR3P187Acj3oDoDAkAAmheAADR3P187Acj3oDoDAkAAmheAADR3P187Acj3oDoDAkAAmheAADR3P187Acj3oDoDAkAAmheAADR3P187Acj3oDoDAkAAmheAADR3P187Acj3oDoDAkAAmheAADR3P187Acj3oDoDAkAAmheAADR3P187Acj3oDoDAkAAqhdgWDyBGAIsf04AygcgXT4BIADpGdwcnwBs7l4+dwKQ70F1BgSAAFQvwLB4AjAEWP6cAJQPQLp8AkAA0jO4OT4B2Ny9fO4EIN+D6gwIAAGoXoBh8QRgCLD8OQEoH4B0+QSAAKRncHN8ArC5e/ncCUC+B9UZEAACUL0Aw+IJwBBg+XMCUD4A6fIJAAFIz+Dm+ARgc/fyuROAfA+qMyAABKB6AcLFE4hwA8LhCUC4Ae3hCQABaN+BZP0EIEk/H5sA5HtQnQEBIADVCxAungCEGxAOTwDCDWgPTwAIQPsOJOsnAEn6+dgEIN+D6gwIAAGoXoBw8QQg3IBweAIQbkB7eAJAANp3IFk/AUjSz8cmAPkeVGdAAAhA9QKEiycA4QaEwxOAcAPawxMAAtC+A8n6CUCSfj42Acj3oDoDAkAAqhdgefEEYncDCcDu/q3PngAQgPVDXFwAAdjdfAKwu3/rsycABGD9EBcXQAB2N58A7O7f+uwJAAFYP8TFBRCA3c0nALv7tz57AkAA1g9xcQEEYHfzCcDu/q3PngAQgPVDXFwAAdjdfAKwu3/rsycABGD9EBcXQAB2N58A7O7f+uwJAAFYP8TFBRCA3c0nALv7tz57AkAA1g+xAi4TIBCX0d3ykADcgtFHrhIgAATg6ux4t58AAcj2kABk+ddHJwAEoH4JigEQgGzzCUCWf310AkAA6pegGAAByDafAGT510cnAASgfgmKARCAbPMJQJZ/fXQCQADql6AYAAHINp8AZPnXRycABKB+CYoBEIBs8wlAln99dAJAAOqXoBgAAcg2nwBk+ddHJwAEoH4JALhMgEBcRvfHQwIw4+f1kAABIADDEfK8mAABmDWfAMz4eT0kQAAIwHCEPC8mQABmzScAM35eDwkQAAIwHCHPiwkQgFnzCcCMn9dDAgSAAAxHyPNiAgRg1nwCMOPn9ZAAASAAwxHyvJgAAZg1nwDM+Hk9JEAACMBwhDwvJkAAZs0nADN+Xg8JEAACMBwhz4sJEIBZ8wnAjJ/XQwIEgAAMR8hzBC4TaBcIAnB5dDy8gwABIAB3zJFvIHCFAAG4Qs0bBG4iQAAIwE2j5DMIvE2AALyNzAME7iNAAAjAfdPkSwi8R4AAvMfLrxG4lQABIAC3DpSPIfAGAQLwBiw/ReBuAgSAANw9U76HwKsECMCrpPwOgQ8QIAAE4ANj5ZMIvESAALyEyY8Q+AwBAkAAPjNZvorAzwQIwM+M/AKBjxEgAATgY8Plwwh8mMB2gfDfAfjwgPj8XxMgAATAjiCwlQAB2No5eR9BgAAQgCMGURIIXCBAAC5A8wSB/yFAAAiAbUBgKwECsLVz8j6CAAEgAEcMoiQQuECAAFyA5gkCLgD/IvDrNwGwDQhsJUAAtnZO3kcQcAEgAEcMoiQQuECAAFyA5gkCLgAuALYAge0ECMD2Dso/SsAFwAUgOoCCVxPY/gd82jz/HYApQe9HBAgAARgNkMcIDAgQgAE8TxGYEiAABGA6Q94jcJUAAbhKzjsEbiBAAAjADWPkEwhcIkAALmHzCIF7CBAAAnDPJPkKAu8TIADvM/MCgdsIEAACcNsw+RACbxIgAG8C83ME7iRAAAjAnfPkWwi8Q4AAvEPLbxG4mQABIAA3j5TPIfAyAQLwMio/ROB+AgSAANw/Vb7YQqD9D/i0z/47AFOC3o8IEAACMBogj6sJEIBZ+wnAjJ/XQwIEgAAMR8jzYgIEYNZ8AjDj5/WQAAEgAMMR8ryYAAGYNZ8AzPh5PSRAAAjAcIQ8LyZAAGbNJwAzfl4PCRAAAjAcIc+LCRCAWfMJwIyf10MCBIAADEfI82ICBGDWfAIw4+f1kAABIADDEfK8mAABmDWfAMz4eT0kQAAIwHCEPF9MwB/wbPMIQJZ/fXQCQADql6AYAAHINp8AZPnXRycABKB+CYoBEIBs8wlAln99dAJAAOqXoBgAAcg2nwBk+ddHJwAEoH4JigEQgGzzCUCWf310AkAA6pegGAAByDafAGT510cnAASgfgmKARCAbPMJQJZ/fXQCQADql6AYAAHINp8AZPnXRycABKB+CRYD8Ad8cfO+vr4IwO7+rc+eABCA9UNcXAAB2N18ArC7f+uzJwAEYP0QFxdAAHY3nwDs7t/67AkAAVg/xMUFEIDdzScAu/u3PnsCQADWD3FxAQRgd/MJwO7+rc+eABCA9UNcXAAB2N18ArC7f+uzJwAEYP0QFxdAAHY3nwDs7t/67AkAAVg/xMUFEIDdzScAu/u3PnsCQADWD/HiAvwBX9y8G1InADdA9InrBAgAAbg+PV5OCRCAKcHd7wnA7v6tz54AEID1Q7y4AAKwuHk3pE4AboDoE9cJEAACcH16vJwSIABTgrvfE4Dd/VufPQEgAOuHeHEBBGBx825InQDcANEnrhMgAATg+vR4OSVAAKYEd78nALv7tz57AkAA1g/x4gIIwOLm3ZA6AbgBok9cJ0AACMD16fFySoAATAnufk8AdvdvffYEgACsH+JgAf6AB+E/IDQBeEATN5dAAAjA5vlN504A0h3YHZ8A7O7f+uwJAAFYP8TBAghAEP4DQhOABzRxcwkEgABsnt907gQg3YHd8QnA7v6tz54AEID1QxwsgAAE4T8gNAF4QBM3l0AACMDm+U3nTgDSHdgdnwDs7t/67AkAAVg/xMECCEAQ/gNCE4AHNHFzCQSAAGye33TuBCDdgd3xCcDu/q3PngAQgPVDPCjAH/ABPE/HBAjAGKEPTAgQAAIwmZ/tbwnA9g7uzp8A7O7f+uwJAAFYP8SDAgjAAJ6nYwIEYIzQByYECAABmMzP9rcEYHsHd+dPAHb3b332BIAArB/iQQEEYADP0zEBAjBG6AMTAgSAAEzmZ/tbArC9g7vzJwC7+7c+ewJAANYP8aAAAjCA5+mYAAEYI/SBCQECQAAm87P9LQHY3sHd+ROA3f1bnz0BIACbh9gf8M3dkzsBMANRAgSAAEQHcBicAAwBeh4lQACi+AUnAARg8xYQgM3dkzsBMANRAgSAAEQHcBicAAwBeh4lQACi+AUnAARg8xYQgM3dkzsBMANRAgSAAEQHcBicAAwBeh4lQACi+AUnAARg8xYQgM3dkzsBMANRAgSAAEQHcBicAAwBeh4lQACi+AUnAAQguQX+gCfpi50mQADSHSiPTwAIQHIFCECSvthpAgQg3YHy+ASAACRXgAAk6YudJkAA0h0oj08ACEByBQhAkr7YaQIEIN2B8vgEgAAkV4AAJOmLnSZAANIdKI9PAAhAcgUIQJK+2GkCBCDdgfL4BIAAJFeAACTpi50mQADSHSiPTwAIQHIFCECSvthpAgQg3YHy+ASAAExWwB/wCT1v2wkQgPYJCNdPAAjAZAQJwISet+0ECED7BITrJwAEYDKCBGBCz9t2AgSgfQLC9RMAAjAZQQIwoedtOwEC0D4B4foJAAGYjCABmNDztp0AAWifgHD9BIAATEaQAEzoedtOgAC0T0C4fgJAACYjSAAm9LxtJ0AA2icgXD8BIACTESQAE3rethMgAO0TEK6fAHQLgD/g4QUUvpoAAahuf754AkAA8lMoAwQ6CRCAzr4fUzUBIADHDKNEECgjQADKGn5auQSAAJw2k/JBoIUAAWjp9KF1EgACcOhoSguBxxMgAI9v8dkFEgACcPaEyg6B5xIgAM/t7YrKCAABWDGokkTggQQIwAObuqkkAkAANs2rXBF4EgEC8KRuLqyFAOwWAP8e/8KlkzICfxIgAEYhSoAAEIDoAAqOQDEBAlDc/BNKJwAE4IQ5lAMCjQQIQGPXD6qZABCAg8ZRKghUESAAVe0+r1gCQADOm0oZIdBBgAB09PnYKgkAATh2OCWGwMMJEICHN/j08ggAATh9RuWHwFMJEICndnZJXQSAACwZVWki8DgCBOBxLd1VEAHICoB/j3/XvsgWgTsJEIA7afrW2wQIAAF4e2g8QACBWwgQgFsw+shVAgSAAFydHe8QQGBGgADM+Hk9JEAACMBwhDxHAIGLBAjARXCe3UOAABCAeybJVxBA4F0CBOBdYn5/KwECQABuHSgfQwCBlwkQgJdR+eEnCBAAAvCJufJNBBD4mQAB+JmRX3yQAAEgAB8cL59GAIG/IEAAjEeUAAGYCYB/jz86voIjsJoAAVjdvv3JEwACsH+KVYDATgIEYGffHpM1ASAAjxlmhSCwjAABWNawp6VLAAjA02ZaPQhsIUAAtnTqoXkSAALw0NFWFgLHEyAAx7fo2QkSAALw7AlXHQLnEiAA5/amIjMCQAAqBl2RCBxIgAAc2JSmlAgAAWiad7UicBIBAnBSNwpzaReA7+9vO1g490pG4AQC/uFzQheKcyAABKB4/JWOQJQAAYjiF5wAEABbgAACGQIEIMNd1D8JEAACYBkQQCBDgABkuItKAP4g4P8HwCoggECKAAFIkRf3DwIuAC4AVgEBBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDJZoA+TAAAC9UlEQVQECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIECECGu6guAC4AtgABBKIECEAUv+AuAC4AtgABBDIE/htU2lpqAGBMMgAAAABJRU5ErkJgggAA";

function createBombs(int) {
  debug(`createbombs(${int})`)
  for (let a = 1; a <= int; a++) {
    let ara = Math.floor(Math.random() * blocks)
    if (board[ara].bomb == false) board[ara].bomb = true;
    else {
      createBombs(1)
    }
  }
}

function addFlag(containerId, imageId) {
  let img = $(`<img src="${flagSprite}" id="${imageId}" style='height:calc(50vw/${Math.sqrt(blocks)}); width:calc(50vw/${Math.sqrt(blocks)}); max-width: ${540/Math.sqrt(blocks)}px;  max-height: ${540/Math.sqrt(blocks)}px;'></img>`)
  $(`#${containerId}`).append(img)
  flags++
  $(`#flagCount`).text('Flags Left: ' + (bombArray[blocks] - flags))
  return imageId;
}

function removeFlag(imageId) {
  $(`#${imageId}`).remove()
  flags--
  $(`#flagCount`).text('Flags Left: ' + (bombArray[blocks] - flags))
}

function debug(string) {
  if (true) console.log(string)
}

$("#reset").click(() => {
  placeleboard(currentMode)
})

init()
