# CIS550-Final-Project

# Motivation
As NBA fans, we enjoy not only watching NBA games but also discussing them with our friends. Oftentimes in
these discussions, we’ve noticed that there is information/metrics we want to reference but don’t have an easy
way of calculating/identifying. Our goal is to create a dashboard to make this information easy to access and
understand, so that people can have more fully informed discussions/debate about the NBA.

# Feature

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
