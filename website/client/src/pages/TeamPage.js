import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';

import MenuBar from '../components/MenuBar';
import {useHistory} from 'react-router-dom';
import { getTeamInfo, getTeamShotPerformances, getLuckiestPerformancesForTeam, getShotsTeamGame } from '../fetcher';
import { shotTableColumns } from './Columns';
import {Table} from 'antd';
function TeamPage(props) {
    let { team_name } = useParams();
    const history = useHistory();
    const [teamInfo, setTeamInfo] = useState({});
    const [teamShots, setTeamShots] = useState({});
    const [luck, setLuck] = useState({});
    const [currGame, setCurrGame] = useState(-1);
    const [specificGame, setSpecificGame] = useState({});

    const specificGameColumns = [
        {
            title: 'Player',
            dataIndex: 'namePlayer',
            key: 'namePlayer',
            render: (name) => <a href={`/players/${name}`}>{name}</a>
        },
        {
            title: 'Quarter',
            dataIndex:'quarter',
            key:'quarter'
        },
        {
            title: 'Minutes Remaining',
            dataIndex: 'minRemaining',
            key: 'minRemaining',
        },
        {
            title: 'Seconds Remaining',
            dataIndex: 'secRemaining',
            key: 'secRemaining'
        },
        {
            title: 'Shot Type',
            dataIndex: 'typeShot',
            key: 'typeShot'
        },
        {
            title: 'Distance From Basket',
            dataIndex: 'distance',
            key: 'distance'
        },
        {
            title: 'Made',
            dataIndex: 'made',
            key: 'made',
            render: (made) => <span>{made}</span>
        }
    ]

    useEffect(() => {
        if (currGame > 0) {
            getShotsTeamGame(team_name, currGame).then(res => {
                setSpecificGame(res.results);
            })
        }
    }, [currGame])

    const luckColumns = [
        { 
            title: 'Game ID',
            dataIndex: 'gameID',
            key: 'gameID',
            sorter: (a, b) => a.gameID - b.gameID,
            render: (text) => <span style={{color: 'blue'}} onClick={() => setCurrGame(text)}>{text}</span>
        },
        {
            title: 'Matchup',
            dataIndex: 'Matchup',
            key: 'Matchup',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Attempts',
            dataIndex: 'attempts',
            key: 'attempts',
            sorter: (a, b) => a.attempts - b.attempts
        },
        {
            title: 'Luck Index',
            dataIndex: 'luck_index',
            key: 'luck_index',
            sorter: (a, b) => a.luck_index - b.luck_index
        }
    ]

    useEffect(() => {
        getTeamInfo(team_name).then(res => {
            if (res.results.length === 0) {
                console.log("team does not exist!");
                history.push(('/teams'));
            }
            setTeamInfo(res.results[0]);
        });
        getTeamShotPerformances(team_name).then(res => {
            setTeamShots(res.results)
        });
        getLuckiestPerformancesForTeam(team_name).then(res => {
            setLuck(res.results)
        })
    }, [])

    return (
        <div>
            <MenuBar/>
            {Object.keys(teamInfo).length > 0 && 
                <div className="text-center mt-5">
                    <h1>{teamInfo.name}</h1>
                    <h2>City: {teamInfo.city}</h2>
                    <h2>Championships: {teamInfo.championships}</h2>
                    <h2>Conference Titles: {teamInfo.confTitles}</h2>
                    <h2>Division Titles: {teamInfo.divisionTitles}</h2>
                    <h2>Playoff Appearances: {teamInfo.playoffApps}</h2>
                </div>
            }
            {Object.keys(teamShots).length > 0 && 
                <div className="text-center mt-5">
                    <h2>Shot Distribution</h2>
                    <Table 
                        dataSource={teamShots} 
                        columns={shotTableColumns} 
                        pagination={{ pageSizeOptions:[5, 10], defaultPageSize: 5, showQuickJumper:true }} 
                        className="ml-5 mr-5 mt-5"
                        rowKey="slugSeason"
                    />
                </div>
            }
            {Object.keys(luck).length > 0 &&
                <div className="text-center mt-5">
                    <h2>Luckiest Performances</h2>
                    <Table 
                        dataSource={luck} 
                        columns={luckColumns} 
                        className="ml-5 mr-5 mt-5"
                        rowKey="Id"
                    />
                </div>
            }
            {
                Object.keys(specificGame).length > 0 &&
                <div className="text-center mt-5">
                    <h2>Shots Taken During {specificGame[0].matchup} ({specificGame[0].date})</h2>
                    <Table
                        dataSource={specificGame}
                        columns={specificGameColumns}
                        className="ml-5 mr-5 mt-5"
                        rowKey="Id"
                    />
                </div>
            }
        </div>
    )
}

export default TeamPage

