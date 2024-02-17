// app.js (Client-side JavaScript)

// Ensure the DOM is fully loaded before executing the script
document.addEventListener('DOMContentLoaded', async () => {
    await fetchAndPopulateTeamNames();
    setDefaultDropdownValues();
    await fetchAndDisplayStaticData();
    attachEventListeners();
});

async function fetchAndPopulateTeamNames() {
    try {
        const Response = await fetch('/api/teams');
        const teamNames = await Response.json();
        populateDropdown('team1-select', teamNames);
        populateDropdown('team2-select', teamNames);
    } catch (error) {
        console.error('Error fetching team names:', error);
    }
}

function populateDropdown(dropdownId, options) {
    const select = document.getElementById(dropdownId);
    options.forEach(option => {
        let opt = new Option(option, option);
        select.appendChild(opt);
    });
}

// Populate Time Remaining dropdown
const timeRemainingSelect = document.getElementById('time-remaining-select');
for (let i = 1; i <= 40; i++) {
    timeRemainingSelect.add(new Option(i, i));
}

function setDefaultDropdownValues() {
    // Assuming the default team names are the first and second team in the list for simplicity
    // Note: Adjust these based on your actual default values or logic
    const defaultTeam1 = 'Colorado St'; // Replace with your actual default team name
    const defaultTeam2 = 'Colorado'; // Replace with your actual default team name
    const defaultTimeRemaining = 10; // Default time remaining

    document.getElementById('team1-select').value = defaultTeam1; // Default team1
    document.getElementById('team2-select').value = defaultTeam2; // Default team2
    document.getElementById('time-remaining-select').value = defaultTimeRemaining; // Default time remaining

    // Immediately update the sheet with default values on load
    updateInputSelection('AH3', defaultTeam1);
    updateInputSelection('AH18', defaultTeam2);
    updateInputSelection('AH33', defaultTimeRemaining.toString());
}

async function updateInputSelection(cellId, value) {
    try {
        await fetch('/api/updateInputSelection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cellId, value })
        });
    } catch (error) {
        console.error(`Error updating selection for cell ${cellId}:`, error);
    }
}

async function fetchAndDisplayStaticData() {
    try {
        const staticDataResponse = await fetch('/api/staticData');
        const staticData = await staticDataResponse.json();
        staticData.forEach((data, index) => {
            const elementId = `cell-${index + 1}`; // Assuming cell-x matches the order in staticData
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = data[0];
            }
        });
    } catch (error) {
        console.error('Error fetching static data:', error);
    }
}

function attachEventListeners() {
    // Attach event listeners for dropdown changes
    document.getElementById('team1-select').addEventListener('change', async function() {
        await updateInputSelection('AH3', this.value);
        await fetchAndDisplayStaticData(); // Re-fetch and display static data after selection
    });

    document.getElementById('team2-select').addEventListener('change', async function() {
        await updateInputSelection('AH18', this.value);
        await fetchAndDisplayStaticData(); // Re-fetch and display static data after selection
    });

    document.getElementById('time-remaining-select').addEventListener('change', async function() {
        await updateInputSelection('AH33', this.value);
        await fetchAndDisplayStaticData(); // Re-fetch and display static data after selection
    });
}
