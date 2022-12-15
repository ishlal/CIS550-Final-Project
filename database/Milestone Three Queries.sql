USE NBA;

# Basic Query: Get all shots for a given player (can add in more optional parameters)
SELECT *
FROM Shots
WHERE namePlayer = 'Zach LaVine' AND year = 2022 AND typeAction = 'Layup Shot';

# Basic Query: Gets shots for a given player within a time frame. Can be used for luckiness index for players
SELECT namePlayer, nameTeam, typeEvent, zoneName, quarter, minRemaining
FROM Shots
WHERE date=20141028
  AND (12*quarter + (12-minRemaining)) < 36
  AND (12*quarter + (12-minRemaining)) > 24
  AND namePlayer='Eric Gordon';

# Basic Query: Gets shots for a given team within a time frame. Can be used for luckiness index for team
SELECT namePlayer, nameTeam, typeEvent, zoneName, quarter, minRemaining
FROM Shots
WHERE date=20141028
  AND (12*quarter + (12-minRemaining)) < 36
  AND (12*quarter + (12-minRemaining)) > 24
  AND nameTeam='New Orleans Pelicans';

# Basic Query: Gets court locations of all shots for a given player. Can be used for shot chart
SELECT namePlayer, nameTeam, typeEvent, zoneName, zoneRange, locationX, locationY
FROM Shots
WHERE date=20141028
  AND namePlayer = 'Ryan Anderson';

# Basic Query: Gets all made shots of a player within the last x seconds of a quarter. Can be used for "clutch" index
SELECT namePlayer, nameTeam, typeEvent, zoneName, zoneRange, quarter, minRemaining, secRemaining
FROM Shots
WHERE namePlayer = 'Ryan Anderson'
    AND date = 20141028
    AND minRemaining < 1
    AND secRemaining <= 40
    AND isShotMade = 1;


# Basic Query: Gets all shots of a specific type for a player in a single season. Can be used for basic player stats
SELECT namePlayer, nameTeam, typeEvent, typeShot, typeAction
FROM Shots
WHERE namePlayer = 'Ryan Anderson'
    AND slugSeason= '2014-15'
    AND typeShot = '3PT Field Goal'
    AND typeAction = 'Jump Shot';

# Basic Query: For a given player get their distribution of shot locations

WITH player_shots AS (SELECT playerID, zoneName, zoneRange, zoneBasic, SUM(isShotAttempted) as attempts, AVG(isShotMade) as make_percentage
                    FROM Shots
                    WHERE namePlayer = 'Zach Lavine' # can add more clauses here to further subset
                    GROUP BY playerID, zoneName, zoneRange, zoneBasic
                    ORDER BY attempts desc),
    total_attempts AS (SELECT SUM(attempts)
                        FROM player_shots
                        GROUP BY playerID)
SELECT playerID, zoneName, zoneRange, zoneBasic, attempts, make_percentage, attempts/(SELECT * FROM total_attempts) take_percentage
FROM player_shots;

# Complex Query One: Get most clutch players by z-score of their clutch performance (with min # of attempts)
WITH Historical_Averages AS (SELECT zoneName, zoneRange, zoneBasic, average, std
                             FROM (SELECT zoneName, zoneRange, zoneBasic, AVG(isShotMade) as average,
                                          STD(isShotMade) std
                                   FROM Shots
                                   GROUP BY zoneName, zoneRange, zoneBasic) as all_games),
    Players_Averages_Clutch AS (SELECT playerID, zoneName, zoneRange, zoneBasic, average, attempts
                       FROM (SELECT playerID, zoneName, zoneRange, zoneBasic, SUM(isShotAttempted) as attempts, AVG(isShotMade) as average
                             FROM Shots
                             WHERE quarter = 4 AND minRemaining <= 5 # could add more restrictions here to subset even more
                             GROUP BY zoneName, zoneRange, zoneBasic, playerID) as wanted_games)
    SELECT player_clutch.playerID as playerID, Players.name as name, player_clutch.clutch_score as clutch_score, attempts
        FROM (SELECT playerID, AVG(z_score) clutch_score, SUM(attempts) as attempts
            FROM(SELECT playerID, zoneName, zoneBasic, zoneRange, (player_avg - pop_average)/player_std as z_score, attempts
                FROM (
                    SELECT playerID, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as player_avg,
                    attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as player_std
                    FROM Players_Averages_Clutch p LEFT JOIN Historical_Averages h ON
                        p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
                    ORDER BY playerID desc, attempts desc
                    ) player_zones) player_scores
                GROUP BY playerID
                HAVING SUM(attempts) > 10) player_clutch LEFT JOIN Players ON player_clutch.playerID = Players.playerID
        ORDER BY clutch_score desc;

# Complex Query Two: Get luckiest shooting performances by a team in an individual game
WITH Historical_Averages AS (SELECT zoneName, zoneRange, zoneBasic, average, std
                             FROM (SELECT zoneName, zoneRange, zoneBasic, AVG(isShotMade) as average,
                                          STD(isShotMade) std
                                   FROM Shots
                                   GROUP BY zoneName, zoneRange, zoneBasic) as all_games),
    Game_Averages AS (SELECT teamID, gameID, zoneName, zoneRange, zoneBasic, average, attempts
                       FROM (SELECT teamID, gameID, zoneName, zoneRange, zoneBasic, SUM(isShotAttempted) as attempts, AVG(isShotMade) as average
                             FROM Shots
                             # could add WHERE clause here to subset which games you want
                             GROUP BY zoneName, zoneRange, zoneBasic, teamID, gameID) as wanted_games)
    SELECT gs.teamID as teamID, gs.gameID as gameID, Teams.name as name, gs.luck_index as luck_index, attempts
        FROM (SELECT teamID, gameID, AVG(z_score) luck_index, SUM(attempts) as attempts
            FROM(SELECT teamID, gameID, zoneName, zoneBasic, zoneRange, (team_avg - pop_average)/team_std as z_score, attempts
                FROM (
                    SELECT teamID, gameID, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as team_avg,
                    attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as team_std
                    FROM Game_Averages p LEFT JOIN Historical_Averages h ON
                        p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
                    ) team_zones) team_scores
                GROUP BY teamID, gameID) gs LEFT JOIN Teams ON gs.teamID = Teams.teamID
        ORDER BY luck_index desc;
    # eventually should join on Games table to get more information about the specific game

# Complex Query Three: Get luckiest shooting performances by an individual player in an individual game (with some min # of attempts)
WITH Historical_Averages AS (SELECT zoneName, zoneRange, zoneBasic, average, std
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
        WHERE attempts >= 8
        ORDER BY luck_index desc;

# Complex Query Four: Determine the ideal shot distribution for a given player and compare it to their actual shot distribution
WITH player_shots AS (SELECT playerID, zoneRange, zoneBasic, SUM(isShotAttempted) as attempts, AVG(isShotMade) as make_percentage
                    FROM Shots
                    WHERE namePlayer = 'Stephen Curry' # can add more clauses here to further subset
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
ORDER BY opt_take_percentage;
