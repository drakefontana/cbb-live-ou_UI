import express from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, './credentials/cbb-live-ou-bb85d1a4646c.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function getGoogleSheetsClient() {
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: 'v4', auth: client });
    return googleSheets;
}

// Fetch team names for the dropdowns
app.get('/api/teams', async (req, res) => {
    const googleSheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.SPREADSHEET_ID;
    const range = 'Calc!B2:B363'; // Assuming teams are listed in these cells

    try {
        const response = await googleSheets.spreadsheets.values.get({ spreadsheetId, range });
        const teamNames = response.data.values.flat();
        res.json(teamNames);
    } catch (error) {
        console.error('Error fetching team names:', error);
        res.status(500).send(`Error fetching team names: ${error.message}`);
    }
});

// Fetch base data from google sheet table
app.get('/api/baseData', async (req, res) => {
    const googleSheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.SPREADSHEET_ID;
    // Adjust the range to include all teams and relevant columns
    const range = 'Calc!A2:AH363'; // Example range, adjust according to your sheet

    try {
        const response = await googleSheets.spreadsheets.values.get({ spreadsheetId, range });
        const rows = response.data.values;
        const teamsData = rows.map((row) => {
            // Map each row to an object with relevant properties
            return {
                rank: row[0], // column A
                team: row[1], // column B
                conf: row[2], // column C
                rec: row[3], // column D
                offRtg: row[5], // column F
                offRank: row[6], // column G
                defRtg: row[7], // column H
                defRank: row[8], // column I
                possGm: row[9],  // column J
                possGmRank: row[10],  // column K
                ptsGm: row[23], // column X
                fgPer: row[26],  // column AA
                threePer: row[29] // column AD
                // Add more properties as needed
            };
        });
        res.json(teamsData);
    } catch (error) {
        console.error('Error fetching base data:', error);
        res.status(500).send(`Error fetching base data: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
