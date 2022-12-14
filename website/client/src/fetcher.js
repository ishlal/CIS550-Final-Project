import config from './config.json'


const getAllShotsOfPlayer = async (name, shotType) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/shots/player?name=${name}&shotType=${shotType}`, {
        method: 'GET',
    })
    return res.json()
}

const getGameShotsOfPlayer = async (name, date, startTime, endTime) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/game/shots/player?name=${name}&date=${date}&startTime=${startTime}&endTime=${endTime}`, {
        method: 'GET',
    })
    return res.json()
}

const getGameShotsOfTeam = async (team, date, startTime, endTime) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/game/shots/team?name=${team}&date=${date}&startTime=${startTime}&endTime=${endTime}`, {
        method: 'GET',
    })
    return res.json()
}

const getShotLocationsOfPlayer = async (name, date) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/game/shots/player/locations?name=${name}&date=${date}`, {
        method: 'GET',
    })
    return res.json()
}

const getClutchShotsOfPlayer = async (name, date, time) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/shots/player/clutch?name=${name}&date=${date}&time=${time}`, {
        method: 'GET',
    })
    return res.json()
}

const getSeasonShotsOfPlayer = async (name, season, shotType, shotAction) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/season/player?name=${name}&season=${season}&shotType=${shotType}&shotAction=${shotAction}`, {
        method: 'GET',
    })
    return res.json()
}

const getShotDistribution = async (name) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/shots/player/distribution?name=${name}`, {
        method: 'GET',
    })
    return res.json()
}

const getClutchPlayers = async (min) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/players/clutch?min=${min}`, {
        method: 'GET'
    })
    return res.json()
}

const getLuckyPerformances = async () => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/luck/team`, {
        method: 'GET'
    })
    return res.json()
}

const getLuckiestPlayerPerformances = async (min) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/luck/player?min=${min}`, {
        method: 'GET'
    })
    return res.json()
}

const getIdealShotDistribution = async (name) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/player/ideal?name=${name}`, {
        method: 'GET'
    })
    return res.json()
}







export {
    getAllShotsOfPlayer,
    getGameShotsOfPlayer,
    getGameShotsOfTeam,
    getShotLocationsOfPlayer,
    getClutchShotsOfPlayer,
    getSeasonShotsOfPlayer,
    getShotDistribution,
    getClutchPlayers,
    getLuckyPerformances,
    getLuckiestPlayerPerformances,
    getIdealShotDistribution
}