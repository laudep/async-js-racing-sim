// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
const store = {
  track_id: undefined,
  player_id: undefined,
  race_id: undefined,
};

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  onPageLoad();
  setupClickHandlers();
});

async function onPageLoad() {
  try {
    getTracks().then((tracks) => {
      const html = renderTrackCards(tracks);
      renderAt("#tracks", html);
    });

    getRacers().then((racers) => {
      const html = renderRacerCars(racers);
      renderAt("#racers", html);
    });
  } catch (error) {
    console.log("Problem getting tracks and racers ::", error.message);
    console.error(error);
  }
}

function setupClickHandlers() {
  document.addEventListener(
    "click",
    function (event) {
      const { target } = event;

      // Race track form field
      if (target.matches(".card.track")) {
        handleSelectTrack(target);
      }

      // Podracer form field
      if (target.matches(".card.podracer")) {
        handleSelectPodRacer(target);
      }

      // Submit create race form
      if (target.matches("#submit-create-race")) {
        event.preventDefault();

        // start race
        handleCreateRace();
      }

      // Handle acceleration click
      if (target.matches("#gas-peddle")) {
        handleAccelerate(target);
      }
    },
    false
  );
}

async function delay(ms) {
  try {
    return await new Promise((resolve) => setTimeout(resolve, ms));
  } catch (error) {
    console.log("an error shouldn't be possible here");
    console.log(error);
  }
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

/**
 * Controls race flow
 */
const handleCreateRace = async () => {
  try {
    const track = await getTracks().then((tracks) =>
      tracks.find((track) => track.id === store.track_id)
    );
    const racers = await getRacers();

    // render starting UI
    renderAt("#race", renderRaceStartView(track, racers));

    const { track_id, player_id } = store;
    createRace(player_id, track_id)
      .then((race) => {
        store.race_id = parseInt(race.ID);
        return runCountdown();
      })
      .then(() => startRace(store.race_id))
      .then(() => runRace(store.race_id));
  } catch (err) {
    console.error(`Error handling race creation: ${err}`);
  }
};

const runRace = (raceID) =>
  new Promise((resolve) => {
    const getRaceDetails = async () => {
      getRace(raceID).then((race) => {
        // update the leaderboard while the race is in progress
        if (race.status === "in-progress") {
          renderAt("#leaderBoard", raceProgress(race.positions));
        } else if (race.status === "finished") {
          // race finished:
          // stop the interval, render the results & resolve the promise
          clearInterval(raceInterval);
          renderAt("#race", resultsView(race.positions));
          resolve(race);
        }
      });
    };
    const raceInterval = setInterval(getRaceDetails, 500, raceID);
  }).catch((err) => {
    console.log(`Error running race: ${err}`);
  });

async function runCountdown() {
  try {
    // wait for the DOM to load
    await delay(1000);
    let timer = 3;

    return new Promise((resolve) => {
      const countdown = () => {
        if (timer > 0) {
          document.getElementById("big-numbers").innerHTML = --timer;
        } else {
          clearInterval(countInterval);
          resolve();
        }
	  };
	  
      const countInterval = setInterval(countdown, 1000);
    });
  } catch (err) {
    console.log(`Error running countdown: ${err}`);
  }
}

function handleSelectPodRacer(target) {
  console.log(`Pod selected: ${target.id}`);

  // remove class selected from all racer options
  const selected = document.querySelector("#racers .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  target.classList.add("selected");
  store.player_id = parseInt(target.id);
}

function handleSelectTrack(target) {
  console.log(`Track selected: ${target.id}`);

  // remove class selected from all track options
  const selected = document.querySelector("#tracks .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  target.classList.add("selected");
  store.track_id = parseInt(target.id);
}

function handleAccelerate() {
  console.log("Accelerating");
  const { race_id } = store;
  accelerate(race_id);
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
  if (!racers.length) {
    return `
			<h4>Loading Racers...</4>
		`;
  }

  const results = racers.map(renderRacerCard).join("");

  return `
		<ul id="racers">
			${results}
		</ul>
	`;
}

function renderRacerCard(racer) {
  const { id, driver_name, top_speed, acceleration, handling } = racer;

  return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`;
}

function renderTrackCards(tracks) {
  if (!tracks.length) {
    return `
			<h4>Loading Tracks...</4>
		`;
  }

  const results = tracks.map(renderTrackCard).join("");

  return `
		<ul id="tracks">
			${results}
		</ul>
	`;
}

function renderTrackCard(track) {
  const { id, name } = track;

  return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`;
}

function renderCountdown(count) {
  return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`;
}

function renderRaceStartView(track, racers) {
  return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`;
}

function resultsView(positions) {
  positions.sort((a, b) => (a.final_position > b.final_position ? 1 : -1));

  return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`;
}

function raceProgress(positions) {
  let userPlayer = positions.find((e) => e.id === store.player_id);
  userPlayer.driver_name += " (you)";

  positions = positions.sort((a, b) => (a.segment > b.segment ? -1 : 1));
  let count = 1;

  const results = positions.map((p) => {
    return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`;
  });

  return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`;
}

function renderAt(element, html) {
  const node = document.querySelector(element);

  node.innerHTML = html;
}

// ^ Provided code ^ do not remove

// API CALLS ------------------------------------------------

const SERVER = "http://localhost:8000";

function defaultFetchOpts() {
  return {
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": SERVER,
    },
  };
}

const getTracks = () =>
  fetch(`${SERVER}/api/tracks`)
    .then((res) => res.json())
    .catch((err) => console.error(`Error getting tracks: ${err}`));

const getRacers = () =>
  fetch(`${SERVER}/api/cars`)
    .then((res) => res.json())
    .catch((err) => console.error(`Error getting racers: ${err}`));

const createRace = (player_id, track_id) => {
  player_id = parseInt(player_id);
  track_id = parseInt(track_id);
  const body = { player_id, track_id };

  return fetch(`${SERVER}/api/races`, {
    method: "POST",
    ...defaultFetchOpts(),
    dataType: "jsonp",
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .catch((err) => console.log(`Error creating race: ${err}`));
};

// we substract 1 from the race_id
// see issue on GitHub:
// https://github.com/udacity/nd032-c3-asynchronous-programming-with-javascript-project-starter/issues/6#issuecomment-657034657
const getRace = (id) =>
  fetch(`${SERVER}/api/races/${id - 1}`)
    .then((res) => res.json())
    .catch((err) => console.err(`Error getting race: ${err}`));

const startRace = (id) =>
  fetch(`${SERVER}/api/races/${id - 1}/start`, {
    method: "POST",
    ...defaultFetchOpts(),
  })
    .then((res) => res.json())
    .catch((err) => console.log(`Error starting race: ${err}`));

const accelerate = (id) =>
  fetch(`${SERVER}/api/races/${id - 1}/accelerate`, {
    method: "POST",
    ...defaultFetchOpts(),
  })
    .then((res) => res.status)
    .catch((err) => console.log(`Error accelerating: ${err}`));
