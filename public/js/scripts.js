function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

function populateTable(games, day) {
  const scheduleTable = document.getElementById(day).getElementsByTagName('tbody')[0];
  scheduleTable.innerHTML = ''; // Clear the table before populating

  const today = new Date();
  const currentDate = new Date(today);

  if (day === 'yesterday') {
    currentDate.setDate(today.getDate() - 1);
  } else if (day === 'tomorrow') {
    currentDate.setDate(today.getDate() + 1);
  }

  const currentDateString = formatDate(currentDate);

  games
    .filter((game) => currentDateString === game.date)
    .forEach((game) => {
      const newRow = scheduleTable.insertRow();

      const dateCell = newRow.insertCell();
      dateCell.textContent = game.date;

      const homeTeamCell = newRow.insertCell();
      homeTeamCell.textContent = game.homeTeam;

      const awayTeamCell = newRow.insertCell();
      awayTeamCell.textContent = game.awayTeam;

      const gameTimeCell = newRow.insertCell();
      if (game.startTimeTBD) {
        gameTimeCell.textContent = "TBD";
      } else {
        const gameTime = new Date(game.gameTime);
        gameTimeCell.textContent = gameTime.toLocaleTimeString();
      }
    });
}

function teamAbbreviation(teamName) {
  const teamAbbreviations = {
    'Arizona Diamondbacks': 'ARZ',
    'Atlanta Braves': 'ATL',
    'Baltimore Orioles': 'BAL',
    'Boston Red Sox': 'BOS',
    'Chicago White Sox': 'CHW',
    'Chicago Cubs': 'CHC',
    'Cincinnati Reds': 'CIN',
    'Cleveland Guardians': 'CLE',
    'Colorado Rockies': 'COL',
    'Detroit Tigers': 'DET',
    'Houston Astros': 'HOU',
    'Kansas City Royals': 'KC',
    'Los Angeles Angels': 'LAA',
    'Los Angeles Dodgers': 'LAD',
    'Miami Marlins': 'MIA',
    'Milwaukee Brewers': 'MIL',
    'Minnesota Twins': 'MIN',
    'New York Yankees': 'NYY',
    'New York Mets': 'NYM',
    'Oakland Athletics': 'OAK',
    'Philadelphia Phillies': 'PHI',
    'Pittsburgh Pirates': 'PIT',
    'San Diego Padres': 'SD',
    'San Francisco Giants': 'SF',
    'Seattle Mariners': 'SEA',
    'St. Louis Cardinals': 'STL',
    'Tampa Bay Rays': 'TB',
    'Texas Rangers': 'TEX',
    'Toronto Blue Jays': 'TOR',
    'Washington Nationals': 'WSH'
  };

  return teamAbbreviations[teamName] || teamName;
}


async function fetchSchedule() {
  const response = await fetch('/api/schedule');
  const games = await response.json();

  const scheduleContainer = document.getElementById('schedule');

  games.forEach((game) => {
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';

    const teamContainer = document.createElement('div');
    teamContainer.className = 'team-container';

    const homeTeam = document.createElement('p');
    homeTeam.className = `game-info team team-${game.homeTeamId}`;
    homeTeam.textContent = `${teamAbbreviation(game.homeTeam)}`;

    const awayTeam = document.createElement('p');
    awayTeam.className = `game-info team team-${game.awayTeamId}`;
    awayTeam.textContent = `${teamAbbreviation(game.awayTeam)}`;

    teamContainer.appendChild(homeTeam);
    teamContainer.appendChild(awayTeam);

    gameCard.appendChild(teamContainer);

    const gameTime = document.createElement('p');
    gameTime.className = 'game-time';
    if (game.startTimeTBD) {
      gameTime.textContent = 'TBD';
    } else {
      const gameStartTime = new Date(game.gameTime);
      gameTime.textContent = `${gameStartTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }).toLowerCase()}`;
    }
    gameCard.appendChild(gameTime);
    gameCard.setAttribute('data-date', game.date);

    scheduleContainer.appendChild(gameCard);
  });
}


function changeTab(event, day) {
  const currentDate = new Date();
  let selectedDate;

  if (day === 'yesterday') {
    selectedDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
  } else if (day === 'tomorrow') {
    selectedDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
  } else {
    selectedDate = currentDate;
  }

  const selectedDateString = formatDate(selectedDate);
  const gameCards = document.getElementsByClassName('game-card');

  for (let i = 0; i < gameCards.length; i++) {
    if (gameCards[i].getAttribute('data-date') === selectedDateString) {
      gameCards[i].style.display = 'inline-flex';
    } else {
      gameCards[i].style.display = 'none';
    }
  }

  const tablinks = document.getElementsByClassName('tablinks');
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(' active', '');
  }
  if (event) {
  event.currentTarget.className += ' active';
  }
}

function scrollSchedule(direction) {
  const scheduleContainer = document.getElementById('schedule');
  const scrollAmount = window.innerWidth * 0.6; // 60% of the viewport width

  if (direction === 'left') {
    scheduleContainer.scrollBy({
      top: 0,
      left: -scrollAmount,
      behavior: 'smooth',
    });
  } else {
    scheduleContainer.scrollBy({
      top: 0,
      left: scrollAmount,
      behavior: 'smooth',
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchSchedule().then(() => {
    const tablinks = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tablinks.length; i++) {
      tablinks[i].addEventListener('click', function (event) {
        changeTab(event, this.getAttribute('data-tab'));
      });
    }

    // Set initial state to today's games.
    changeTab(null, 'today');
  });

    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');

    leftArrow.addEventListener('click', () => scrollSchedule('left'));
    rightArrow.addEventListener('click', () => scrollSchedule('right'));
});
