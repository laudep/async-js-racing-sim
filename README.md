<!-- markdownlint-disable MD033 MD041-->
<p align="center">
  <img height="250" src="./src/client/assets/img/podracer_anakin.jpg">
</p>
<h1 align="center"> Pod Racing Simulator </h1>
<p align="center">
  <b>An exercise in asynchronous JavaScript</b>
</p>

## Introduction
<!-- markdownlint-enable -->
This is a racing simulator in JavaScript made for a
[Udacity](https://www.udacity.com/) course in asynchronous programming.

### Game Mechanics

You select a player and track, the game begins and you accelerate your racer by
clicking an acceleration button.  
As you accelerate so do the other players and the leaderboard live-updates as
players change position on the track.  
The final view is a results page displaying the players' rankings.

### Main Game Views

1. The form to create a race

2. The race progress view (this includes the live-updating leaderboard and
   acceleration button)

3. The race results view

## Getting Started

In order to build this game, we need to run two things: the game engine API and
the front end.

### Start the Server

The game engine has been compiled down to a binary so that you can run it on
any system.  
Because of this, you cannot edit the API in any way, it is just a black box
that we interact with via the API endpoints.

To run the server, locate your operating system and run the associated command
in your terminal at the root of the project.
<!-- markdownlint-disable MD013 -->
| Your OS               | Command to start the API                                  |
| --------------------- | --------------------------------------------------------- |
| Mac                   | `ORIGIN_ALLOWED=http://localhost:3000 ./bin/server-osx`   |
| Windows               | `ORIGIN_ALLOWED=http://localhost:3000 ./bin/server.exe`   |
| Linux (Ubuntu, etc..) | `ORIGIN_ALLOWED=http://localhost:3000 ./bin/server-linux` |
<!-- markdownlint-enable-->
If you are on an older OS and the above command doesn't run for you - or if you
know that you are running a 32bit system - add `-32` to the end of the file
name. For reference, here are the same commands but for a 32-bit system.

<!-- markdownlint-disable MD013 -->
| 32 Bit Systems Only!  | Command to start the API                                     |
| --------------------- | ------------------------------------------------------------ |
| Mac                   | `ORIGIN_ALLOWED=http://localhost:3000 ./bin/server-osx-32`   |
| Windows               | `ORIGIN_ALLOWED=http://localhost:3000 ./bin/server-32.exe`   |
| Linux (Ubuntu, etc..) | `ORIGIN_ALLOWED=http://localhost:3000 ./bin/server-linux-32` |
<!-- markdownlint-enable-->

Note that this process will use your terminal tab, so you will have to open a
new tab and navigate back to the project root to start the front end.

### Start the Frontend

First, run your preference of `npm install && npm start` or
`yarn && yarn start` at the root of this project.
Then you should be able to access `http://localhost:3000`.

## API Calls Overview

[GET] `api/tracks`
List of all tracks

- id: number (1)
- name: string ("Track 1")
- segments: number[]([87,47,29,31,78,25,80,76,60,14....])

[GET] `api/cars`
List of all cars

- id: number (3)
- driver_name: string ("Racer 1")
- top_speed: number (500)
- acceleration: number (10)
- handling: number (10)

[GET] `api/races/${id}`
Information about a single race

- status: RaceStatus ("unstarted" | "in-progress" | "finished")
- positions object[] ([{ car: object, final_position: number
  (omitted if empty), speed: number, segment: number}])

[POST] `api/races`
Create a race

- id: number
- track: string
- player_id: number
- cars: Cars[] (array of cars in the race)
- results: Cars[] (array of cars in the position they finished, available if
  the race is finished)

[POST] `api/races/${id}/start`
Begin a race

- Returns nothing

[POST] `api/races/${id}/accelerate`
Accelerate a car

- Returns nothing
