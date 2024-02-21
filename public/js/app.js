// app.js (Client-side JavaScript)
let baseData = []; // Global storage for base data

// Fetch and populate base data from the server
async function fetchAndPopulateBaseData() {
    try {
        const response = await fetch('/api/baseData');
        baseData = await response.json(); // Store fetched data globally

        // Assuming baseData is an array of team objects
        // Populate team dropdowns
        populateDropdown('team1-select', baseData.map(team => team.team));
        populateDropdown('team2-select', baseData.map(team => team.team));

        // Set default values for demonstration
        setDefaultDropdownValues();

        // Now that we have base data, you can use it for client-side calculations

    } catch (error) {
        console.error('Error fetching base data:', error);
    }
}

// Populate dropdown with options
function populateDropdown(dropdownId, options) {
    const select = document.getElementById(dropdownId);
    select.innerHTML = ''; // Clear existing options
    options.forEach(option => {
        const optElement = document.createElement('option');
        optElement.value = option;
        optElement.textContent = option;
        select.appendChild(optElement);
    });
}

// Populate Time Remaining dropdown
function populateTimeRemainingDropdown() {
    const timeRemainingSelect = document.getElementById('time-remaining-select');
    for (let i = 1; i <= 40; i++) {
        const option = new Option(i.toString(), i);
        timeRemainingSelect.appendChild(option);
    }
}

// Function to set default dropdown values and trigger static data update
function setDefaultDropdownValues() {
    document.getElementById('team1-select').value = 'Colorado St';
    document.getElementById('team2-select').value = 'Colorado';
    document.getElementById('time-remaining-select').value = 10;
    
    // Trigger updates based on default selections
    updateStaticAndOutputValues();
}

function updateStaticAndOutputValues() {
    // Assuming 'team1-select' and 'team2-select' are your dropdowns for team selection
    const team1Name = document.getElementById('team1-select').value;
    const team2Name = document.getElementById('team2-select').value;
    
    // Fetch static data for the selected teams
    const team1StaticData = baseData.find(team => team.team === team1Name);
    const team2StaticData = baseData.find(team => team.team === team2Name);
    
    // Update the UI with static data
    updateStaticDataUI(team1StaticData, 'team1'); // 'team1' is a placeholder class or ID prefix
    updateStaticDataUI(team2StaticData, 'team2'); // 'team2' is a placeholder class or ID prefix
    
    // Update score headers with team names
    document.getElementById('team1-score-head').textContent = team1Name;
    document.getElementById('team2-score-head').textContent = team2Name;

    // Perform and display calculations
    performCalculations(team1Name, team2Name);
}

// Function to perform the calculations based on the provided formulae
function performCalculations() {
    const team1Name = document.getElementById('team1-select').value;
    const team2Name = document.getElementById('team2-select').value;
    const timeRemaining = parseInt(document.getElementById('time-remaining-select').value, 10);

    // Retrieve current scores from input fields
    const currentScoreTeam1 = parseInt(document.getElementById('current-score-team1').value, 10);
    const currentScoreTeam2 = parseInt(document.getElementById('current-score-team2').value, 10);

    const team1Data = baseData.find(team => team.team === team1Name);
    const team2Data = baseData.find(team => team.team === team2Name);

    if (!team1Data || !team2Data) return;

    console.log(`Calculating with team1: ${team1Name}, team2: ${team2Name}, timeRemaining: ${timeRemaining}`);

    // Calculate points per possession for each team
    const ptsPoss1 = parseFloat(team1Data.ptsGm) / parseFloat(team1Data.possGm);
    const ptsPoss2 = parseFloat(team2Data.ptsGm) / parseFloat(team2Data.possGm);

    // Ranking adjustment calculations integrated here
    const rankAdjustment1 = 1 + ((team2Data.defRank - team1Data.offRank) / 1000); // Simplified example
    const rankAdjustment2 = 1 + ((team1Data.defRank - team2Data.offRank) / 1000);

    const adjustedPtsPoss1 = ptsPoss1 * rankAdjustment1;
    const adjustedPtsPoss2 = ptsPoss2 * rankAdjustment2;

    // Calculate combined game points per possession
    const combPtsPoss = (adjustedPtsPoss1 + adjustedPtsPoss2) / 2;

    // Calculate game total xPoss
    // Calculate pace adjustment factor based on offensive and defensive rankings
    const paceAdjustmentFactor1 = 1 + ((Math.abs(team1Data.offRank - team2Data.defRank) / 362)*.125);
    const paceAdjustmentFactor2 = 1 + ((Math.abs(team2Data.offRank - team1Data.defRank) / 362)*.125);
    
    // Determine the team with the advantage
    const team1Advantage = (team1Data.offRank - team2Data.defRank) - (team2Data.offRank - team1Data.defRank);
    const team2Advantage = -team1Advantage; // Opposite of team1's advantage
    
    // Adjust gmTotalxPoss based on which team has the pacing advantage
    let gmTotalxPoss;
    if (team1Advantage > team2Advantage) {
        gmTotalxPoss = (parseFloat(team1Data.possGm) * paceAdjustmentFactor1) + parseFloat(team2Data.possGm);
    } else if (team2Advantage > team1Advantage) {
        gmTotalxPoss = (parseFloat(team2Data.possGm) * paceAdjustmentFactor2) + parseFloat(team1Data.possGm);
    } else {
        // If neither team has a clear advantage, default to their average paces
        gmTotalxPoss = parseFloat(team1Data.possGm) + parseFloat(team2Data.possGm);
    }

    // Calculate game total xPts
    const gmTotalxPts = combPtsPoss * gmTotalxPoss;
    // Flattening back to average
    // const gmTotalxPts2 = parseFloat(team1Data.ptsGm) + parseFloat(team2Data.ptsGm);
    // const gmTotalxPts = (gmTotalxPts1 + gmTotalxPts2) / 2;

    // Calculate xPts/Min and xPts Remaining based on Points per Game
    const xPtsMin = gmTotalxPts / 40;
    const xPtsRemaining1 = xPtsMin * timeRemaining;

    // Calculate Poss/Min and xPoss Remaining
    const possMin = gmTotalxPoss / 40;
    const xPossRemaining = possMin * timeRemaining;

    // Calculate xPts Remaining based on Possessions per Game
    const xPtsRemaining2 = xPossRemaining * combPtsPoss;

    // Calculate xPts Remaining Official
    const xPtsRemaining = (xPtsRemaining1 + xPtsRemaining2) / 2;

    // Adjusted xPts Remaining calculation
    const currentTotalScore = currentScoreTeam1 + currentScoreTeam2;
    const timePlayed = 40 - timeRemaining; // Assuming a standard game length of 40 minutes
    const pacePtsMin = currentTotalScore / timePlayed; // Points per minute played
    const paceAdjGmTotalxPts = pacePtsMin * 40; // Projected total score at current pace
    const paceAdjxPtsRemaining = pacePtsMin * timeRemaining; 

    let paceFlag = "On Pace";
    if (paceAdjGmTotalxPts < gmTotalxPts * 0.94) paceFlag = "Very Slow";
    else if (paceAdjGmTotalxPts < gmTotalxPts * 0.97) paceFlag = "Slow";
    else if (paceAdjGmTotalxPts > gmTotalxPts * 1.03) paceFlag = "Fast";
    else if (paceAdjGmTotalxPts > gmTotalxPts * 1.06) paceFlag = "Very Fast";

    // Update the UI with calculated values
    document.getElementById('output-gm-total-xposs').textContent = gmTotalxPoss.toFixed(2);
    document.getElementById('output-xposs-remaining').textContent = xPossRemaining.toFixed(2);
    document.getElementById('output-gm-total-xpts').textContent = gmTotalxPts.toFixed(2);
    document.getElementById('output-xpts-remaining').textContent = xPtsRemaining.toFixed(2);
    document.getElementById('output-pace-flag').textContent = paceFlag;
    document.getElementById('output-pace-adj-gm-total-xpts').textContent = paceAdjGmTotalxPts.toFixed(2);
    document.getElementById('output-pace-adj-xpts-remaining').textContent = paceAdjxPtsRemaining.toFixed(2);

    // Update static data UI for both teams
    updateStaticDataUI(team1Data); // You might need to separate UI elements for team 1 and team 2
    updateStaticDataUI(team2Data);
}

function updateStaticDataUI(teamData, teamPrefix) {
    // Update the UI with the team's static data
    // teamPrefix is either 'team1' or 'team2' to distinguish between the two teams in the UI
    if (teamData) {
        document.getElementById(`${teamPrefix}-rank`).textContent = teamData.rank;
        document.getElementById(`${teamPrefix}-rec`).textContent = teamData.rec;
        document.getElementById(`${teamPrefix}-offRank`).textContent = teamData.offRank;
        document.getElementById(`${teamPrefix}-defRank`).textContent = teamData.defRank;
        document.getElementById(`${teamPrefix}-possGm`).textContent = teamData.possGm;
        document.getElementById(`${teamPrefix}-ptsGm`).textContent = teamData.ptsGm;
        document.getElementById(`${teamPrefix}-fgPer`).textContent = teamData.fgPer;
        document.getElementById(`${teamPrefix}-threePer`).textContent = teamData.threePer;
        // Add more elements as needed
    }
}

// Attach event listeners to dropdowns for dynamic updates
function attachEventListeners() {
    document.getElementById('team1-select').addEventListener('change', updateStaticAndOutputValues);
    document.getElementById('team2-select').addEventListener('change', updateStaticAndOutputValues);
    document.getElementById('time-remaining-select').addEventListener('change', updateStaticAndOutputValues);
    document.getElementById('current-score-team1').addEventListener('change', updateStaticAndOutputValues);
    document.getElementById('current-score-team2').addEventListener('change', updateStaticAndOutputValues);
}

// Main initialization function
function initializeApp() {
    fetchAndPopulateBaseData(); // Fetch base data and populate dropdowns
    populateTimeRemainingDropdown(); // Populate time remaining dropdown
    attachEventListeners(); // Attach event listeners for dynamic updates
}

document.addEventListener('DOMContentLoaded', initializeApp);