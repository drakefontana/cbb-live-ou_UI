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

// Update team selection or time remaining in Google Sheet
app.post('/api/updateInputSelection', async (req, res) => {
    console.log(req.body); // Log the entire request body for debugging
    const { cellId, value } = req.body;
    const googleSheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.SPREADSHEET_ID;

    try {
        await googleSheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Calc!${cellId}`, // Cell to update, e.g., 'AH3'
            valueInputOption: 'USER_ENTERED',
            resource: { values: [[value]] },
        });
        console.log(`Received request to update ${cellId} with value ${value}`);
        res.json({ message: 'Input selection updated.' });
    } catch (error) {
        console.error('Error updating input selection:', error);
        res.status(500).send(`Error updating input selection: ${error.message}`);
    }
});

// Fetch static data
app.get('/api/staticData', async (req, res) => {
    const googleSheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.SPREADSHEET_ID;
    const range = 'Calc!AH1:AH43'; // Adjust as necessary

    try {
        const response = await googleSheets.spreadsheets.values.get({ spreadsheetId, range });
        const staticData = response.data.values;
        res.json(staticData);
    } catch (error) {
        console.error('Error fetching static data:', error);
        res.status(500).send(`Error fetching static data from Google Sheets: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
