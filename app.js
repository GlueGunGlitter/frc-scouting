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

function submitToSheet() {
    const btn = document.getElementById("finalSubmitBtn");
    btn.disabled = true;
    btn.innerText = "Submitting...";

    try {
        const data = {
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
            'Comments': document.getElementById("userInput").value
        };

        const formData = new URLSearchParams();
        for (const key in data) { formData.append(key, data[key]); }

        fetch(scriptURL, { method: 'POST', body: formData, mode: 'no-cors' })
            .then(() => {
                alert("Success! Data sent.");
                window.location.reload();
            })
            .catch(err => {
                btn.disabled = false;
                btn.innerText = "Submit Scouting Data";
                alert("Upload failed. Check your internet.");
            });

    } catch (e) {
        btn.disabled = false;
        btn.innerText = "Submit Scouting Data";
        console.error("Data collection error:", e);
        alert("Error: One of your HTML elements is missing an ID!");
    }
}
