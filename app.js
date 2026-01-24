// 1. CONFIGURATION
const scriptURL = 'https://script.google.com/macros/s/AKfycbwzGx-v6WLsDPiA-uuXnHvRs77kIRnkdCUpw1BpZzVR-o6bswkM8dR-x8GHXpONxQ5XyA/exec';
let isSyncing = false; // Prevents multiple syncs from running at once

// 2. INITIALIZATION (Runs when page loads)
document.addEventListener('DOMContentLoaded', () => {
    // --- LOAD TEXT FILES (Your original logic) ---
    const loaders = [
        { file: 'members.txt', id: 'memberSelect' },
        { file: 'games.txt', id: 'gameSelect' },
        { file: 'teams.txt', id: 'teamSelect' }
    ];

    loaders.forEach(loader => {
        fetch(loader.file)
            .then(res => res.text())
            .then(data => {
                const el = document.getElementById(loader.id);
                data.split('\n').forEach(val => {
                    if(val.trim()){
                        let opt = document.createElement("option");
                        opt.value = opt.textContent = val.trim();
                        el.appendChild(opt);
                    }
                });
            }).catch(e => console.error("Load Error:", e));
    });

    // --- COUNTER LOGIC ---
    const counters = [
        { add: "addPointBtn", sub: "removePointBtn", disp: "score" },
        { add: "addMissBtn", sub: "removeMissBtn", disp: "missCount" },
        { add: "teleAddDeliveryBtn", sub: "teleRemoveDeliveryBtn", disp: "teleDeliveryCount" },
        { add: "teleAddPointBtn", sub: "teleRemovePointBtn", disp: "teleScore" },
        { add: "teleAddMissBtn", sub: "teleRemoveMissBtn", disp: "teleMissCount" }
    ];

    counters.forEach(c => {
        const a = document.getElementById(c.add), s = document.getElementById(c.sub), d = document.getElementById(c.disp);
        if(a && s && d) {
            a.onclick = () => d.innerText = parseInt(d.innerText) + 1;
            s.onclick = () => { let v = parseInt(d.innerText); if(v > 0) d.innerText = v - 1; };
        }
    });

    // --- HEARTBEAT SYNC ---
    updatePendingUI();
    window.addEventListener('online', autoSync);
    setInterval(autoSync, 10000); // Check for internet/unsynced data every 10 seconds
});

// 3. SUBMIT FUNCTION
function submitToSheet() {
    const btn = document.getElementById("finalSubmitBtn");
    btn.disabled = true;
    btn.innerText = "Saving Match...";

    try {
        const matchData = {
            'Scouter': document.getElementById("memberSelect").value,
            'GameNum': document.getElementById("gameSelect").value,
            'TeamNum': document.getElementById("teamSelect").value,
            'StartPos': document.getElementById("startingPoint").value,
            'AutoCross': document.getElementById("autoCross").checked ? "Yes" : "No",
            'AutoScore': document.getElementById("score").innerText,
            'AutoMiss': document.getElementById("missCount").innerText,
            'AutoClimb': document.getElementById("Auto_Climb").value,
            'AutoCollect': document.getElementById("collect").checked ? "Yes" : "No",
            'TeleDeliveries': document.getElementById("teleDeliveryCount").innerText,
            'TeleScore': document.getElementById("teleScore").innerText,
            'TeleMiss': document.getElementById("teleMissCount").innerText,
            'ObstacleA': document.getElementById("obstacleA").checked ? "Yes" : "No",
            'ObstacleB': document.getElementById("obstacleB").checked ? "Yes" : "No",
            'EndClimb': document.getElementById("Climb").value,
            'EndClimbDir': document.getElementById("Climb_Direction").value,
            'AutoWorked': document.getElementById("autoWorked").checked ? "Yes" : "No",
            'RobotFailed': document.getElementById("robotFailed").checked ? "Yes" : "No",
            'ScoringSpeed': document.getElementById("ScoringSpeed").value,
            'Comments': document.getElementById("userInput").value,
            'id': Date.now()
        };

        // Save to LocalStorage
        let queue = JSON.parse(localStorage.getItem('scoutingQueue') || "[]");
        queue.push(matchData);
        localStorage.setItem('scoutingQueue', JSON.stringify(queue));

        updatePendingUI();
        resetForm();
        autoSync(); // Trigger a sync attempt immediately

    } catch (e) {
        btn.disabled = false;
        btn.innerText = "Submit Scouting Data";
        console.error("Collection Error:", e);
        alert("Error saving match. Check that all fields are correct.");
    }
}

// 4. SYNC LOGIC
async function autoSync() {
    const queue = JSON.parse(localStorage.getItem('scoutingQueue') || "[]");
    if (navigator.onLine && !isSyncing && queue.length > 0) {
        await syncData();
    }
}

async function syncData() {
    let queue = JSON.parse(localStorage.getItem('scoutingQueue') || "[]");
    if (queue.length === 0) return;

    isSyncing = true;
    const statusText = document.getElementById("syncText");
    if(statusText) statusText.innerText = "Syncing...";

    for (let i = 0; i < queue.length; i++) {
        const match = queue[i];
        const formData = new URLSearchParams();
        for (const key in match) { formData.append(key, match[key]); }

        try {
            // [MDN Fetch API](https://developer.mozilla.org)
            await fetch(scriptURL, { method: 'POST', body: formData, mode: 'no-cors' });
        } catch (err) {
            console.error("Sync interrupted:", err);
            isSyncing = false;
            if(statusText) statusText.innerText = "Connection Error";
            return;
        }
    }

    localStorage.removeItem('scoutingQueue');
    isSyncing = false;
    if(statusText) statusText.innerText = "All Synced";
    updatePendingUI();
}

// 5. HELPERS
function updatePendingUI() {
    const queue = JSON.parse(localStorage.getItem('scoutingQueue') || "[]");
    const countEl = document.getElementById("pendingCount");
    if (countEl) countEl.innerText = queue.length;
}

function resetForm() {
    document.querySelectorAll('[id$="score"], [id$="Count"]').forEach(el => el.innerText = "0");
    document.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
    document.getElementById("userInput").value = "";
    const btn = document.getElementById("finalSubmitBtn");
    btn.disabled = false;
    btn.innerText = "Submit Scouting Data";
}
