// The store will hold all information needed globally
const store = {
  track_id: undefined,
  player_id: undefined,
  race_id: undefined,
  cheat_mode: false,
};

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  onPageLoad();
  setupClickHandlers();
});

const onPageLoad = async () => {
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
    console.log(`Error getting tracks and/or racers: ${error.message}`);
  }
};

const setupClickHandlers = () =>
  document.addEventListener(
    "click",
    function (event) {
      const { target } = event;
      const closestListElement = target.closest("li") || target;
      const TRACK_SELECTOR = ".card.track";
      const RACER_SELECTOR = ".card.podracer";

      // Race track form field
      if (closestListElement.matches(TRACK_SELECTOR)) {
        handleSelectTrack(closestListElement);
        return;
      }

      // Podracer form field
      if (closestListElement.matches(RACER_SELECTOR)) {
        handleSelectPodRacer(closestListElement);
        return;
      }

      // Submit create race form
      if (target.matches("#submit-create-race")) {
        event.preventDefault();

        // start race
        handleCreateRace();
        return;
      }

      // Handle acceleration click
      if (target.matches("#gas-peddle")) {
        const countdown = document.getElementById("big-numbers");
        if (countdown && Number(countdown.innerText) > 0) {
          return;
        }

        if (store.cheat_mode) {
          const times = (x) => (f) => {
            if (x > 0) {
              f();
              times(x - 1)(f);
            }
          };
          times(25)(() => handleAccelerate(target));
        } else {
          handleAccelerate(target);
        }
        return;
      }
    },
    false
  );

async function delay(ms) {
  try {
    return await new Promise((resolve) => setTimeout(resolve, ms));
  } catch (error) {
    console.log("an error shouldn't be possible here");
    console.log(error);
  }
}
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
        // workaround for server bug: decrement the race_id
        // see issue on GitHub:
        // https://github.com/udacity/nd032-c3-asynchronous-programming-with-javascript-project-starter/issues/6#issuecomment-657034657
        race.ID -= 1;

        store.race_id = parseInt(race.ID);
        return runCountdown();
      })
      .then(() => startRace(store.race_id))
      .then(() => runRace(store.race_id, store.track_id));
  } catch (err) {
    console.error(`Error handling race creation: ${err}`);
  }
};

const runRace = (raceId, trackId) =>
  new Promise(async (resolve) => {
    const track = await getTracks().then((tracks) =>
      tracks.find((track) => track.id === trackId)
    );

    const getRaceDetails = async () => {
      getRace(raceId).then((race) => {
        if (!race || !race.status) {
          clearInterval(raceInterval);
          return null;
        }
        race.positions = addRacerNames(race.positions);
        // update the leaderboard while the race is in progress
        if (race.status === "in-progress") {
          renderAt("#leaderBoard", raceProgress(race.positions, track));
        } else if (race.status === "finished") {
          // race finished:
          // stop the interval & render the results
          clearInterval(raceInterval);
          renderAt("#race", resultsView(race.positions));
          return race;
        }
      });
    };
    const raceInterval = setInterval(getRaceDetails, 500, raceId);
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
        if (timer > 1) {
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
function renderRacerCars(racers) {
  if (!racers || !racers.length) {
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
			<table>
			  <tr>
			    <td>top speed:</td>
				<td>${top_speed}</td>
			  </tr>
			  <tr>
			    <td>acceleration:</td>
				<td>${acceleration}</td>
			  </tr>
			  <tr>
			    <td>handling:</td>
				<td>${handling}</td>
			  </tr>
			</table>
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

		</main>
	`;
}

const newRaceButton = () =>
  `<br/>
  <form action="/race">
    <button class="button" type="submit" id="new-race-button">
      Start a new race
    </button>
  </form>`;

function raceProgress(positions, track) {
  let userPlayer = positions.find((e) => e.id === store.player_id);
  userPlayer.driver_name += " (you)";

  positions.sort((a, b) => {
    if (a.final_position && b.final_position) {
      return a.final_position > b.final_position ? 2 : -2;
    }
    return a.segment > b.segment ? -1 : 1;
  });

  let count = 1;

  const getRaceCompletionPercentage = (segment) => {
    if (segment === 0) {
      return 0;
    }
    const trackLength = track.segments.reduce((a, b) => a + b);
    const segmentsDone = track.segments.slice(0, segment - 1);
    const lengthDone =
      segmentsDone.length > 0 ? segmentsDone.reduce((a, b) => a + b) : 0;
    const percentageDone = (lengthDone / trackLength) * 100;
    return Math.ceil(percentageDone);
  };

  const progressBar = (percentage) => `
  	<div class="progress-outer">
	  <div class="progress-inner" style="width:${percentage}%">
	  ${percentage === 100 ? "FINISHED" : ""}
	  </div>
	</div>
	`;

  const getProgressBar = (segment) =>
    track
      ? `<td>
	  	${progressBar(getRaceCompletionPercentage(segment))}
	  </td>`
      : "";

  const results = positions
    .map(
      ({ driver_name, segment }) => `
			<tr>
				<td>
					<h3>${count++} - ${driver_name}</h3>
				</td>
				${getProgressBar(segment)}
			</tr>
		`
    )
    .join("");

  return `
		<main>
      <section id="leaderBoard">
        <h3>RACE RESULTS</h3>
        <br/>
        ${results}
        ${!track ? newRaceButton() : ""}
			</section>
		</main>
	`;
}

function renderAt(element, html) {
  const node = document.querySelector(element);

  node.innerHTML = html;
}

// API CALLS ------------------------------------------------

// const SERVER = "http://localhost:8000";
const SERVER = "";

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

const getRace = (id) =>
  fetch(`${SERVER}/api/races/${id}`)
    .then((res) => res.json())
    .catch((err) => console.error(`Error getting race: ${err}`));

const startRace = (id) =>
  fetch(`${SERVER}/api/races/${id}/start`, {
    method: "POST",
    ...defaultFetchOpts(),
  }).catch((err) => console.log(`Error starting race: ${err}`));

const accelerate = (id) =>
  fetch(`${SERVER}/api/races/${id}/accelerate`, {
    method: "POST",
    ...defaultFetchOpts(),
  })
    .then((res) => res.status)
    .catch((err) => console.log(`Error accelerating: ${err}`));
