const config = require('./config.json')
const mysql = require('mysql');
const e = require('express');

// TODO: fill in your connection details here
const connection = mysql.createConnection({
    host: config.rds_host,
    user: config.rds_user,
    password: config.rds_password,
    port: config.rds_port,
    database: config.rds_db
});
connection.connect();


// Route 1 (handler)
async function hello(req, res) {
    // a GET request to /hello?name=Steve
    if (req.query.name) {
        res.send(`Hello, ${req.query.name}! Welcome to the NBA database!`)
    } else {
        res.send(`Hello! Welcome to the NBA database!`)
    }
}

// Route 2
async function getAllShotsOfPlayer(req, res) {
    const name = req.query.name ? req.query.name : "Zach Lavine"
    
    //if shot type is specified
    if (req.query.shotType && !isNaN(req.query.shotType)) {
        connection.query(`SELECT *
        FROM Shots
        WHERE namePlayer = '${name}' AND year = 2022 AND typeAction = '${req.query.shotType}'`, function (error, results, fields) {
            if (error) {
                console.log(error);
                res.json({ error: error });
            } else if (results) {
                res.json({ results : results });
            }
        })
    } else {
        connection.query(`SELECT *
        FROM Shots
        WHERE namePlayer = '${name}' AND year = 2022`, function (error, results, fields) {
            if (error) {
                console.log(error);
                res.json({ error: error });
            } else if (results) {
                res.json({ results: results });
            }
        })
    }
}

// Route 3
// get all shots of a single player during one specified game (timeframe optional)
async function getGameShotsOfPlayer(req, res) {
    const name = req.query.name ? req.query.name : "Eric Gordon"
    const date = req.query.date ? req.query.date : 20141028

    const startTime = req.query.startTime ? req.query.startTime : 0;
    const endTime = req.query.endTime ? req.query.endTime : 48;

    connection.query(`SELECT namePlayer, nameTeam, typeEvent, zoneName, quarter, minRemaining
    FROM Shots
    WHERE date=${date}
    AND (12*quarter + (12-minRemaining)) < ${endTime}
    AND (12*quarter + (12-minRemaining)) > ${startTime}
    AND namePlayer='${name}'`, function (error, results, fields) {
        if (error) {
            console.log(error);
            res.json({ error: error });
        } else if (results) {
            res.json({ results: results });
        }
    })
}

// Route 4
//get all shots of a team during one specified game (timeframe optional) 
async function getGameShotsOfTeam(req, res) {
    const team = req.query.team ? req.query.team : "New Orleans Pelicans"
    const date = req.query.date ? req.query.date : 20141028

    const startTime = req.query.startTime ? req.query.startTime : 0;
    const endTime = req.query.endTime ? req.query.endTime : 48;

    connection.query(`SELECT namePlayer, nameTeam, typeEvent, zoneName, quarter, minRemaining
    FROM Shots
    WHERE date=${date}
    AND (12*quarter + (12-minRemaining)) < ${endTime}
    AND (12*quarter + (12-minRemaining)) > ${startTime}
    AND nameTeam='${team}'`, function (error, results, fields) {
        if (error) {
            console.log(error);
            res.json({ error: error });
        } else if (results) {
            res.json({ results: results });
        }
    })
}

// Route 5
// get shot locations of a single player during one game
async function getShotLocationsOfPlayer(req, res) {
    const name = req.query.name ? req.query.name : "Ryan Anderson"
    const date = req.query.date ? req.query.date : 20141028

    connection.query(`SELECT namePlayer, nameTeam, typeEvent, zoneName, zoneRange, locationX, locationY
    FROM Shots
    WHERE date=${date}
    AND namePlayer = '${name}'`, function (error, results, fields) {
        if (error) {
            console.log(error);
            res.json({ error: error });
        } else if (results) {
            res.json({ results: results });
        }
      })
}

// Route 6
// get all made shots within last x seconds of a quarter
async function getClutchShotsOfPlayer(req, res) {
    const name = req.query.name ? req.query.name : "Ryan Anderson"
    const date = req.query.date ? req.query.date : 20141028
    const secondsLeft = req.query.time ? req.query.time : 300
    const minLimit = Math.floor(secondsLeft / 60)
    const secondsRemaining = secondsLeft - minLimit * 60

    connection.query(`SELECT namePlayer, nameTeam, typeEvent, zoneName, zoneRange, quarter, minRemaining, secRemaining
    FROM Shots
    WHERE namePlayer = '${name}'
    AND date = ${date}
    AND minRemaining < ${minLimit}
    AND secRemaining <= ${secondsRemaining}
    AND isShotMade = 1`, function (error, results, fields) {
        if (error) {
            console.log(error);
            res.json({ error: error });
        } else if (results) {
            res.json({ results: results });
        }
    })
}

// Route 7
// get all shots of player over a season 
async function getSeasonShotsOfPlayer(req, res) {
    const name = req.query.name ? req.query.name : "Ryan Anderson"
    const season = req.query.season ? req.query.season : "2014-15"
    const shotType = req.query.shotType ? req.query.shotType : "3PT Field Goal"
    const shotAction = req.query.shotAction ? req.query.shotAction : "Jump Shot"

    connection.query(`SELECT namePlayer, nameTeam, typeEvent, typeShot, typeAction
    FROM Shots
    WHERE namePlayer = '${name}'
    AND slugSeason= '${season}'
    AND typeShot = '${shotType}'
    AND typeAction = '${shotAction}'`, function (error, results, fields) {
        if (error) {
            console.log(error);
            res.json({ error: error });
        } else if (results) {
            res.json({ results: results });
        }
    })
}

// Route 8
// get distribution of player's shot locations 
async function getShotDistribution(req, res) {
    const name = req.query.name ? req.query.name : "Zach Lavine"

    connection.query(`WITH player_shots AS (SELECT playerID, zoneName, zoneRange, zoneBasic, SUM(isShotAttempted) as attempts, AVG(isShotMade) as make_percentage
    FROM Shots
    WHERE namePlayer = '${name}'
    GROUP BY playerID, zoneName, zoneRange, zoneBasic
    ORDER BY attempts desc),
    total_attempts AS (SELECT SUM(attempts)
            FROM player_shots
            GROUP BY playerID)
    SELECT playerID, zoneName, zoneRange, zoneBasic, attempts, make_percentage, attempts/(SELECT * FROM total_attempts) take_percentage
    FROM player_shots`, function (error, results, fields) {
        if (error) {
            console.log(error);
            res.json({ error: error });
        } else if (results) {
            res.json({ results: results });
        }
    })
}

module.exports = {
    hello,
    getAllShotsOfPlayer,
    getGameShotsOfPlayer,
    getClutchShotsOfPlayer,
    getGameShotsOfTeam,
    getSeasonShotsOfPlayer,
    getShotDistribution,
    getShotLocationsOfPlayer
}