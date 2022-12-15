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
// Query to get optimal shot distribution for player 
async function getShotDistribution(req, res) {
    const name = req.query.name ? req.query.name : "Zach Lavine"

    connection.query(`SELECT playerID from Players WHERE name = ${name}`, function(error, results, fields) {
        if (error) {
            console.log(error);
            res.json({error : error});
        } else if (results) {
            const response = JSON.parse(results);
            if (len(response) == 0) {
                res.json({error : 'No player found'});
            } else {
                const id = response[0].playerID
                
                connection.query(`WITH player_shots AS (SELECT playerID, zoneName, zoneRange, zoneBasic, SUM(isShotAttempted) as attempts, AVG(isShotMade) as make_percentage
            FROM Shots
            WHERE playerID = '${id}'
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
        }
    })
}

// Route 9
// Get most clutch players by z-score of their clutch performance (with min # of attempts)
// Clutch Page: get clutchness rankings 
async function getClutchPlayers(req, res) {
    const minAttempts = req.query.min ? req.query.min : 10

    connection.query(`
    SELECT player_clutch.playerID as playerID, Players.name as name, player_clutch.clutch_score as clutch_score, attempts
    FROM (SELECT playerID, AVG(z_score) clutch_score, SUM(attempts) as attempts
        FROM(SELECT playerID, zoneName, zoneBasic, zoneRange, (player_avg - pop_average)/player_std as z_score, attempts
            FROM (
                SELECT playerID, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as player_avg,
                attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as player_std
                FROM Player_Averages_Clutch p LEFT JOIN Historical_Averages h ON
                    p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
                ORDER BY playerID desc, attempts desc
                ) player_zones) player_scores
            GROUP BY playerID
            HAVING SUM(attempts) > ${minAttempts}) player_clutch LEFT JOIN Players ON player_clutch.playerID = Players.playerID
    ORDER BY clutch_score desc;`, function (error, results, fields) {
        if (error) {
            console.log(error);
            res.json({ error: error });
        } else if (results) {
            res.json({ results: results });
        }
    })
}

// Route 10
// get luckiest shooting performances by a team in an individual game
// Luckiness Page: query to get luckiness rankings 
async function getLuckyPerformances(req, res) {
    connection.query(`SELECT gs.teamID as teamID, gs.gameID as gameID, Teams.name as name, gs.luck_index as luck_index, attempts
        FROM (SELECT teamID, gameID, AVG(z_score) luck_index, SUM(attempts) as attempts
            FROM(SELECT teamID, gameID, zoneName, zoneBasic, zoneRange, (team_avg - pop_average)/team_std as z_score, attempts
                FROM (
                    SELECT teamID, gameID, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as team_avg,
                    attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as team_std
                    FROM Game_Averages_Team p LEFT JOIN Historical_Averages h ON
                        p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
                    ) team_zones) team_scores
                GROUP BY teamID, gameID) gs LEFT JOIN Teams ON gs.teamID = Teams.teamID
        ORDER BY luck_index desc;`, function (error, results, fields) {
        if (error) {
            console.log(error);
            res.json({ error: error });
        } else if (results) {
            res.json({ results: results });
        }
    })
}

// Route 10.1
// get luckiest shooting performances by a team in an individual game
// Luckiness Page: query to get luckiness rankings (filter on season), (filter on team)
async function getLuckyPerformancesTeamSeason(req, res) {
    const team = req.query.team ? req.query.team : 1610612759
    const season = req.query.season ? req.query.season : "2014-15"

    connection.query(`SELECT gs.teamID as teamID, gs.gameID as gameID, Teams.name as name, gs.slugSeason AS season, gs.luck_index as luck_index, attempts
    FROM (SELECT teamID, gameID, slugSeason, AVG(z_score) luck_index, SUM(attempts) as attempts
        FROM(SELECT teamID, gameID, slugSeason, zoneName, zoneBasic, zoneRange, (team_avg - pop_average)/team_std as z_score, attempts
            FROM (
                SELECT teamID, gameID, slugSeason, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as team_avg,
                attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as team_std
                FROM (SELECT * FROM Game_Averages_Team WHERE teamID = ${team} AND slugSeason = ${season}) p
                        LEFT JOIN Historical_Averages h ON p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
                ) team_zones) team_scores
            GROUP BY teamID, gameID) gs LEFT JOIN Teams ON gs.teamID = Teams.teamID
    ORDER BY luck_index desc;`, function (error, results, fields) {
        if (error) {
            console.log(error);
            res.json({ error: error });
        } else if (results) {
            res.json({ results: results });
        }
    })
}

// Route 11
// get luckiest individual player performance with minattempts >= minAttempts
async function getLuckiestPlayerPerformances(req, res) {
    const minAttempts = req.query.min ? req.query.min : 0
    
    connection.query(`WITH Historical_Averages AS (SELECT zoneName, zoneRange, zoneBasic, average, std
    FROM (SELECT zoneName, zoneRange, zoneBasic, AVG(isShotMade) as average,
                    STD(isShotMade) std
            FROM Shots
            GROUP BY zoneName, zoneRange, zoneBasic) as all_games),
    Game_Averages AS (SELECT playerID, gameID, zoneName, zoneRange, zoneBasic, average, attempts
    FROM (SELECT playerID, gameID, zoneName, zoneRange, zoneBasic, SUM(isShotAttempted) as attempts, AVG(isShotMade) as average
            FROM Shots
            # could add WHERE clause here to subset which games you want
            GROUP BY zoneName, zoneRange, zoneBasic, playerID, gameID) as wanted_games)
    SELECT gs.playerID as playerID, gs.gameID as gameID, Players.name as name, gs.luck_index as luck_index, attempts
    FROM (SELECT playerID, gameID, AVG(z_score) luck_index, SUM(attempts) as attempts
    FROM (SELECT playerID, gameID, zoneName, zoneBasic, zoneRange, (player_avg - pop_average)/player_std as z_score, attempts
    FROM (
    SELECT playerID, gameID, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as player_avg,
    attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as player_std
    FROM Game_Averages p LEFT JOIN Historical_Averages h ON
    p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
    ) team_zones) player_scores
    GROUP BY playerID, gameID) gs LEFT JOIN Players ON gs.playerID = Players.playerID
    WHERE attempts >= ${minAttempts}
    ORDER BY luck_index desc`, function(error, results, fields) {
        if (error) {
            console.log(error);
            res.json({ error: error });
        } else if (results) {
            res.json({ results: results });
        }
    })
}

// Route 12 
// get ideal shot distribution for a player and compare to current shot distribution
async function getIdealShotDistribution(req, res) {
    const name = req.query.name ? req.query.name : "Zach Lavine"

    connection.query(`WITH player_shots AS (SELECT playerID, zoneRange, zoneBasic, SUM(isShotAttempted) as attempts, AVG(isShotMade) as make_percentage
    FROM Shots
    WHERE namePlayer = '${name}'
    GROUP BY playerID, zoneRange, zoneBasic
    ORDER BY attempts desc),
    total_attempts AS (SELECT SUM(attempts)
            FROM player_shots
            GROUP BY playerID),
    shot_distribution AS (SELECT playerID, zoneRange, zoneBasic, attempts, make_percentage, attempts/(SELECT * FROM total_attempts) take_percentage,
                    IF(zoneRange in ('24+ ft.', 'Back Court Shot'), 3 * make_percentage, 2 * make_percentage) expected_points
                FROM player_shots),
    total_expected AS (SELECT SUM(expected_points)
        FROM shot_distribution
        GROUP BY playerID)
    SELECT s.playerID, p.name, zoneRange, zoneBasic, attempts, make_percentage, take_percentage, expected_points/(SELECT * FROM total_expected) opt_take_percentage
    FROM shot_distribution s LEFT JOIN Players p on s.playerID = p.playerID`, function(error, results, fields) {
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
    getShotLocationsOfPlayer,
    getClutchPlayers,
    getLuckyPerformances,
    getLuckiestPlayerPerformances,
    getIdealShotDistribution
}