USE NBA;

# Basic Query One: Get all shots for a given player (need to add in more optional parameters)

SELECT *
FROM Shots
WHERE namePlayer = 'Zach Lavine' AND year = 2022 AND typeAction = 'Layup Shot';

# Basic Query Two:


# Basic Query Three:


# Basic Query Four:


# Basic Query Five:



# Basic Query Six:


# Complex Query One: Get the historical averages by zone (need to improve)

WITH NBA_Average_By_Zone AS (SELECT zoneName, zoneRange, zoneBasic, SUM(isShotAttempted) as attempts, SUM(isShotMade) as makes
                             FROM Shots
                             GROUP BY zoneName, zoneRange, zoneBasic)
SELECT zoneName, zoneRange, zoneBasic, makes/attempts as percentage
FROM NBA_Average_By_Zone;


# Complex Query Two: Compare a given game to historical averages

WITH Historical_Averages AS (SELECT zoneName, zoneRange, zoneBasic, makes/attempts as percentage, attempts
                             FROM (SELECT zoneName, zoneRange, zoneBasic, SUM(isShotAttempted) as attempts, SUM(isShotMade) as makes
                                   FROM Shots
                                   GROUP BY zoneName, zoneRange, zoneBasic) as all_games),
    Game_Averages AS (SELECT zoneName, zoneRange, zoneBasic, makes/attempts as percentage, attempts
                       FROM (SELECT zoneName, zoneRange, zoneBasic, SUM(isShotAttempted) as attempts, SUM(isShotMade) as makes
                             FROM Shots
                             WHERE gameID = 21400008
                             GROUP BY zoneName, zoneRange, zoneBasic) as wanted_games)
SELECT Game_Averages.zoneName as zoneName, Game_Averages.zoneRange as zoneRange, Game_Averages.zoneBasic as zoneBasic,
       Game_Averages.percentage as game_percentage, Historical_Averages.percentage as historical_percentage, Game_Averages.attempts as game_attempts
FROM Game_Averages JOIN Historical_Averages
    ON Game_Averages.zoneBasic = Historical_Averages.zoneBasic
        AND Game_Averages.zoneName = Historical_Averages.zoneName
        AND Game_Averages.zoneRange = Historical_Averages.zoneRange;


# Complex Query Three: Get most clutch players (IN PROGRESS)

WITH Historical_Averages AS (SELECT zoneName, zoneRange, zoneBasic, average, attempts, std
                             FROM (SELECT zoneName, zoneRange, zoneBasic, SUM(isShotAttempted) as attempts, AVG(isShotMade) as average,
                                          STD(isShotMade) std
                                   FROM Shots
                                   GROUP BY zoneName, zoneRange, zoneBasic) as all_games),
    Players_Averages_Clutch AS (SELECT playerID, zoneName, zoneRange, zoneBasic, makes/attempts as percentage, attempts
                       FROM (SELECT playerID, zoneName, zoneRange, zoneBasic, SUM(isShotAttempted) as attempts, SUM(isShotMade) as makes
                             FROM Shots
                             WHERE quarter = 4 AND minRemaining <= 5
                             GROUP BY zoneName, zoneRange, zoneBasic, playerID) as wanted_games)
    SELECT * FROM Historical_Averages



# Complex Query Four: