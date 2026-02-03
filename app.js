// ================= CONFIG =================
const scriptURL = 'https://script.google.com/macros/s/AKfycby0Cg2ZO1qlLRCid3MdYhaP4Kn5Zk35MjIGGCtOX9RqJtReaSpbq9y8aACuHklW5jVfmg/exec';
let isSyncing = false;

// ================= PAGE LOAD =================
document.addEventListener('DOMContentLoaded', () => {
  loadSheetData();
  loadSelectFiles();
  setupCounters();
  updatePendingUI();

  window.addEventListener('online', autoSync);
  setInterval(autoSync, 10000);
});

// ================= LOAD DROPDOWNS =================
function loadSelectFiles() {
  const loaders = [
    { file: 'members.txt', id: 'memberSelect' },
    { file: 'games.txt', id: 'gameSelect' },
    { file: 'teams.txt', id: 'teamSelect' }
  ];

  loaders.forEach(({ file, id }) => {
    fetch(file)
      .then(r => r.text())
      .then(text => {
        const el = document.getElementById(id);
        if (!el) return;

        text.split('\n').forEach(v => {
          if (v.trim()) {
            const opt = document.createElement("option");
            opt.value = opt.textContent = v.trim();
            el.appendChild(opt);
          }
        });
      });
  });
}

// ================= COUNTERS =================
function setupCounters() {
  const counters = [
    { add: "addPointBtn", sub: "removePointBtn", disp: "score" },
    { add: "addMissBtn", sub: "removeMissBtn", disp: "missCount" },
    { add: "teleAddDeliveryBtn", sub: "teleRemoveDeliveryBtn", disp: "teleDeliveryCount" },
    { add: "teleAddPointBtn", sub: "teleRemovePointBtn", disp: "teleScore" },
    { add: "teleAddMissBtn", sub: "teleRemoveMissBtn", disp: "teleMissCount" }
  ];

  counters.forEach(c => {
    const d = document.getElementById(c.disp);
    if (!d) return;

    const bind = (id, delta) => {
      const btn = document.getElementById(id);
      if (btn) btn.onclick = () => {
        d.innerText = Math.max(0, Number(d.innerText) + delta);
      };
    };

    bind(c.add, 1);
    bind(c.sub, -1);
    bind(c.add + "5", 5);
    bind(c.sub + "5", -5);
    bind(c.add + "10", 10);
    bind(c.sub + "10", -10);
  });
}

// ================= READ SHEET =================
async function loadSheetData() {
  try {
    const res = await fetch(scriptURL);
    const rows = await res.json();
    renderTable(analyzeTeams(rows));
    const analyzed = analyzeTeams(rows);

renderTable(analyzed);            // your existing table
renderAvgTotalChart(analyzed);    // <-- new chart
renderRankingLadder(analyzed);    // optional ranking ladder

    
  } catch (err) {
    console.error("Failed to load sheet:", err);
  }
}

// ================= DISPLAY TABLE =================
function renderTable(rows) {
  const div = document.getElementById("sheetData");
  if (!div) return;

  if (!rows || rows.length === 0) {
    div.innerText = "No data yet.";
    return;
  }

  const headers = Object.keys(rows[0]);
  let html = `<table border="1" style="width:100%; background:white; color:black;">`;

  html += "<tr>";
  headers.forEach(h => html += `<th>${h}</th>`);
  html += "</tr>";

  rows.forEach(r => {
    html += "<tr>";
    headers.forEach(h => html += `<td>${r[h]}</td>`);
    html += "</tr>";
  });

  html += "</table>";
  div.innerHTML = html;
}

// ================= SUBMIT =================
function submitToSheet() {
  const matchData = {
    Scouter: memberSelect.value,
    GameNum: gameSelect.value,
    TeamNum: teamSelect.value,
    StartPos: startingPoint.value,
    AutoCross: autoCross.checked ? "Yes" : "No",
    AutoScore: score.innerText,
    AutoMiss: missCount.innerText,
    AutoClimb: Auto_Climb.value,
    AutoCollect: collect.checked ? "Yes" : "No",
    TeleDeliveries: teleDeliveryCount.innerText,
    TeleScore: teleScore.innerText,
    TeleMiss: teleMissCount.innerText,
    ObstacleA: obstacleA.checked ? "Yes" : "No",
    ObstacleB: obstacleB.checked ? "Yes" : "No",
    EndClimb: Climb.value,
    EndClimbDir: Climb_Direction.value,
    AutoWorked: autoWorked.checked ? "Yes" : "No",
    RobotFailed: robotFailed.checked ? "Yes" : "No",
    ScoringSpeed: ScoringSpeed.value,
    Comments: userInput.value,
    id: Date.now()
  };

  const queue = JSON.parse(localStorage.getItem('scoutingQueue') || "[]");
  queue.push(matchData);
  localStorage.setItem('scoutingQueue', JSON.stringify(queue));

  resetForm();
  updatePendingUI();

  if (navigator.onLine) autoSync();
}

// ================= SYNC =================
async function autoSync() {
  if (!navigator.onLine || isSyncing) return;

  const queue = JSON.parse(localStorage.getItem('scoutingQueue') || "[]");
  if (!queue.length) return;

  isSyncing = true;
  syncText.innerText = "Syncing...";

  for (const match of queue) {
    const form = new URLSearchParams(match);
    await fetch(scriptURL, {
      method: "POST",
      body: form,
      mode: "no-cors"
    });
  }

  localStorage.removeItem('scoutingQueue');
  syncText.innerText = "All Synced";
  isSyncing = false;
  updatePendingUI();
}

// ================= PAGE TOGGLES =================
function showScouting() {
  document.getElementById("scoutingPage").style.display = "block";
  document.getElementById("dataPage").style.display = "none";
}

function showData() {
  document.getElementById("scoutingPage").style.display = "none";
  document.getElementById("dataPage").style.display = "block";
  loadSheetData();
}

// ======== MAPPINGS FOR CATEGORICAL FIELDS ========
const mappings = {
  ScoringSpeed: { A: "Slow", B: "Medium", C: "Fast", D: "Very Fast" },
  Auto_Climb: { A: "Didn't try", B: "Failed", C: "Climbed" },
  Climb: { A: "Didn't try", B: "Failed", C: "Level 1", D: "Level 2", E: "Level 3" },
  Climb_Direction: { A: "Center", B: "Left", C: "Right" }
};

// ======== HELPER TO FIND MOST COMMON VALUE ========
function mostCommon(arr) {
  if (!arr.length) return "";
  const counts = {};
  arr.forEach(v => counts[v] = (counts[v] || 0) + 1);
  let max = 0, common = "";
  for (const key in counts) {
    if (counts[key] > max) {
      max = counts[key];
      common = key;
    }
  }
  return common;
}

// ================= ANALYSIS =================
function groupByTeam(rows) {
  const teams = {};

  rows.forEach(row => {
    const team = row.TeamNum;
    if (!team) return;

    if (!teams[team]) teams[team] = [];
    teams[team].push(row);
  });

  return teams;
}

function analyzeTeams(rows) {
  const teams = groupByTeam(rows);
  const results = [];

  for (const team in teams) {
    const matches = teams[team];

    const autoScores = matches.map(m => Number(m.AutoScore) || 0);
    const teleScores = matches.map(m => Number(m.TeleScore) || 0);
    const teleMisses = matches.map(m => Number(m.TeleMiss) || 0);

    // Categorical fields
    const scoringSpeeds = matches.map(m => m.ScoringSpeed);
    const autoClimbs = matches.map(m => m.Auto_Climb);
    const endClimbs = matches.map(m => m.Climb);
    const climbDirs = matches.map(m => m.Climb_Direction);

    results.push({
      Team: team,
      Matches: matches.length,
      AvgAuto: avg(autoScores),
      AvgTele: avg(teleScores),
      AvgTotal: avg(autoScores.map((a,i)=>a + teleScores[i])),
      AvgTeleMiss: avg(teleMisses),
      AutoWorkedPct: pct(matches, m => m.AutoWorked === "Yes"),
      FailPct: pct(matches, m => m.RobotFailed === "Yes"),
      ScoringSpeed: mappings.ScoringSpeed[mostCommon(scoringSpeeds)] || "",
      AutoClimb: mappings.Auto_Climb[mostCommon(autoClimbs)] || "",
      EndClimb: mappings.Climb[mostCommon(endClimbs)] || "",
      ClimbDir: mappings.Climb_Direction[mostCommon(climbDirs)] || "",
      Comments: matches.map(m => m.Comments).filter(c => c).join("; ")
    });
  }

  results.sort((a,b) => b.AvgTotal - a.AvgTotal);
  return results;
}
function renderAvgTotalChart(teamData) {
  const ctx = document.getElementById('avgTotalChart').getContext('2d');

  const sortedTeams = [...teamData].sort((a,b) => b.AvgTotal - a.AvgTotal);

  const labels = sortedTeams.map(t => t.Team);
  const data = sortedTeams.map(t => t.AvgTotal);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Avg Total Score',
        data: data,
        backgroundColor: 'rgba(52, 152, 219, 0.7)', // change bar color here
        borderColor: 'rgba(41, 128, 185, 1)',       // border color
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { 
          backgroundColor: 'rgba(0,0,0,0.7)', 
          titleColor: '#fff', 
          bodyColor: '#fff'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#ffffff',   // y-axis numbers color
            font: { size: 14 }
          }
        },
        x: {
          ticks: {
            color: '#ffffff',   // team names color
            font: { size: 14 }
          }
        }
      }
    }
  });
}



// Helper to find the most common value in an array
function mode(arr) {
  const freq = {};
  let maxCount = 0, modeVal = "";
  arr.forEach(v => {
    if (!v) return;
    freq[v] = (freq[v] || 0) + 1;
    if (freq[v] > maxCount) {
      maxCount = freq[v];
      modeVal = v;
    }
  });
  return modeVal || "-";
}


function avg(arr) {
  return arr.length ? (arr.reduce((a,b)=>a+b,0) / arr.length).toFixed(2) : 0;
}

function pct(arr, fn) {
  return arr.length ? ((arr.filter(fn).length / arr.length) * 100).toFixed(1) : 0;
}


// ================= HELPERS =================
function updatePendingUI() {
  const q = JSON.parse(localStorage.getItem('scoutingQueue') || "[]");
  pendingCount.innerText = q.length;
}

function resetForm() {
  document.querySelectorAll('[id$="score"], [id$="Count"]').forEach(e => e.innerText = "0");
  document.querySelectorAll('input[type="checkbox"]').forEach(e => e.checked = false);
  userInput.value = "";
}
