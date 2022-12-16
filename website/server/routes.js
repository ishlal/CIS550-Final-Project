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
    const date = req.query.gameID ? req.query.gameID : 20141028

    const startTime = req.query.startTime ? req.query.startTime : 0;
    const endTime = req.query.endTime ? req.query.endTime : 48;

    connection.query(`
    WITH player_id AS (SELECT playerID FROM Players WHERE name = ${name} LIMIT 1)
    SELECT namePlayer, nameTeam, typeEvent, zoneName, quarter, minRemaining
    FROM Shots
    WHERE gameID=${date}
    AND (12*quarter + (12-minRemaining)) < ${endTime}
    AND (12*quarter + (12-minRemaining)) > ${startTime}
    AND playerID=(SELECT * FROM player_id)`, function (error, results, fields) {
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
    const minAttempts = req.query.min ? req.query.min : 50

    connection.query(`SELECT player_clutch.playerID as playerID, Players.name as name, player_clutch.clutch_score as clutch_score, attempts
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
ORDER BY clutch_score desc`, function (error, results, fields) {
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
    connection.query(`SELECT gs.teamID as teamID, gs.gameID as gameID, date as date, slugMatchup as matchup, Teams.name as name, gs.luck_index as luck_index, attempts
            FROM (SELECT teamID, gameID, AVG(z_score) luck_index, SUM(attempts) as attempts
                FROM(SELECT teamID, gameID, zoneName, zoneBasic, zoneRange, (team_avg - pop_average)/team_std as z_score, attempts
                    FROM (
                        SELECT teamID, gameID, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as team_avg,
                        attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as team_std
                        FROM Game_Averages_Team p LEFT JOIN Historical_Averages h ON
                            p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
                        ) team_zones) team_scores
                    GROUP BY teamID, gameID) gs LEFT JOIN Teams ON gs.teamID = Teams.teamID JOIN Games G on gs.gameID = G.gameID
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
    const team = req.query.team ? req.query.team : 'San Antonio Spurs'
    connection.query(`
    WITH team_id AS (SELECT teamID from Teams WHERE name = '${team}')
SELECT gs.teamID as teamID, gs.gameID as gameID, date as date, slugMatchup as matchup, Teams.name as name, gs.slugSeason AS season, gs.luck_index as luck_index, attempts
    FROM (SELECT teamID, gameID, slugSeason, AVG(z_score) luck_index, SUM(attempts) as attempts
        FROM(SELECT teamID, gameID, slugSeason, zoneName, zoneBasic, zoneRange, (team_avg - pop_average)/team_std as z_score, attempts
            FROM (
                SELECT teamID, gameID, slugSeason, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as team_avg,
                attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as team_std
                FROM (SELECT * FROM Game_Averages_Team WHERE teamID = (SELECT * FROM team_id)) p
                        LEFT JOIN Historical_Averages h ON p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
                ) team_zones) team_scores
            GROUP BY teamID, gameID) gs LEFT JOIN Teams ON gs.teamID = Teams.teamID JOIN Games G on gs.gameID = G.gameID
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

    connection.query(`WITH player_id AS (SELECT playerID FROM Players WHERE name = '${name}' LIMIT 1),
    player_shots AS (SELECT playerID, zoneRange, zoneBasic, SUM(isShotAttempted) as attempts, AVG(isShotMade) as make_percentage
                        FROM Shots
                        WHERE playerID = (SELECT * FROM player_id)
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
    FROM shot_distribution s LEFT JOIN Players p on s.playerID = p.playerID
ORDER BY opt_take_percentage desc;`, function(error, results, fields) {
        if (error) {
            console.log(error);
            res.json({ error: error });
        } else if (results) {
            res.json({ results: results });
        }
    })
}

// Route 13 
// - Query Players table for Player information
async function getPlayerInfo(req, res) {
    const name = req.query.name ? req.query.name : "Zach Lavine"

    connection.query(`SELECT name, playerID, firstSeason, playerStatsURL, playerHeadshotURL FROM Players WHERE name = '${name}' LIMIT 1`, function(error, results, fields) {
        if (error) {
            console.log(error);
            res.json({ error: error });
        } else if (results) {
            res.json({ results: results });
        }
    })
}

// Route 14
// Query to get shot performance per zone per season for player
async function getPlayerShotPerformances(req, res) {
    const name = req.query.name ? req.query.name : "Zach Lavine"

    connection.query(`WITH player_id AS (SELECT playerID FROM Players WHERE name = '${name}' LIMIT 1)
    SELECT playerID, slugSeason,
           SUM(CASE WHEN zoneBasic = 'Above the Break 3' AND zoneName = 'Center' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Above the Break 3' AND zoneName = 'Center' THEN isShotAttempted ELSE 0 END) as center_three,

           SUM(CASE WHEN zoneBasic = 'Above the Break 3' AND zoneName = 'Left Side Center' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Above the Break 3' AND zoneName = 'Left Side Center' THEN isShotAttempted ELSE 0 END) as lWing_three,

           SUM(CASE WHEN zoneBasic = 'Above the Break 3' AND zoneName = 'Right Side Center' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Above the Break 3' AND zoneName = 'Right Side Center' THEN isShotAttempted ELSE 0 END) as rWing_three,

           SUM(CASE WHEN zoneBasic = 'In The Paint (Non-RA)' AND zoneName = 'Center' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'In The Paint (Non-RA)' AND zoneName = 'Center' THEN isShotAttempted ELSE 0 END) as center_paint,

           SUM(CASE WHEN zoneBasic = 'In The Paint (Non-RA)' AND zoneName = 'Left Side' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'In The Paint (Non-RA)' AND zoneName = 'Left Side' THEN isShotAttempted ELSE 0 END) as left_paint,

           SUM(CASE WHEN zoneBasic = 'In The Paint (Non-RA)' AND zoneName = 'Right Side' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'In The Paint (Non-RA)' AND zoneName = 'Right Side' THEN isShotAttempted ELSE 0 END) as right_paint,

           SUM(CASE WHEN zoneName = 'Center' AND zoneBasic = 'Restricted Area' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneName = 'Center' AND zoneBasic = 'Restricted Area' THEN isShotAttempted ELSE 0 END) as restrictedArea,

           SUM(CASE WHEN zoneBasic = 'Right Corner 3' AND zoneName = 'Right Side' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Right Corner 3' AND zoneName = 'Right Side' THEN isShotAttempted ELSE 0 END) as rCorner_three,

           SUM(CASE WHEN zoneBasic = 'Left Corner 3' AND zoneName = 'Left Side' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Left Corner 3' AND zoneName = 'Left Side' THEN isShotAttempted ELSE 0 END) as lCorner_three,

           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Left Side' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Left Side' THEN isShotAttempted ELSE 0 END) as lCorner_mid,

           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Left Side Center' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Left Side Center' THEN isShotAttempted ELSE 0 END) as lWing_mid,

           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Right Side Center' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Right Side Center' THEN isShotAttempted ELSE 0 END) as rWing_mid,

           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Right Side' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Right Side' THEN isShotAttempted ELSE 0 END) as rCorner_mid,

           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Center' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Center' THEN isShotAttempted ELSE 0 END) as center_mid
    FROM Shots JOIN Games g ON Shots.gameID = g.gameID
    WHERE playerID = (SELECT * FROM player_id)
    GROUP BY playerID, slugSeason
    ORDER BY slugSeason desc`, function(error, results, fields) {
        if (error) {
            console.log(error);
            res.json({ error: error });
        } else if (results) {
            res.json({ results: results });
        }
    })
}

// Route 15
// Query to get shot performance per zone per season for team 
async function getTeamShotPerformances(req, res) {
    const name = req.query.name ? req.query.name : "San Antonio Spurs"

    connection.query(`WITH team_id AS (SELECT teamID FROM Teams WHERE name = '${name}' LIMIT 1)
    SELECT teamID, slugSeason,
           SUM(CASE WHEN zoneBasic = 'Above the Break 3' AND zoneName = 'Center' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Above the Break 3' AND zoneName = 'Center' THEN isShotAttempted ELSE 0 END) as center_three,

           SUM(CASE WHEN zoneBasic = 'Above the Break 3' AND zoneName = 'Left Side Center' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Above the Break 3' AND zoneName = 'Left Side Center' THEN isShotAttempted ELSE 0 END) as lWing_three,

           SUM(CASE WHEN zoneBasic = 'Above the Break 3' AND zoneName = 'Right Side Center' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Above the Break 3' AND zoneName = 'Right Side Center' THEN isShotAttempted ELSE 0 END) as rWing_three,

           SUM(CASE WHEN zoneBasic = 'In The Paint (Non-RA)' AND zoneName = 'Center' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'In The Paint (Non-RA)' AND zoneName = 'Center' THEN isShotAttempted ELSE 0 END) as center_paint,

           SUM(CASE WHEN zoneBasic = 'In The Paint (Non-RA)' AND zoneName = 'Left Side' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'In The Paint (Non-RA)' AND zoneName = 'Left Side' THEN isShotAttempted ELSE 0 END) as left_paint,

           SUM(CASE WHEN zoneBasic = 'In The Paint (Non-RA)' AND zoneName = 'Right Side' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'In The Paint (Non-RA)' AND zoneName = 'Right Side' THEN isShotAttempted ELSE 0 END) as right_paint,

           SUM(CASE WHEN zoneName = 'Center' AND zoneBasic = 'Restricted Area' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneName = 'Center' AND zoneBasic = 'Restricted Area' THEN isShotAttempted ELSE 0 END) as restrictedArea,

           SUM(CASE WHEN zoneBasic = 'Right Corner 3' AND zoneName = 'Right Side' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Right Corner 3' AND zoneName = 'Right Side' THEN isShotAttempted ELSE 0 END) as rCorner_three,

           SUM(CASE WHEN zoneBasic = 'Left Corner 3' AND zoneName = 'Left Side' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Left Corner 3' AND zoneName = 'Left Side' THEN isShotAttempted ELSE 0 END) as lCorner_three,

           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Left Side' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Left Side' THEN isShotAttempted ELSE 0 END) as lCorner_mid,

           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Left Side Center' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Left Side Center' THEN isShotAttempted ELSE 0 END) as lWing_mid,

           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Right Side Center' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Right Side Center' THEN isShotAttempted ELSE 0 END) as rWing_mid,

           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Right Side' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Right Side' THEN isShotAttempted ELSE 0 END) as rCorner_mid,

           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Center' THEN isShotMade ELSE 0 END)/
           SUM(CASE WHEN zoneBasic = 'Mid-Range' AND zoneName = 'Center' THEN isShotAttempted ELSE 0 END) as center_mid
    FROM Shots JOIN Games g ON Shots.gameID = g.gameID
    WHERE teamID = (SELECT * FROM team_id)
    GROUP BY teamID, slugSeason
    ORDER BY slugSeason desc`, function(error, results, fields) {
        if (error) {
            console.log(error);
            res.json({ error: error });
        } else if (results) {
            res.json({ results: results });
        }
    })
}

// Route 16 
// Query Teams table for team information
async function getTeamInfo(req, res) {
    const name = req.query.name ? req.query.name : "Atlanta Hawks"

    connection.query(`SELECT name, city, wins, losses, playoffApps, divisionTitles, confTitles, championships, url FROM Teams WHERE name = '${name}' LIMIT 1`, function(error, results, fields) {
        if (error) {
            console.log(error);
            res.json({ error: error });
        } else if (results) {
            res.json({ results: results });
        }
    })
}

// Route 17
// Get all shots for a game and player
async function getShotsPlayerGame(req, res) {
    const name = req.query.name ? req.query.name : "Seth Curry"
    const gameID = req.query.game ? req.query.game : 21900880


    connection.query(`WITH player_id AS (SELECT playerID from Players WHERE name = '${name}' LIMIT 1)
    SELECT slugSeason, s.gameID, date as date, slugMatchup as matchup, Players.name as namePlayer, Teams.name as nameTeam, typeAction, typeShot, quarter, minRemaining, secRemaining, zoneBasic, zoneName, distance, isShotMade as made
    FROM (SELECT * FROM Shots WHERE playerID = (SELECT * FROM player_id)) s JOIN (SELECT * FROM Games G WHERE gameID = ${gameID}) G
        on s.gameID = G.gameID JOIN Players on s.playerID = Players.playerID JOIN Teams on s.teamID = Teams.teamID
    ORDER BY quarter asc, minRemaining desc, secRemaining desc`, function(error, results, fields) {
        if (error) {
            console.log(error);
            res.json({ error: error });
        } else if (results) {
            res.json({ results: results });
        }
    })
}

// Route 18
// Query to get luckiness index information for player
async function getLuckiestPerformancesForPlayer(req, res) {
    const name = req.query.name ? req.query.name : "Seth Curry"
    const minAttempts = req.query.minAttempts ? req.query.minAttempts : 8


    connection.query(`WITH player_id AS (SELECT playerID from Players WHERE name = '${name}' LIMIT 1)
    SELECT gs.playerID as playerID, gs.gameID as gameID, date as date, slugMatchup as Matchup, Players.name as name, gs.luck_index as luck_index, attempts
        FROM (SELECT playerID, gameID,  AVG(z_score) luck_index, SUM(attempts) as attempts
            FROM (SELECT playerID, gameID, zoneName, zoneBasic, zoneRange, (player_avg - pop_average)/player_std as z_score, attempts
                FROM (
                    SELECT playerID, gameID, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as player_avg,
                        attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as player_std
                    FROM (SELECT * FROM Game_Averages_Player WHERE playerID = (SELECT * FROM player_id)) p  LEFT JOIN Historical_Averages h ON
                            p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
                    ) team_zones) player_scores
                GROUP BY playerID, gameID) gs LEFT JOIN Players ON gs.playerID = Players.playerID LEFT JOIN Games g on gs.gameID = g.gameID
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

// Route 19
// Query to get luckiness index information for team 
async function getLuckiestPerformancesForTeam(req, res) {
    const name = req.query.name ? req.query.name : "Atlanta Hawks"

    connection.query(`WITH team_id AS (SELECT teamID from Teams WHERE name = '${name}')
    SELECT gs.teamID as teamID, gs.gameID as gameID, date as date, slugMatchup as Matchup, Teams.name as name, gs.luck_index as luck_index, attempts
        FROM (SELECT teamID, gameID, AVG(z_score) luck_index, SUM(attempts) as attempts
            FROM (SELECT teamID, gameID, zoneName, zoneBasic, zoneRange, (player_avg - pop_average)/player_std as z_score, attempts
                FROM (
                    SELECT teamID, gameID, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as player_avg,
                        attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as player_std
                    FROM (SELECT * FROM Game_Averages_Team WHERE teamID = (SELECT * FROM team_id)) p  LEFT JOIN Historical_Averages h ON
                            p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
                    ) team_zones) player_scores
                GROUP BY teamID, gameID) gs LEFT JOIN Teams ON gs.teamID = Teams.teamID LEFT JOIN Games G on gs.gameID = G.gameID
        ORDER BY luck_index desc`, function(error, results, fields) {
        if (error) {
            console.log(error);
            res.json({ error: error });
        } else if (results) {
            res.json({ results: results });
        }
    })
}

// Route 20 
// Query to get all shots for game and team 
async function getShotsTeamGame(req, res) {
    const name = req.query.name ? req.query.name : "Atlanta Hawks"
    const gameID = req.query.game ? req.query.game : 2190080


    connection.query(`WITH team_id AS (SELECT teamID from Teams WHERE name = '${name}' LIMIT 1)
    SELECT slugSeason, s.gameID, date as date, slugMatchup as matchup, Players.name as namePlayer, Teams.name as nameTeam, typeAction, typeShot, quarter, minRemaining, secRemaining, zoneBasic, zoneName, distance, isShotMade as made
    FROM (SELECT * FROM Shots WHERE teamID = (SELECT * FROM team_id)) s JOIN (SELECT * FROM Games G WHERE gameID = ${gameID}) G
        on s.gameID = G.gameID JOIN Players on s.playerID = Players.playerID JOIN Teams on s.teamID = Teams.teamID
    ORDER BY quarter asc, minRemaining desc, secRemaining desc`, function(error, results, fields) {
        if (error) {
            console.log(error);
            res.json({ error: error });
        } else if (results) {
            res.json({ results: results });
        }
    })
}

// Route 21
// Query to get list of most clutch games
async function getClutchPlayerGames(req, res) {
    const minAttempts = req.query.minAttempts ? req.query.minAttempts : 8


    connection.query(`SELECT player_clutch.playerID as playerID, player_clutch.gameID as gameID, date as date, slugMatchup as matchup, Players.name as name, player_clutch.clutch_score as clutch_score, attempts
    FROM (SELECT playerID, gameID, AVG(z_score) clutch_score, SUM(attempts) as attempts
        FROM(SELECT playerID, gameID, zoneBasic, zoneRange, (player_avg - pop_average)/player_std as z_score, attempts
            FROM (
                SELECT playerID, gameID, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as player_avg,
                attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as player_std
                FROM Player_Averages_Clutch_Game p LEFT JOIN Historical_Averages h ON
                    p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
                ) player_zones) player_scores
            GROUP BY playerID, gameID
            HAVING SUM(attempts) >= ${minAttempts}) player_clutch LEFT JOIN Players ON player_clutch.playerID = Players.playerID LEFT JOIN Games g ON player_clutch.gameID = g.gameID
    ORDER BY clutch_score desc`, function(error, results, fields) {
        if (error) {
            console.log(error);
            res.json({ error: error });
        } else if (results) {
            res.json({ results: results });
        }
    })
}

// Route 22
// Query to get list of most clutch games for player
async function getClutchestPerformancesForPlayer(req, res) {
    const name = req.query.name ? req.query.name : "Seth Curry"
    const minAttempts = req.query.minAttempts ? req.query.minAttempts : 3

    connection.query(`WITH player_id AS (SELECT playerID FROM Players WHERE name = '${name}' LIMIT 1)
    SELECT player_clutch.playerID as playerID, player_clutch.gameID as gameID, date, slugMatchup as matchup, Players.name as name, player_clutch.clutch_score as clutch_score, attempts
        FROM (SELECT playerID, gameID, AVG(z_score) clutch_score, SUM(attempts) as attempts
            FROM(SELECT playerID, gameID, zoneBasic, zoneRange, (player_avg - pop_average)/player_std as z_score, attempts
                FROM (
                    SELECT playerID, gameID, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as player_avg,
                    attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as player_std
                    FROM (SELECT * FROM Player_Averages_Clutch_Game WHERE playerID = (SELECT * FROM player_id)) p LEFT JOIN Historical_Averages h ON
                        p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
                    ) player_zones) player_scores
                GROUP BY playerID, gameID
                HAVING SUM(attempts) >= ${minAttempts}) player_clutch LEFT JOIN Players ON player_clutch.playerID = Players.playerID LEFT JOIN Games G on player_clutch.gameID = G.gameID
        ORDER BY clutch_score desc`, function(error, results, fields) {
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
    getIdealShotDistribution,
    getPlayerInfo,
    getPlayerShotPerformances,
    getTeamInfo,
    getTeamShotPerformances,
    getLuckiestPerformancesForPlayer,
    getLuckiestPerformancesForTeam,
    getClutchestPerformancesForPlayer,
    getClutchPlayerGames,
    getShotsPlayerGame,
    getShotsTeamGame
}