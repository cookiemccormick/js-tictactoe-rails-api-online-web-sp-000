turn = 0;
currentGameId = null;

const WINNING_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function player() {
  return (turn % 2 === 0 ? "X" : "O");
}

function isSquareTaken(square) {
  return !!$(square).text();
}

function updateState(square) {
  if (isSquareTaken(square)) {
    return;
  }
  $(square).text(player());
  turn++;
}

function setMessage(message) {
  $('div#message').text(message);
}

function checkWinner() {
  var winner = false;
  var board = {};

  $("td").text((index, square) => board[index] = square);

  return !!WINNING_COMBOS.find(function(combo) {
    if (board[combo[0]] === board[combo[1]]
      && board[combo[1]] === board[combo[2]]
      && board[combo[0]] !== "") {
      setMessage(`Player ${board[combo[0]]} Won!`);
      return true;
    }
    return false;
  });
}

function doTurn(square) {
  updateState(square);
  if (checkWinner()) {
    saveGame();
    $("td").empty();
    turn = 0;
  } else if (turn === 9) {
    setMessage("Tie game.");
    saveGame();
    $("td").empty();
    turn = 0;
  };
}

$(document).ready(function() {
  attachListeners();
})

function attachListeners() {
  $("td").on("click", function() {
    doTurn(this);
  });

  $("button#save").on("click", saveGame);
  $("button#previous").on("click", previousGames);
  $("button#clear").on("click", clearGame);
}

function previousGames() {
  $.get('/games', function(response) {
    $('#games').html(response);
    var gamesList = "";
    for (var i=0; i < response.data.length; i++) {
      var game = response.data[i];
      gamesList += `<button onclick="loadGame(${game.id})">${game.id}</button>`;
    }
    $("#games").html(gamesList);
  });
}

function saveGame() {
  var state = [];

  $("td").text((index, square) => {
    state.push(square);
    return square;
  });

  var method = currentGameId ? 'PATCH' : 'POST';
  var url = currentGameId ? `/games/${currentGameId}` : '/games';

  $.ajax({
    type: method,
    data: {state: state},
    url: url,
    success: function(response) {
      currentGameId = response.data.id;
    }
  });
}

function clearGame() {
  $("td").empty();
  turn = 0;
  currentGameId = null;
}

function loadGame(id) {
  $.get(`/games/${id}`, function(response) {
    var game = response.data;
    $("td").text((index, square) => game.attributes.state[index]);
    currentGameId = game.id;
    var tokens = game.attributes.state.filter(function(spot) {
      return spot != "";
    })
    turn = tokens.length;
  });
}