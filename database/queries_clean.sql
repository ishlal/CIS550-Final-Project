USE NBA;

# Route 9

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
            HAVING SUM(attempts) > 100) player_clutch LEFT JOIN Players ON player_clutch.playerID = Players.playerID
    ORDER BY clutch_score desc

# Route 10

SELECT gs.teamID as teamID, gs.gameID as gameID, date as date, slugMatchup as matchup, Teams.name as name, gs.luck_index as luck_index, attempts
        FROM (SELECT teamID, gameID, AVG(z_score) luck_index, SUM(attempts) as attempts
            FROM(SELECT teamID, gameID, zoneName, zoneBasic, zoneRange, (team_avg - pop_average)/team_std as z_score, attempts
                FROM (
                    SELECT teamID, gameID, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as team_avg,
                    attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as team_std
                    FROM Game_Averages_Team p LEFT JOIN Historical_Averages h ON
                        p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
                    ) team_zones) team_scores
                GROUP BY teamID, gameID) gs LEFT JOIN Teams ON gs.teamID = Teams.teamID JOIN Games G on gs.gameID = G.gameID
        ORDER BY luck_index desc;


# Route 10.1
WITH team_id AS (SELECT teamID from Teams WHERE name = 'San Antonio Spurs')
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
    ORDER BY luck_index desc;

# Route 12
WITH player_id AS (SELECT playerID FROM Players WHERE name = 'Zach Lavine' LIMIT 1),
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
ORDER BY opt_take_percentage desc;

# Route 13

SELECT name, playerID, firstSeason, playerStatsURL, playerHeadshotURL FROM Players WHERE name = 'Zach Lavine' LIMIT 1;

# Route 14
WITH player_id AS (SELECT playerID FROM Players WHERE name = 'Zach Lavine' LIMIT 1)
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
           SUM(CASE WHEN zoneName = 'Center' AND zoneBasic = 'Restricted Area' THEN isShotAttempted ELSE 0 END) as restricedArea,

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
    ORDER BY slugSeason desc;

# Route 15

WITH team_id AS (SELECT teamID FROM Teams WHERE name = '${name}' LIMIT 1)
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
           SUM(CASE WHEN zoneName = 'Center' AND zoneBasic = 'Restricted Area' THEN isShotAttempted ELSE 0 END) as restricedArea,

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
    ORDER BY slugSeason desc

# Route 16

SELECT name, city, wins, losses, playoffApps, divisionTitles, confTitles, championships FROM Teams WHERE name = '${name}' LIMIT 1;


# Route 17

WITH player_id AS (SELECT playerID from Players WHERE name = 'Seth Curry' LIMIT 1)
SELECT slugSeason, s.gameID, date as date, slugMatchup as matchup, Players.name as namePlayer, Teams.name as nameTeam, typeAction, typeShot, quarter, minRemaining, secRemaining, zoneBasic, zoneName, distance, isShotMade as made
FROM (SELECT * FROM Shots WHERE playerID = (SELECT * FROM player_id)) s JOIN (SELECT * FROM Games G WHERE gameID = 21900880) G
    on s.gameID = G.gameID JOIN Players on s.playerID = Players.playerID JOIN Teams on s.teamID = Teams.teamID
ORDER BY quarter asc, minRemaining desc, secRemaining desc;

# Route 18
WITH player_id AS (SELECT playerID from Players WHERE name = 'Seth Curry')
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
        WHERE attempts >= 8
        ORDER BY luck_index desc;


# Route 19
WITH team_id AS (SELECT teamID from Teams WHERE name = 'Atlanta Hawks')
    SELECT gs.teamID as teamID, gs.gameID as gameID, date as date, slugMatchup as matchup, Teams.name as name, gs.luck_index as luck_index, attempts
        FROM (SELECT teamID, gameID, AVG(z_score) luck_index, SUM(attempts) as attempts
            FROM (SELECT teamID, gameID, zoneName, zoneBasic, zoneRange, (player_avg - pop_average)/player_std as z_score, attempts
                FROM (
                    SELECT teamID, gameID, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as player_avg,
                        attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as player_std
                    FROM (SELECT * FROM Game_Averages_Team WHERE teamID = (SELECT * FROM team_id)) p  LEFT JOIN Historical_Averages h ON
                            p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
                    ) team_zones) player_scores
                GROUP BY teamID, gameID) gs LEFT JOIN Teams ON gs.teamID = Teams.teamID LEFT JOIN Games G on gs.gameID = G.gameID
        ORDER BY luck_index desc;

# Route 20
WITH team_id AS (SELECT teamID from Teams WHERE name = 'Atlanta Hawks' LIMIT 1)
SELECT slugSeason, s.gameID, date as date, slugMatchup as matchup, Players.name as namePlayer, Teams.name as nameTeam, typeAction, typeShot, quarter, minRemaining, secRemaining, zoneBasic, zoneName, distance, isShotMade as made
FROM (SELECT * FROM Shots WHERE teamID = (SELECT * FROM team_id)) s JOIN (SELECT * FROM Games G WHERE gameID = 22000356) G
    on s.gameID = G.gameID JOIN Players on s.playerID = Players.playerID JOIN Teams on s.teamID = Teams.teamID
ORDER BY quarter asc, minRemaining desc, secRemaining desc;

# Route 21
SELECT player_clutch.playerID as playerID, player_clutch.gameID as gameID, date as date, slugMatchup as matchup, Players.name as name, player_clutch.clutch_score as clutch_score, attempts
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
    ORDER BY clutch_score desc;

# Route 22
WITH player_id AS (SELECT playerID FROM Players WHERE name = 'Seth Curry' LIMIT 1)
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
    ORDER BY clutch_score desc;
