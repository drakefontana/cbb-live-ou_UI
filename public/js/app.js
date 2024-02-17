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
    async function updateTeamSelection(cellId, teamName) {
        try {
            await fetch('/api/updateTeamSelection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cellId, teamName }),
            });
            // Handle response or update UI as necessary
        } catch (error) {
            console.error('Error updating team selection:', error);
        }
    }

    // Event listeners for team selection changes
    team1Select.addEventListener('change', () => updateTeamSelection('AH3', team1Select.value));
    team2Select.addEventListener('change', () => updateTeamSelection('AH18', team2Select.value));
});
