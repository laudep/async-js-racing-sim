const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const DEFAULT_PORT = 3000;
const SERVER = "http://localhost:8000";

// setup the ability to see into response bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// setup the express assets path
app.use("/", express.static(path.join(__dirname, "../client")));

// API calls ------------------------------------------------------------------------------------
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "../client/pages/home.html"));
});

app.get("/race", async (req, res) => {
  res.sendFile(path.join(__dirname, "../client/pages/race.html"));
});

const addTrackNames = (tracks) =>
  tracks.map((track) => {
    switch (track.name) {
      case "Track 1":
        track.name = "Vengeance";
        break;
      case "Track 2":
        track.name = "Sunken City";
        break;
      case "Track 3":
        track.name = "Inferno";
        break;
      case "Track 4":
        track.name = "Executioner";
        break;
      case "Track 5":
        track.name = "Abyss";
        break;
      case "Track 6":
        track.name = "The Gauntlet";
        break;
    }
    return track;
  });

app.get("/api/tracks", async (req, res) => {
  res.send(
    fetch(`${SERVER}/api/tracks`)
      .then((res) => res.json())
      .then((data) => addTrackNames(data))
  );
});

const currentPort = process.env.PORT || DEFAULT_PORT;
app.listen(currentPort, () =>
  console.log(`Example app listening on port ${currentPort}!`)
);
