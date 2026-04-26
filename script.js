/* ===== TEAMS ===== */
var teams = [
  "Arsenal","Chelsea","Liverpool","Brighton","Man City",
  "Man United","Tottenham","Newcastle","Everton","Aston Villa"
];

/* ===== LOAD SAVED DATA ===== */
var stats = JSON.parse(localStorage.getItem("stats")) || {};
var fixtures = JSON.parse(localStorage.getItem("fixtures")) || [];
var resultsLog = JSON.parse(localStorage.getItem("resultsLog")) || [];
var currentRound = JSON.parse(localStorage.getItem("currentRound")) || 0;

/* ===== INIT STATS ===== */
function initStats() {
  for (var i = 0; i < teams.length; i++) {
    if (!stats[teams[i]]) {
      stats[teams[i]] = {P:0,W:0,D:0,L:0,GF:0,GA:0,GD:0,Pts:0};
    }
  }
}

/* ===== GENERATE FIXTURES ===== */
function generateFixtures() {

  if (fixtures.length > 0) return;

  var arr = teams.slice();
  var n = arr.length;

  for (var r = 0; r < n - 1; r++) {

    var round = [];

    for (var i = 0; i < n / 2; i++) {

      var home = arr[i];
      var away = arr[n - 1 - i];

      round.push({home:home, away:away});
    }

    fixtures.push(round);
    arr.splice(1,0,arr.pop());
  }

  saveAll();
}

/* ===== SHOW FIXTURES ===== */
function showFixtures() {

  document.getElementById("roundTitle").innerText =
    "Matchday " + (currentRound + 1);

  var box = document.getElementById("fixtures");
  box.innerHTML = "";

  var round = fixtures[currentRound];

  for (var i = 0; i < round.length; i++) {

    box.innerHTML +=
      "<b>" + round[i].home + "</b>" +
      " <input id='g" + i + "h'> vs " +
      "<input id='g" + i + "a'> " +
      "<b>" + round[i].away + "</b><br>";
  }
}

/* ===== MATCH ===== */
function playMatch(home, away, g1, g2) {

  stats[home].P++;
  stats[away].P++;

  stats[home].GF += g1;
  stats[home].GA += g2;

  stats[away].GF += g2;
  stats[away].GA += g1;

  if (g1 > g2) {
    stats[home].W++; stats[away].L++; stats[home].Pts += 3;
  } else if (g1 < g2) {
    stats[away].W++; stats[home].L++; stats[away].Pts += 3;
  } else {
    stats[home].D++; stats[away].D++;
    stats[home].Pts += 1; stats[away].Pts += 1;
  }

  stats[home].GD = stats[home].GF - stats[home].GA;
  stats[away].GD = stats[away].GF - stats[away].GA;
}

/* ===== SAVE RESULTS ===== */
function submitResults() {

  var round = fixtures[currentRound];
  var roundResults = [];

  for (var i = 0; i < round.length; i++) {

    var g1 = Number(document.getElementById("g"+i+"h").value);
    var g2 = Number(document.getElementById("g"+i+"a").value);

    playMatch(round[i].home, round[i].away, g1, g2);

    roundResults.push({home:round[i].home,away:round[i].away,score:g1+"-"+g2});
  }

  resultsLog[currentRound] = roundResults;

  saveAll();
  showTable();
}

/* ===== NAVIGATION ===== */
function nextRound() {
  if (currentRound < fixtures.length - 1) {
    currentRound++;
    saveAll();
    showFixtures();
  }
}

function prevRound() {
  if (currentRound > 0) {
    currentRound--;
    saveAll();
    showFixtures();
  }
}

/* ===== TABLE ===== */
function showTable() {

  var arr = [];

  for (var t in stats) {
    arr.push([t, stats[t]]);
  }

  arr.sort(function(a,b){
    return b[1].Pts - a[1].Pts;
  });

  var table = document.getElementById("table");

  table.innerHTML =
    "<tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr>";

  for (var i = 0; i < arr.length; i++) {

    var t = arr[i][0];
    var s = arr[i][1];

    table.innerHTML +=
      "<tr><td>"+t+"</td><td>"+s.P+"</td><td>"+s.W+"</td><td>"+s.D+"</td><td>"+s.L+"</td><td>"+s.GF+"</td><td>"+s.GA+"</td><td>"+s.GD+"</td><td>"+s.Pts+"</td></tr>";
  }
}

/* ===== SAVE ALL (IMPORTANT) ===== */
function saveAll() {
  localStorage.setItem("stats", JSON.stringify(stats));
  localStorage.setItem("fixtures", JSON.stringify(fixtures));
  localStorage.setItem("resultsLog", JSON.stringify(resultsLog));
  localStorage.setItem("currentRound", JSON.stringify(currentRound));
}

/* ===== DOWNLOADS ===== */
function downloadTable() {
  var csv = "Team,P,W,D,L,GF,GA,GD,PTS\n";
  for (var t in stats) {
    var s = stats[t];
    csv += t+","+s.P+","+s.W+","+s.D+","+s.L+","+s.GF+","+s.GA+","+s.GD+","+s.Pts+"\n";
  }
  downloadFile("table.csv",csv);
}

function downloadFixtures() {
  var text = "";
  for (var r=0;r<fixtures.length;r++) {
    text += "Matchday "+(r+1)+"\n";
    for (var i=0;i<fixtures[r].length;i++) {
      text += fixtures[r][i].home+" vs "+fixtures[r][i].away+"\n";
    }
    text += "\n";
  }
  downloadFile("fixtures.txt",text);
}

function downloadResults() {
  var text = "";
  for (var r in resultsLog) {
    text += "Matchday "+(Number(r)+1)+"\n";
    for (var i=0;i<resultsLog[r].length;i++) {
      var m = resultsLog[r][i];
      text += m.home+" vs "+m.away+" = "+m.score+"\n";
    }
    text += "\n";
  }
  downloadFile("results.txt",text);
}

function downloadFile(name,content){
  var a=document.createElement("a");
  a.href="data:text/plain;charset=utf-8,"+encodeURIComponent(content);
  a.download=name;
  a.click();
}

/* ===== START ===== */
initStats();
generateFixtures();
showFixtures();
showTable();
