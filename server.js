import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = 3000;

const scheduleUrl = (startDate, endDate) => `https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate=${startDate}&endDate=${endDate}`;

const formatDate = (date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

app.use(express.static('public'));

app.get('/api/schedule', async (req, res) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const startDate = formatDate(yesterday);
  const endDate = formatDate(tomorrow);

  const url = scheduleUrl(startDate, endDate);

  try {
    const response = await fetch(url);
    const data = await response.json();
    const games = data.dates.flatMap((date) => {
      return date.games.map((game) => ({
        date: date.date,
        homeTeam: game.teams.home.team.name,
        homeTeamId: game.teams.home.team.id,
        awayTeam: game.teams.away.team.name,
        awayTeamId: game.teams.away.team.id,
        gameTime: game.gameDate,
        startTimeTBD: game.status.startTimeTBD,
      }));
    });
    res.json(games);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching schedule data.');
  }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
