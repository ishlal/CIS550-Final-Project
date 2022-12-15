USE NBA;

#DROP INDEX player_ranges_games ON Shots;
#DROP INDEX player_ranges_simple On Shots;
#DROP INDEX ranges on Shots;
#DROP INDEX time on Shots;
#DROP INDEX team_ranges_games on Shots;

#DROP TEMPORARY TABLE Historical_Averages;
#DROP TEMPORARY TABLE Game_Averages_Player;
#DROP TEMPORARY TABLE Game_Averages_Team;
#DROP TEMPORARY TABLE Player_Averages_Clutch;



# Creating indexes
CREATE INDEX player_ranges_games ON Shots(playerID, gameID, zoneBasic, zoneRange, zoneName);

CREATE INDEX player_ranges_simple ON Shots(playerID, zoneBasic, zoneRange, zoneName);

CREATE INDEX ranges ON Shots(zoneRange, zoneName, zoneBasic);

CREATE INDEX time ON Shots(quarter, minRemaining);

CREATE INDEX team_ranges_games ON Shots(teamID, gameID, zoneName, zoneRange, zoneBasic);

# Optimised Query One <1s
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
            HAVING SUM(attempts) > 10) player_clutch LEFT JOIN Players ON player_clutch.playerID = Players.playerID
    ORDER BY clutch_score desc;


# Optimised Query Two 1s 562 ms
    SELECT gs.teamID as teamID, gs.gameID as gameID, Teams.name as name, gs.luck_index as luck_index, attempts
        FROM (SELECT teamID, gameID, AVG(z_score) luck_index, SUM(attempts) as attempts
            FROM(SELECT teamID, gameID, zoneName, zoneBasic, zoneRange, (team_avg - pop_average)/team_std as z_score, attempts
                FROM (
                    SELECT teamID, gameID, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as team_avg,
                    attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as team_std
                    FROM Game_Averages_Team p LEFT JOIN Historical_Averages h ON
                        p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
                    ) team_zones) team_scores
                GROUP BY teamID, gameID) gs LEFT JOIN Teams ON gs.teamID = Teams.teamID
        ORDER BY luck_index desc;
    # eventually should join on Games table to get more information about the specific game

    SELECT gs.teamID as teamID, gs.gameID as gameID, Teams.name as name, gs.luck_index as luck_index, attempts
        FROM (SELECT teamID, gameID, AVG(z_score) luck_index, SUM(attempts) as attempts
            FROM(SELECT teamID, gameID, zoneName, zoneBasic, zoneRange, (team_avg - pop_average)/team_std as z_score, attempts
                FROM (
                    SELECT teamID, gameID, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as team_avg,
                    attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as team_std
                    FROM Game_Averages_Team p LEFT JOIN Historical_Averages h ON
                        p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
                    ) team_zones) team_scores
                GROUP BY teamID, gameID) gs LEFT JOIN Teams ON gs.teamID = Teams.teamID
        ORDER BY luck_index desc;

# Optimised Query Three 5s
SELECT gs.playerID as playerID, gs.gameID as gameID, Players.name as name, gs.luck_index as luck_index, attempts
    FROM (SELECT playerID, gameID, AVG(z_score) luck_index, SUM(attempts) as attempts
        FROM (SELECT playerID, gameID, zoneName, zoneBasic, zoneRange, (player_avg - pop_average)/player_std as z_score, attempts
            FROM (
                SELECT playerID, gameID, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as player_avg,
                    attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as player_std
                FROM Game_Averages_Player p LEFT JOIN Historical_Averages h ON
                        p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
                ) team_zones) player_scores
            GROUP BY playerID, gameID) gs LEFT JOIN Players ON gs.playerID = Players.playerID
    WHERE attempts >= 8
    ORDER BY luck_index desc;

# query to get luckiness index for all games for specific player
SELECT gs.playerID as playerID, gs.gameID as gameID, Players.name as name, gs.luck_index as luck_index, attempts
    FROM (SELECT playerID, gameID, AVG(z_score) luck_index, SUM(attempts) as attempts
        FROM (SELECT playerID, gameID, zoneName, zoneBasic, zoneRange, (player_avg - pop_average)/player_std as z_score, attempts
            FROM (
                SELECT playerID, gameID, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as player_avg,
                    attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as player_std
                FROM (SELECT * FROM Game_Averages_Player WHERE playerID = 203552) p  LEFT JOIN Historical_Averages h ON
                        p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
                ) team_zones) player_scores
            GROUP BY playerID, gameID) gs LEFT JOIN Players ON gs.playerID = Players.playerID
    WHERE attempts >= 8
    ORDER BY luck_index desc;

# query to get ideal shot distribution
WITH player_shots AS (SELECT playerID, zoneRange, zoneBasic, SUM(isShotAttempted) as attempts, AVG(isShotMade) as make_percentage
                    FROM Shots
                    WHERE playerID = 203552 # can add more clauses here to further subset
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


# for specific team
SELECT gs.teamID as teamID, gs.gameID as gameID, Teams.name as name, gs.luck_index as luck_index, attempts
        FROM (SELECT teamID, gameID, AVG(z_score) luck_index, SUM(attempts) as attempts
            FROM(SELECT teamID, gameID, zoneName, zoneBasic, zoneRange, (team_avg - pop_average)/team_std as z_score, attempts
                FROM (
                    SELECT teamID, gameID, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as team_avg,
                    attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as team_std
                    FROM (SELECT * FROM Game_Averages_Team WHERE teamID = 1610612759) p LEFT JOIN Historical_Averages h ON
                        p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
                    ) team_zones) team_scores
                GROUP BY teamID, gameID) gs LEFT JOIN Teams ON gs.teamID = Teams.teamID
        ORDER BY luck_index desc;


# get luckiness for team in season
    SELECT gs.teamID as teamID, gs.gameID as gameID, Teams.name as name, gs.slugSeason AS season, gs.luck_index as luck_index, attempts
        FROM (SELECT teamID, gameID, slugSeason, AVG(z_score) luck_index, SUM(attempts) as attempts
            FROM(SELECT teamID, gameID, slugSeason, zoneName, zoneBasic, zoneRange, (team_avg - pop_average)/team_std as z_score, attempts
                FROM (
                    SELECT teamID, gameID, slugSeason, p.zoneName as zoneName, p.zoneRange as zoneRange, p.zoneBasic as zoneBasic, p.average as team_avg,
                    attempts, h.average as pop_average, std as pop_std, std/SQRT(attempts) as team_std
                    FROM (SELECT * FROM Game_Averages_Team WHERE teamID = 1610612759 AND slugSeason = '2014-15') p
                            LEFT JOIN Historical_Averages h ON p.zoneRange = h.zoneRange AND p.zoneName = h.zoneName AND p.zoneBasic = h.zoneBasic
                    ) team_zones) team_scores
                GROUP BY teamID, gameID) gs LEFT JOIN Teams ON gs.teamID = Teams.teamID
        ORDER BY luck_index desc;

WITH player_id AS (SELECT playerID FROM Players WHERE name = 'Zach Lavine' LIMIT 1), player_shots AS (SELECT playerID, zoneRange, zoneBasic, SUM(isShotAttempted) as attempts, AVG(isShotMade) as make_percentage
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