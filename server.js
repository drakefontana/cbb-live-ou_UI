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
    credentials: {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'), // Important for parsing newlines correctly
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: process.env.GOOGLE_AUTH_URI,
      token_uri: process.env.GOOGLE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL
    },
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
    const range = 'Calc!A2:AW363'; // Example range, adjust according to your sheet

    try {
        const response = await googleSheets.spreadsheets.values.get({ spreadsheetId, range });
        const rows = response.data.values;
        const teamsData = rows.map((row) => {
            // console.log('Processing row:', row); // Log each row
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
                threePer: row[29], // column AD
                ptsOppGm: row[35], // column AJ
                colorPri: row[46], // column AU
                colorSec: row[47], // column AV
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
