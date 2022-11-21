USE NBA;

# Basic Query One: Get all shots for a given player (need to add in more optional parameters)

SELECT *
FROM Shots
WHERE namePlayer = 'Zach Lavine' AND year = 2022 AND typeAction = 'Layup Shot';

# Basic Query Two: Gets shots for a given player within a time frame. Can be used for luckiness index for players
SELECT namePlayer, nameTeam, typeEvent, zoneName, quarter, minRemaining
FROM Shots
WHERE date=20141028
  AND (12*quarter + (12-minRemaining)) < 36
  AND (12*quarter + (12-minRemaining)) > 24
  AND namePlayer='Eric Gordon'

# Basic Query Three: Gets shots for a given team within a time frame. Can be used for luckiness index for team
SELECT namePlayer, nameTeam, typeEvent, zoneName, quarter, minRemaining
FROM Shots
WHERE date=20141028
  AND (12*quarter + (12-minRemaining)) < 36
  AND (12*quarter + (12-minRemaining)) > 24
  AND nameTeam='New Orleans Pelicans'

# Basic Query Four:


# Basic Query Five:



# Basic Query Six:


# Complex Query One: Get the historical averages by zone

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
        AND Game_Averages.zoneRange = Historical_Averages.zoneRange


# Complex Query Three:



# Complex Query Four: