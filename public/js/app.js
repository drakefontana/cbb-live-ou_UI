// app.js (Client-side JavaScript)

document.addEventListener('DOMContentLoaded', async () => {
    const team1Select = document.getElementById('team1-select');
    const team2Select = document.getElementById('team2-select');

    // Fetch and populate team names
    try {
        const response = await fetch('/api/teams');
        const teamNames = await response.json();

        teamNames.forEach(name => {
            team1Select.add(new Option(name, name));
            team2Select.add(new Option(name, name));
        });
    } catch (error) {
        console.error('Error fetching team names:', error);
    }

    // Function to update team selection
    async function updateInputSelection(cellId, teamName) {
        try {
            await fetch('/api/updateInputSelection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cellId, teamName }),
            });
            // Handle response or update UI as necessary
        } catch (error) {
            console.error('Error updating team selection:', error);
        }
    }

    // Assuming the default team names are the first and second team in the list for simplicity
    // Note: Adjust these based on your actual default values or logic
    const defaultTeam1 = 'Colorado St'; // Replace with your actual default team name
    const defaultTeam2 = 'Colorado'; // Replace with your actual default team name
    const defaultTimeRemaining = 10; // Default time remaining

    // Function to set default values for the dropdowns
    function setDefaultDropdownValues() {
        // Set default team selections
        document.getElementById('team1-select').value = defaultTeam1;
        document.getElementById('team2-select').value = defaultTeam2;
        updateInputSelection('AH3', defaultTeam1);
        updateInputSelection('AH18', defaultTeam2);

        // Set default time remaining
        document.getElementById('time-remaining-select').value = defaultTimeRemaining;
        updateInputSelection('AH33', defaultTimeRemaining.toString()); // Convert number to string if necessary
    }

    // Populate Time Remaining dropdown
    const timeRemainingSelect = document.getElementById('time-remaining-select');
    for (let i = 1; i <= 40; i++) {
        timeRemainingSelect.add(new Option(i, i));
    }

    // Function to update Google Sheet cell
    async function updateInputSelection(cellId, value) {
        try {
            await fetch('/api/updateInputSelection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cellId, value }), // 'value' can be team name or time remaining
            });
            // Optionally, handle the response or update the UI
        } catch (error) {
            console.error('Error updating Google Sheet:', error);
        }
    }

    // Set default values after populating dropdowns
    setDefaultDropdownValues();

    // Event listeners for team selection changes
    // Update Time Remaining in Google Sheet
    timeRemainingSelect.addEventListener('change', () => {
        updateInputSelection('AH33', timeRemainingSelect.value); // Assuming 'AH33' is the correct cell for Time Remaining
    });
    team1Select.addEventListener('change', () => updateInputSelection('AH3', team1Select.value));
    team2Select.addEventListener('change', () => updateInputSelection('AH18', team2Select.value));
});
