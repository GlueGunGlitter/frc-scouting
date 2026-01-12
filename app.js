// Auto Score Counter
let score1 = 0;
const scoreSpan = document.getElementById("score");
const addPointBtn = document.getElementById("addPointBtn");
const removePointBtn = document.getElementById("removePointBtn");

addPointBtn.addEventListener("click", () => {
    score1++;
    scoreSpan.textContent = score1;
});

removePointBtn.addEventListener("click", () => {
    if(score1 > 0) score1--;
    scoreSpan.textContent = score1;
});

// Times Missed Counter
let misses1 = 0;
const missSpan = document.getElementById("missCount");
const addMissBtn = document.getElementById("addMissBtn");
const removeMissBtn = document.getElementById("removeMissBtn");

addMissBtn.addEventListener("click", () => {
    misses1++;
    missSpan.textContent = misses1;
});

removeMissBtn.addEventListener("click", () => {
    if(misses1 > 0) misses1--;
    missSpan.textContent = misses1;
});

