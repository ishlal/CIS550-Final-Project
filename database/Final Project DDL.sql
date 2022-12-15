CREATE DATABASE NBA;

USE NBA;

CREATE TABLE Players(
    name varchar(255) NOT NULL,
    playerID int,
    firstSeason int,
    lastSeason int,
    playerStatsURL varchar(512),
    playerHeadshotURL varchar(512),
    playerPhotoURL varchar(512),
    PRIMARY KEY (playerID)
);

CREATE TABLE Teams(
    name varchar(64) NOT NULL,
    teamID int,
    slug varchar(8),
    city varchar(64),
    mascot varchar(64),
    conferenceID int,
    divisionID int,
    num_seasons int,
    wins int,
    losses int,
    playoffApps int,
    divisionTitles int,
    confTitles int,
    championships int,
    PRIMARY KEY (teamID)
);

CREATE TABLE Games(
    slugSeason varchar(12),
    gameID int,
    date varchar(16),
    slugMatchup varchar(12),
    homeID int,
    awayID int,
    home_score int,
    away_score int,
    PRIMARY KEY (gameID),
    FOREIGN KEY (homeID) REFERENCES Teams(teamID),
    FOREIGN KEY (awayID) REFERENCES Teams(teamID)
);

CREATE TABLE Shots(
    teamID int,
    playerID int,
    typeGrid varchar(32),
    typeEvent varchar(32),
    typeAction varchar(32),
    typeShot varchar(32),
    gameID int,
    eventID int,
    quarter int,
    minRemaining int,
    zoneBasic varchar(64),
    zoneName varchar(32),
    zoneRange varchar(32),
    locationX int,
    locationY int,
    secRemaining int,
    distance int,
    isShotAttempted int,
    isShotMade int,
    PRIMARY KEY (gameID, teamID, playerID, eventID),
    FOREIGN KEY (teamID) REFERENCES Teams(teamID),
    FOREIGN KEY (playerID) REFERENCES Players(playerID),
    FOREIGN KEY (gameID) REFERENCES Games(gameID)
);

DROP TABLE Shots;


