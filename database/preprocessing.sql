USE NBA;

DROP TABLE Historical_Averages;
DROP TABLE Player_Averages_Clutch;
DROP TABLE Game_Averages_Player;
DROP TABLE Game_Averages_Team;



CREATE TABLE Historical_Averages AS (SELECT zoneName, zoneRange, zoneBasic, average, std
                             FROM (SELECT zoneName, zoneRange, zoneBasic, AVG(isShotMade) as average,
                                          STD(isShotMade) std
                                   FROM Shots
                                   GROUP BY zoneName, zoneRange, zoneBasic) as all_games);

CREATE TABLE Player_Averages_Clutch AS (SELECT playerID, zoneName, zoneRange, zoneBasic, average, attempts
                       FROM (SELECT playerID, zoneName, zoneRange, zoneBasic, SUM(isShotAttempted) as attempts, AVG(isShotMade) as average
                             FROM Shots
                             WHERE quarter = 4 AND minRemaining <= 5 # could add more restrictions here to subset even more
                             GROUP BY zoneName, zoneRange, zoneBasic, playerID) as wanted_games);

CREATE TABLE Game_Averages_Player AS (SELECT playerID, gameID, zoneName, zoneRange, zoneBasic, slugSeason, average, attempts
                       FROM (SELECT playerID, gameID, zoneName, zoneRange, zoneBasic, slugSeason, SUM(isShotAttempted) as attempts, AVG(isShotMade) as average
                             FROM Shots
                             # could add WHERE clause here to subset which games you want
                             GROUP BY zoneName, zoneRange, zoneBasic, playerID, gameID, slugSeason) as wanted_games);

CREATE TABLE Game_Averages_Team AS (SELECT teamID, gameID, zoneName, zoneRange, zoneBasic, slugSeason, average, attempts
                    FROM (SELECT teamID, gameID, zoneName, zoneRange, zoneBasic, slugSeason, SUM(isShotAttempted) as attempts, AVG(isShotMade) as average
                        FROM Shots
                        # could add WHERE clause here to subset which games you want
                    GROUP BY zoneName, zoneRange, zoneBasic, teamID, gameID, slugSeason) as wanted_games);


SELECT * FROM Historical_Averages;
SELECT * FROM Player_Averages_Clutch;
SELECT * FROM Game_Averages_Player;
SELECT * FROM Game_Averages_Team;
