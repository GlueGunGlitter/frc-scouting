// ================= CONFIG =================

const scriptURL = 'https://script.google.com/macros/s/AKfycby0Cg2ZO1qlLRCid3MdYhaP4Kn5Zk35MjIGGCtOX9RqJtReaSpbq9y8aACuHklW5jVfmg/exec';
let isSyncing = false;

// ================= PAGE LOAD =================

document.addEventListener('DOMContentLoaded', () => {

    // ---- LOAD SHEET DATA ----
    loadSheetData();

    // ---- LOAD TXT FILES ----
    const loaders = [
        { file: 'members.txt', id: 'memberSelect' },
        { file: 'games.txt', id: 'gameSelect' },
        { file: 'teams.txt', id: 'teamSelect' }
    ];

    loaders.forEach(loader => {
        fetch(loader.file)
            .then(r => r.text())
            .then(data => {
                const el = document.getElementById(loader.id);
                data.split('\n').forEach(v => {
                    if (v.trim()) {
                        const opt = document.createElement("option");
                        opt.value = opt.textContent = v.trim();
                        el.appendChild(opt);
                    }
                });
            });
    });

    // ---- COUNTERS ----
    const counters = [
        { add: "addPointBtn", sub: "removePointBtn", disp: "score" },
        { add: "addMissBtn", sub: "removeMissBtn", disp: "missCount" },
        { add: "teleAddDeliveryBtn", sub: "teleRemoveDeliveryBtn", disp: "teleDeliveryCount" },
        { add: "teleAddPointBtn", sub: "teleRemovePointBtn", disp: "teleScore" },
        { add: "teleAddMissBtn", sub: "teleRemoveMissBtn", disp: "teleMissCount" }
    ];

    counters.forEach(c => {
        const a = document.getElementById(c.add);
        const s = document.getElementById(c.sub);
        const d = document.getElementById(c.disp);

        if (a && s && d) {
            a.onclick = () => d.innerText = +d.innerText + 1;
            s.onclick = () => d.innerText = Math.max(0, +d.innerText - 1);
        }
    });

    updatePendingUI();
    window.addEventListener('online', autoSync);
    setInterval(autoSync, 10000);
});

// ================= READ SHEET =================

async function loadSheetData() {
    const res = await fetch(scriptURL);
    const rows = await res.json();
    displaySheet(rows);
}

function displaySheet(rows) {
    const div = document.getElementById("sheetData");
    if (!div) return;

    div.innerHTML = "<h2>Scouting Data</h2>";

    rows.forEach(r => {
        div.innerHTML += `
        <div style="border:1px solid white;padding:6px;margin:6px">
            Match: ${r.GameNum}<br>
            Team: ${r.TeamNum}<br>
            Auto: ${r.AutoScore}<br>
            Tele: ${r.TeleScore}
        </div>`;
    });
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

    let queue = JSON.parse(localStorage.getItem('scoutingQueue') || "[]");
    queue.push(matchData);
    localStorage.setItem('scoutingQueue', JSON.stringify(queue));

    resetForm();
    updatePendingUI();

    if (navigator.onLine) autoSync();
}

// ================= SYNC =================

async function autoSync() {
    if (!navigator.onLine || isSyncing) return;

    let queue = JSON.parse(localStorage.getItem('scoutingQueue') || "[]");
    if (!queue.length) return;

    isSyncing = true;
    syncText.innerText = "Syncing...";

    for (const match of queue) {
        const form = new URLSearchParams(match);
        await fetch(scriptURL, {
            method: 'POST',
            body: formData
          });
          
    }

    localStorage.removeItem('scoutingQueue');
    syncText.innerText = "All Synced";
    isSyncing = false;
    updatePendingUI();
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
// ================= CONFIG =================

const scriptURL = 'https://script.google.com/macros/s/AKfycbylhXxTUWTUhqo1ttSM2dzOoqihT2bPtTKHkAUAtni1TEZo4Lo7Mduqu3ugPA1Q3QDVsA/exec';
let isSyncing = false;

// ================= PAGE LOAD =================

document.addEventListener('DOMContentLoaded', () => {

    // ---- LOAD SHEET DATA ----
    loadSheetData();

    // ---- LOAD TXT FILES ----
    const loaders = [
        { file: 'members.txt', id: 'memberSelect' },
        { file: 'games.txt', id: 'gameSelect' },
        { file: 'teams.txt', id: 'teamSelect' }
    ];

    loaders.forEach(loader => {
        fetch(loader.file)
            .then(r => r.text())
            .then(data => {
                const el = document.getElementById(loader.id);
                data.split('\n').forEach(v => {
                    if (v.trim()) {
                        const opt = document.createElement("option");
                        opt.value = opt.textContent = v.trim();
                        el.appendChild(opt);
                    }
                });
            });
    });

    // ---- COUNTERS ----
    const counters = [
        { add: "addPointBtn", sub: "removePointBtn", disp: "score" },
        { add: "addMissBtn", sub: "removeMissBtn", disp: "missCount" },
        { add: "teleAddDeliveryBtn", sub: "teleRemoveDeliveryBtn", disp: "teleDeliveryCount" },
        { add: "teleAddPointBtn", sub: "teleRemovePointBtn", disp: "teleScore" },
        { add: "teleAddMissBtn", sub: "teleRemoveMissBtn", disp: "teleMissCount" }
    ];

    counters.forEach(c => {
        const a = document.getElementById(c.add);
        const s = document.getElementById(c.sub);
        const d = document.getElementById(c.disp);

        if (a && s && d) {
            a.onclick = () => d.innerText = +d.innerText + 1;
            s.onclick = () => d.innerText = Math.max(0, +d.innerText - 1);
        }
    });

    updatePendingUI();
    window.addEventListener('online', autoSync);
    setInterval(autoSync, 10000);
});

// ================= READ SHEET =================

async function loadSheetData() {
    const res = await fetch(scriptURL);
    const rows = await res.json();
    displaySheet(rows);
}

function displaySheet(rows) {
    const div = document.getElementById("sheetData");
    if (!div) return;

    div.innerHTML = "<h2>Scouting Data</h2>";

    rows.forEach(r => {
        div.innerHTML += `
        <div style="border:1px solid white;padding:6px;margin:6px">
            Match: ${r.GameNum}<br>
            Team: ${r.TeamNum}<br>
            Auto: ${r.AutoScore}<br>
            Tele: ${r.TeleScore}
        </div>`;
    });
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

    let queue = JSON.parse(localStorage.getItem('scoutingQueue') || "[]");
    queue.push(matchData);
    localStorage.setItem('scoutingQueue', JSON.stringify(queue));

    resetForm();
    updatePendingUI();

    if (navigator.onLine) autoSync();
}

// ================= SYNC =================

async function autoSync() {
    if (!navigator.onLine || isSyncing) return;

    let queue = JSON.parse(localStorage.getItem('scoutingQueue') || "[]");
    if (!queue.length) return;

    isSyncing = true;
    syncText.innerText = "Syncing...";

    for (const match of queue) {
        const form = new URLSearchParams(match);
        await fetch(scriptURL, { method: "POST", body: form, mode: "no-cors" });
    }

    localStorage.removeItem('scoutingQueue');
    syncText.innerText = "All Synced";
    isSyncing = false;
    updatePendingUI();
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
