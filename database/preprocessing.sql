USE NBA;

DROP TABLE Historical_Averages;
DROP TABLE Player_Averages_Clutch;
DROP TABLE Game_Averages_Player;
DROP TABLE Game_Averages_Team;
DROP TABLE Player_Averages_Clutch_Game;



CREATE TABLE Historical_Averages AS (SELECT zoneName, zoneRange, zoneBasic, average, std
                             FROM (SELECT zoneName, zoneRange, zoneBasic, AVG(isShotMade) as average,
                                          STD(isShotMade) std
                                   FROM Shots
                                   GROUP BY zoneName, zoneRange, zoneBasic) as all_games);

CREATE TABLE Player_Averages_Clutch AS
    (SELECT playerID, zoneName, zoneRange, zoneBasic, SUM(isShotAttempted) as attempts, AVG(isShotMade) as average
                FROM (SELECT zoneName, zoneRange, zoneBasic, playerID, isShotAttempted, isShotMade FROM Shots LEFT JOIN Games G on G.gameID = Shots.gameID
                    WHERE quarter = 4 AND minRemaining <= 5 AND ABS(home_score - away_score) <= 10) s
                GROUP BY zoneName, zoneRange, zoneBasic, playerID);

CREATE TABLE Player_Averages_Clutch_Game AS (SELECT playerID, gameID, zoneName, zoneRange, zoneBasic, SUM(isShotAttempted) as attempts, AVG(isShotMade) as average
                             FROM (SELECT zoneName, zoneRange, zoneBasic, playerID, Shots.gameID, isShotAttempted, isShotMade FROM Shots JOIN Games G on G.gameID = Shots.gameID
                                            WHERE quarter = 4 AND minRemaining <= 5 AND ABS(home_score - away_score) <= 10) s
                             GROUP BY zoneName, zoneRange, zoneBasic, playerID, gameID);

CREATE TABLE Game_Averages_Player AS (SELECT playerID,gameID as gameID, zoneName, zoneRange, zoneBasic, slugSeason, average, attempts
                       FROM (SELECT playerID, Shots.gameID, zoneName, zoneRange, zoneBasic, slugSeason, SUM(isShotAttempted) as attempts, AVG(isShotMade) as average
                             FROM Shots JOIN (SELECT slugSeason, gameID FROM Games) G on Shots.gameID = G.gameID
                             # could add WHERE clause here to subset which games you want
                             GROUP BY zoneName, zoneRange, zoneBasic, playerID, Shots.gameID, slugSeason) as wanted_games);

CREATE TABLE Game_Averages_Team AS (SELECT teamID, gameID as gameID, zoneName, zoneRange, zoneBasic, slugSeason, average, attempts
                    FROM (SELECT teamID, Shots.gameID, zoneName, zoneRange, zoneBasic, slugSeason, SUM(isShotAttempted) as attempts, AVG(isShotMade) as average
                        FROM Shots JOIN (SELECT slugSeason, gameID FROM Games) G on Shots.gameID = G.gameID
                        # could add WHERE clause here to subset which games you want
                    GROUP BY zoneName, zoneRange, zoneBasic, teamID, Shots.gameID, slugSeason) as wanted_games);


SELECT * FROM Historical_Averages;
SELECT * FROM Player_Averages_Clutch;
SELECT * FROM Player_Averages_Clutch_Game;
SELECT * FROM Game_Averages_Player;
SELECT * FROM Game_Averages_Team;
