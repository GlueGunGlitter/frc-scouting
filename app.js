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
    btn.innerText = "Saving...";

    try {
        const matchData = {
            'Scouter': document.getElementById("memberSelect").value,
            'GameNum': document.getElementById("gameSelect").value,
            'TeamNum': document.getElementById("teamSelect").value,
            'StartPos': document.getElementById("startingPoint").value,
            'AutoCross': document.getElementById("autoCross")?.checked ? "Yes" : "No",
            'AutoScore': document.getElementById("score").innerText,
            'AutoMiss': document.getElementById("missCount").innerText,
            'AutoClimb': document.getElementById("Auto_Climb").value,
            'AutoCollect': document.getElementById("collect")?.checked ? "Yes" : "No",
            'TeleDeliveries': document.getElementById("teleDeliveryCount").innerText,
            'TeleScore': document.getElementById("teleScore").innerText,
            'TeleMiss': document.getElementById("teleMissCount").innerText,
            'ObstacleA': document.getElementById("obstacleA")?.checked ? "Yes" : "No",
            'ObstacleB': document.getElementById("obstacleB")?.checked ? "Yes" : "No",
            'EndClimb': document.getElementById("Climb").value,
            'EndClimbDir': document.getElementById("Climb_Direction").value,
            'AutoWorked': document.getElementById("autoWorked")?.checked ? "Yes" : "No",
            'RobotFailed': document.getElementById("robotFailed")?.checked ? "Yes" : "No",
            'ScoringSpeed': document.getElementById("ScoringSpeed").value,
            'Comments': document.getElementById("userInput").value,
            'id': Date.now()
        };

        // 1. Get existing queue
        let queue = JSON.parse(localStorage.getItem('scoutingQueue') || "[]");
        
        // 2. Add new match
        queue.push(matchData);
        
        // 3. Save back to storage
        localStorage.setItem('scoutingQueue', JSON.stringify(queue));
        console.log("Match saved! Current queue size:", queue.length);

        // 4. Update the UI number IMMEDIATELY
        updatePendingUI();
        
        // 5. Reset the form
        resetForm();
        
        // 6. Only try to sync if online
        if (navigator.onLine) {
            autoSync();
        }

    } catch (e) {
        btn.disabled = false;
        btn.innerText = "Submit Scouting Data";
        console.error("Critical Error saving match:", e);
        alert("Check Console (F12) - an ID might be missing in your HTML.");
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
    const rawData = localStorage.getItem('scoutingQueue');
    const queue = JSON.parse(rawData || "[]");
    
    const countEl = document.getElementById("pendingCount");
    if (countEl) {
        countEl.innerText = queue.length;
        console.log("UI Updated. Count is now:", countEl);
    } else {
        console.warn("Element 'pendingCount' not found in HTML!");
    }
}

function resetForm() {
    document.querySelectorAll('[id$="score"], [id$="Count"]').forEach(el => el.innerText = "0");
    document.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
    document.getElementById("userInput").value = "";
    const btn = document.getElementById("finalSubmitBtn");
    btn.disabled = false;
    btn.innerText = "Submit Scouting Data";
}
// --- Place this at the very bottom of your app.js ---

function updatePendingUI() {
    // 1. Get the current list from storage
    const queue = JSON.parse(localStorage.getItem('scoutingQueue') || "[]");
    
    // 2. Find the element on the page
    const countEl = document.getElementById("pendingCount");
    
    // 3. Update the number only if the element exists

}

// --- Force update whenever storage changes (even in other tabs) ---
window.addEventListener('storage', (e) => {
    if (e.key === 'scoutingQueue') {
        updatePendingUI();
    }
});

