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
    
    // Perform and display calculations
    performCalculations(team1Name, team2Name);
}

// Function to perform the calculations based on the provided formulae
function performCalculations() {
    const team1Name = document.getElementById('team1-select').value;
    const team2Name = document.getElementById('team2-select').value;
    const timeRemaining = parseInt(document.getElementById('time-remaining-select').value, 10);

    const team1Data = baseData.find(team => team.team === team1Name);
    const team2Data = baseData.find(team => team.team === team2Name);

    if (!team1Data || !team2Data) return;

    console.log(`Calculating with team1: ${team1Name}, team2: ${team2Name}, timeRemaining: ${timeRemaining}`);

    // Calculate points per possession for each team
    const ptsPoss1 = parseFloat(team1Data.ptsGm) / parseFloat(team1Data.possGm);
    const ptsPoss2 = parseFloat(team2Data.ptsGm) / parseFloat(team2Data.possGm);

    // Calculate combined game points per possession
    const combPtsPoss = (ptsPoss1 + ptsPoss2) / 2;

    // Calculate game total xPoss
    const gmTotalxPoss = parseFloat(team1Data.possGm) + parseFloat(team2Data.possGm);

    // Calculate game total xPts
    const gmTotalxPts1 = combPtsPoss * gmTotalxPoss;
    const gmTotalxPts2 = parseFloat(team1Data.ptsGm) + parseFloat(team2Data.ptsGm);
    const gmTotalxPts = (gmTotalxPts1 + gmTotalxPts2) / 2;

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

    // Update the UI with calculated values
    document.getElementById('output-gm-total-xposs').textContent = gmTotalxPoss.toFixed(2);
    document.getElementById('output-xposs-remaining').textContent = xPossRemaining.toFixed(2);
    document.getElementById('output-gm-total-xpts').textContent = gmTotalxPts.toFixed(2);
    document.getElementById('output-xpts-remaining').textContent = xPtsRemaining.toFixed(2);

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
}

// Main initialization function
function initializeApp() {
    fetchAndPopulateBaseData(); // Fetch base data and populate dropdowns
    populateTimeRemainingDropdown(); // Populate time remaining dropdown
    attachEventListeners(); // Attach event listeners for dynamic updates
}

document.addEventListener('DOMContentLoaded', initializeApp);