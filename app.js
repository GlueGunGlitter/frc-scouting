const scriptURL = 'https://script.google.com/macros/s/AKfycbwzGx-v6WLsDPiA-uuXnHvRs77kIRnkdCUpw1BpZzVR-o6bswkM8dR-x8GHXpONxQ5XyA/exec'; // Ensure this ends in /exec

document.addEventListener('DOMContentLoaded', () => {
    // Dropdown Loaders (Your original logic)
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

    // Counter Logic
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
});

// --- 1. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    updatePendingUI();
    window.addEventListener('online', syncData);
    // Try to sync on startup if internet is available
    if (navigator.onLine) syncData();
});

// --- 2. THE MAIN SUBMIT ACTION ---
function submitToSheet() {
    const btn = document.getElementById("finalSubmitBtn");
    btn.disabled = true;
    btn.innerText = "Saving...";

    // Collect data from all your fields
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
        'id': Date.now() // Unique ID to track this specific match
    };

    // ALWAYS save to local storage first
    saveToLocalStorage(matchData);
    
    // Clear the form for the next match immediately
    resetForm();
    
    // Attempt to sync if online
    if (navigator.onLine) {
        syncData();
    } else {
        alert("Offline: Match saved to device. It will sync automatically when you have internet.");
    }
}

// --- 3. STORAGE HELPERS ---
function saveToLocalStorage(data) {
    let queue = JSON.parse(localStorage.getItem('scoutingQueue') || "[]");
    queue.push(data);
    localStorage.setItem('scoutingQueue', JSON.stringify(queue));
    updatePendingUI();
}

function updatePendingUI() {
    const queue = JSON.parse(localStorage.getItem('scoutingQueue') || "[]");
    document.getElementById("pendingCount").innerText = queue.length;
}

// --- 4. THE SYNCER (Uploads Everything) ---
async function syncData() {
    let queue = JSON.parse(localStorage.getItem('scoutingQueue') || "[]");
    if (queue.length === 0) return;

    console.log(`Attempting to sync ${queue.length} matches...`);

    // Use a loop to send matches one by one
    for (let i = 0; i < queue.length; i++) {
        const match = queue[i];
        const formData = new URLSearchParams();
        for (const key in match) { formData.append(key, match[key]); }

        try {
            await fetch(scriptURL, { method: 'POST', body: formData, mode: 'no-cors' });
            console.log(`Match ${match.id} synced.`);
        } catch (err) {
            console.error("Sync failed for match", match.id);
            return; // Stop trying if we lost connection during the loop
        }
    }

    // If we get here, all matches were sent
    localStorage.removeItem('scoutingQueue');
    updatePendingUI();
    alert("All pending matches have been successfully synced to Google Sheets!");
}

// --- 5. RESET FORM (So you can do the next match) ---
function resetForm() {
    // Reset scores to 0
    document.querySelectorAll('[id$="score"], [id$="Count"]').forEach(el => el.innerText = "0");
    // Uncheck boxes
    document.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
    // Clear text
    document.getElementById("userInput").value = "";
    // Re-enable button
    const btn = document.getElementById("finalSubmitBtn");
    btn.disabled = false;
    btn.innerText = "Submit Scouting Data";
}
