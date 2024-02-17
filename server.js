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

app.get('/api/teams', async (req, res) => {
    const googleSheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.SPREADSHEET_ID;
    const range = 'Calc!B2:B363';

    try {
        const response = await googleSheets.spreadsheets.values.get({ spreadsheetId, range });
        const teamNames = response.data.values.flat();
        res.json(teamNames);
    } catch (error) {
        console.error('Error fetching team names:', error);
        res.status(500).send(`Error fetching team names: ${error.message}`);
    }
});

app.post('/api/updateInputSelection', async (req, res) => {
    const { cellId, teamName } = req.body;
    const googleSheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.SPREADSHEET_ID;

    try {
        await googleSheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Calc!${cellId}`,
            valueInputOption: 'USER_ENTERED',
            resource: { values: [[teamName]] },
        });
        res.json({ message: 'Input selection updated.' });
    } catch (error) {
        console.error('Error updating input selection:', error);
        res.status(500).send(`Error updating input selection: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
