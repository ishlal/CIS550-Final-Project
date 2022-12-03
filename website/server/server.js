const express = require('express');
const mysql      = require('mysql');
var cors = require('cors')


const routes = require('./routes')
const config = require('./config.json')

const app = express();

// whitelist localhost 3000
app.use(cors({ credentials: true, origin: ['http://localhost:3000'] }));

// Route 1 - register as GET 
app.get('/hello', routes.hello)

// Route 2 - register as GET
app.get('/shots/player', routes.getAllShotsOfPlayer)

// Route 3 - register as GET
app.get('/game/shots/player', routes.getGameShotsOfPlayer)

// Route 4 - register as GET
app.get('/game/shots/team', routes.getGameShotsOfTeam)

// Route 5 - register as GET
app.get('/game/shots/player/locations', routes.getShotLocationsOfPlayer)

// Route 6 - register as GET
app.get('/shots/player/clutch', routes.getClutchShotsOfPlayer)

// Route 7 - register as GET
app.get('/season/player', routes.getSeasonShotsOfPlayer)

// Route 8 - register as GET
app.get('/shots/player/distribution', routes.getShotDistribution)




app.listen(config.server_port, () => {
    console.log(`Server running at http://${config.server_host}:${config.server_port}/`);
});

module.exports = app;
