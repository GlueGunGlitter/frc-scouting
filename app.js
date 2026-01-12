// ================= AUTO =================

// Auto Score
let autoScore = 0;
const autoScoreSpan = document.getElementById("score");
document.getElementById("addPointBtn").onclick = () => {
    autoScore++;
    autoScoreSpan.textContent = autoScore;
};
document.getElementById("removePointBtn").onclick = () => {
    if (autoScore > 0) autoScore--;
    autoScoreSpan.textContent = autoScore;
};

// Auto Miss
let autoMiss = 0;
const autoMissSpan = document.getElementById("missCount");
document.getElementById("addMissBtn").onclick = () => {
    autoMiss++;
    autoMissSpan.textContent = autoMiss;
};
document.getElementById("removeMissBtn").onclick = () => {
    if (autoMiss > 0) autoMiss--;
    autoMissSpan.textContent = autoMiss;
};


// ================= TELEOP =================

// TeleOp Score
let teleScore = 0;
const teleScoreSpan = document.getElementById("teleScore");
document.getElementById("teleAddPointBtn").onclick = () => {
    teleScore++;
    teleScoreSpan.textContent = teleScore;
};
document.getElementById("teleRemovePointBtn").onclick = () => {
    if (teleScore > 0) teleScore--;
    teleScoreSpan.textContent = teleScore;
};

// TeleOp Miss
let teleMiss = 0;
const teleMissSpan = document.getElementById("teleMissCount");
document.getElementById("teleAddMissBtn").onclick = () => {
    teleMiss++;
    teleMissSpan.textContent = teleMiss;
};
document.getElementById("teleRemoveMissBtn").onclick = () => {
    if (teleMiss > 0) teleMiss--;
    teleMissSpan.textContent = teleMiss;
};
