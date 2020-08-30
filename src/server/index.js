const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const DEFAULT_PORT = 3000;
const SERVER = "http://localhost:8000";

const defaultFetchOpts = () => ({
  mode: "cors",
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": SERVER,
  },
});

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
  fetch(`${SERVER}/api/tracks`)
    .then((res) => res.json())
    .then((data) => addTrackNames(data))
    .then((tracks) => res.send(tracks));
});

const addRacerNames = (racers) =>
  racers.map((racer) => {
    switch (racer.driver_name) {
      case "Racer 1":
        racer.driver_name = "Ben Quadinaros";
        break;
      case "Racer 2":
        racer.driver_name = "Gasgano";
        break;
      case "Racer 3":
        racer.driver_name = "Anakin Skywalker";
        break;
        break;
      case "Racer 4":
        racer.driver_name = "Clegg Holdfast";
        break;
      case "Racer 5":
        racer.driver_name = "By't Distombe";
        break;
    }
    return racer;
  });

app.get("/api/tracks", async (req, res) => {
  fetch(`${SERVER}/api/cars`)
    .then((res) => res.json())
    .then((data) => addRacerNames(data))
    .then((racers) => res.send(racers))
    .catch((err) => console.error(`Error getting racers: ${err}`));
});

const currentPort = process.env.PORT || DEFAULT_PORT;
app.listen(currentPort, () =>
  console.log(`Example app listening on port ${currentPort}!`)
);
