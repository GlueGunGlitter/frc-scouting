const teamSelect = document.getElementById("teamSelect");

const memberSelect = document.getElementById("memberSelect");

const gameSelect = document.getElementById("gameSelect");

fetch('members.txt')
  .then(response => response.text())
  .then(data => {
    const members = data.split('\n'); // split each line into an array
    members.forEach(member => {
        const option = document.createElement("option");
        option.value = member.trim();
        option.textContent = member.trim();
        memberSelect.appendChild(option);
    });
  })
  .catch(error => console.error("Error loading member list:", error));

fetch('games.txt')
  .then(response => response.text())
  .then(data => {
    const games =data.split('\n');
    games.forEach(game =>{
        const option = document.createElement("option");
        option.value = game.trim();
        option.textContent = game.trim();
        gameSelect.appendChild(option);
    });
  })
  .catch(error => console.error("Error loading game list:", error));



// Load the teams from a text file
fetch('teams.txt')
    .then(response => response.text())
    .then(data => {
        const teams = data.split('\n'); // split each line into an array
        teams.forEach(team => {
            const option = document.createElement("option");
            option.value = team.trim();  // remove extra spaces
            option.textContent = team.trim();
            teamSelect.appendChild(option);
        });
    })
    .catch(error => console.error("Error loading team list:", error));


    function displayValue() {
    // 1. Get the input element using its ID
    const inputElement = document.getElementById("userInput");

    // 2. Get the value entered by the user
    const inputValue = inputElement.value;

    // 3. Use the value (e.g., display it in another HTML element)
    const outputArea = document.getElementById("outputArea");
    outputArea.textContent = "You typed: " + inputValue;

    // Optional: Clear the input box after submission
    inputElement.value = '';
}



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


// Auto Climb (Autonomous)
const autoClimbSelect = document.getElementById("Auto_Climb");
let selectedAutoClimb = ""; // variable to store the choice

autoClimbSelect.addEventListener("change", () => {
    selectedAutoClimb = autoClimbSelect.value;
    console.log("Auto Climb Choice:", selectedAutoClimb);
});

autoClimbSelect.addEventListener("change", () => {
    selectedAutoClimb = autoClimbSelect.options[autoClimbSelect.selectedIndex].text;
    console.log("Auto Climb Text:", selectedAutoClimb);
});




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

// ================= TELEOP DELIVERY =================

let teleDelivery = 0;
const teleDeliverySpan = document.getElementById("teleDeliveryCount");

document.getElementById("teleAddDeliveryBtn").onclick = () => {
    teleDelivery++;
    teleDeliverySpan.textContent = teleDelivery;
};

document.getElementById("teleRemoveDeliveryBtn").onclick = () => {
    if (teleDelivery > 0) teleDelivery--;
    teleDeliverySpan.textContent = teleDelivery;
};

const obstacleA = document.getElementById("obstacleA");
const obstacleB = document.getElementById("obstacleB");

// Example: log whenever a checkbox changes
obstacleA.addEventListener("change", () => {
    console.log("Obstacle A passed:", obstacleA.checked);
});

obstacleB.addEventListener("change", () => {
    console.log("Obstacle B passed:", obstacleB.checked);
});
//ENDGAME
const climbSelect = document.getElementById("Climb");

climbSelect.addEventListener("change", () => {
    selectedClimb = climbSelect.options[climbSelect.selectedIndex].text;
    console.log("Endgame Climb Text:", selectedClimb);
});

const climbDirectionSelect = document.getElementById("Climb_Direction");
let selectedClimbDirection = ""; // store the choice
climbDirectionSelect.addEventListener("change", () => {
    selectedClimbDirection = climbDirectionSelect.value;
    console.log("Climb Direction Choice:", selectedClimbDirection);
    const selectedText = climbDirectionSelect.options[climbDirectionSelect.selectedIndex].text;

});


