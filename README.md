# CIS550-Final-Project

# Running the Application

In two terminal / bash shells, do the following:

Shell 1:
```
cd website/client
mpm install
mpm start
```

Shell 2:
```
cd website/server
mpm install
mpm start
```

The development server should now open up from your window. 

# Motivation
As NBA fans, we enjoy not only watching NBA games but also discussing them with our friends. Oftentimes in
these discussions, we’ve noticed that there is information/metrics we want to reference but don’t have an easy
way of calculating/identifying. Our goal is to create a dashboard to make this information easy to access and
understand, so that people can have more fully informed discussions/debate about the NBA.

# Features

## Intend to Implement
1. Luckiness Index: 
  Given a game, determine how “lucky” a team was, by comparing the shots they took/made
relative to expected performance on a similar shot profile. The user can give some parameters when defining this value (ie how far to look back,
weightage on different shots, etc.)
2. Player Heat Index: Within a game, how hot/not hot they are – similar methodology to computing luckiness index
3. Win Probability Visualizer - this consists of (a.) looking at the win probability over course of game, and/or (b.) easily see largest plays in terms of win probability added/lost
4. Shot Chart: Visualize a player/game shot chart (note, stuff like this exists already, but it's a nice to have for a more complete dashboard)
5. Game Report: Similar idea to HW2 chart, just some basic descriptive statistics about a given game
6. Basic player/team statistics: A simple page displaying season statistics for any individual player or any individual team

## Possibly Implement

1. Clutch Index: Extending Win Probability onto an individual player basis (how "clutch" was each player in contributing to the win)
2. Player Value Index: Visualizing a player’s value relative to their contract value (using some stat like WAR), and can look over time, compared with other players, etc.
3. Team Championship Odds: Calculated based on team statistics through a season (again, there are models like this that exist, but is another nice to have for our dashboard)
4. Some type of betting/live odds information (could be related to win probability)

# Directory Descriptions

The `data` directory consists of three csv files, containing information on the players, teams, and the game logs per team for the eight NBA seasons from 2014-2015 to 2021-2022. 

The `database` directory consists of two files -- one being the DDL for our database, called NBA, with three tables: Players, Teams, and Shots; and the other being our ten queries for Milestone 3, including our four complex queries and descriptions of what each query does. 

# API Specifications
**Route 9**: /players/clutch

Description: Gets most clutch players by z-score of their clutch performance (with min # of attempts)

Expected (Output) Behavior: 
* minAttempts query parameter is optional– if not specified, minAttempts defaults to 0
* **Returns the most clutch players who have attempted {minAttempt} clutch shots**

**Route 10**: /luck/team
Description: Gets the luckiest shooting performance by a team in an individual game
Expected (Output) Behavior: 
* **Outputs the luckiest shooting performance by any team during an individual game**

**Route 12**: /player/ideal

Description: Returns a player’s ideal shot distribution given their current shooting percentages, and compare it to current shot distribution

Expected (Output) Behavior: 
* If name is not specified, default name is Zach Lavine
* **Returns the player’s ideal shot distribution and what their current shot distribution is relative to that**

**Route 13**: /player

Description: Returns player information for a given player

Expected (Output) Behavior:
* If name is not specified, default name is Zach Lavine
* **Returns overall introduction player information**

**Route 14**: /player/shots

Description: Returns player’s shot performance per zone per season for a player

Expected (Output) Behavior:
* If name is not specified, default name is Zach Lavine
* **Returns player’s shot performance for every zone on the court**


**Route 15**: /team/shots

Description: Returns shot performance by zone per season for a given team

Expected (Output) Behavior:
* If team name is not specified, default team is San Antonio Spurs
* **Returns a team’s shot performance for every zone on the court**

**Route 16**: /team

Description: Returns team information for a given team

Return (Output) Behavior:
* If a team name is not specified,default team is Atlanta Hawks
* **Returns overall team introduction information**

**Route 17**: /player/game/shots

Description: Gets all shots for a game and player

Expected (Output) Behavior:
* If a player name is not specified, default name is Seth Curry
* If game id is not specified, default game id is 21900880
* **Returns shots by a player in a single game**

**Route 18**: /player/luck

Description: Obtains luckiness index for a player

Expected (Output) Behavior:
* If a player name is not specified, default name is Seth Curry
* If minAttempts is not specified, the default value is 8
* **Calculates and determines a luckiness index for a given player who have exceeded a certain amount of minimum attempts**

**Route 19**: /team/luck

Description: Obtains luckiness index for a team

Expected (Output) Behavior
* If a team name is not specified, default team is Atlanta Hawks
* **Calculates and determines a luckiness index for a given team**


**Route 20**: /team/game/shots

Description: Gets all shots for a team from a game

Expected (Output) Behavior:
* If a team name is not specified, default name is Atlanta Hawks
* If game id is not specified, default game id is 21900880
* **Returns shots by a team in a single game**


**Route 21**: /game/clutch

Description: gets list of most clutch games

Expected (Output) Behavior:
* If minAttempts is not specified, defaults to 8.
* **Returns the most clutch games overall**

**Route 22**: /player/clutch

Description: gets a list of the most clutch games for a player

Expected (Output) Behavior:
* If minAttempts is not specified, defaults to 3
* **Returns a list of the most clutch games for a player**


