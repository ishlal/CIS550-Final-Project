import React, {useEffect, useState, useRef} from 'react';
import { useParams } from 'react-router-dom';

import MenuBar from '../components/MenuBar';
import { useHistory } from 'react-router-dom';
import { getPlayerInfo, getPlayerShotPerformances, getIdealShotDistribution, getLuckiestPerformancesForPlayer, getClutchestPerformancesForPlayer, getShotsPlayerGame } from '../fetcher';
import { shotDistributionColumns, shotTableColumns, specificGameColumns } from './Columns';

import {Table} from 'antd';
function PlayerPage(props) {
    let { player_name } = useParams();
    const history = useHistory();
    const [playerInfo, setPlayerInfo] = useState({});
    const [playerShots, setPlayerShots] = useState({});
    const [idealShots, setIdealShots] = useState({});
    const [luck, setLuck] = useState({});
    const [clutch, setClutch] = useState({});
    const [currGame, setCurrGame] = useState(-1);
    const [specificGame, setSpecificGame] = useState({});
    const luckMinRef = useRef();
    const clutchMinRef = useRef();

    const specificGameColumns = [
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
            getShotsPlayerGame(player_name, currGame).then(res => {
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
    
    const clutchColumns = [
        { 
            title: 'Game ID',
            dataIndex: 'gameID',
            key: 'gameID',
            sorter: (a, b) => a.gameID - b.gameID,
            render: (text) => <span style={{color: 'blue'}}onClick={() => setCurrGame(text)}>{text}</span>
        },
        {
            title: 'Matchup',
            dataIndex: 'matchup',
            key: 'matchup',
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
            title: 'Clutch Score',
            dataIndex: 'clutch_score',
            key: 'clutch_score',
            sorter: (a, b) => a.clutch_score - b.clutch_score
        }
    ]

    useEffect(() => {
        getPlayerInfo(player_name).then(res => {
            setPlayerInfo(res.results)
            if (res.results.length === 0) {
                console.log("player does not exist!");
                history.push((`/players`));
            }
        });
        getPlayerShotPerformances(player_name).then(res => {
            setPlayerShots(res.results)
        });
        getIdealShotDistribution(player_name).then(res => {
            setIdealShots(res.results)
        });
        getLuckiestPerformancesForPlayer(player_name, 8).then(res => {
            setLuck(res.results)
        });
        getClutchestPerformancesForPlayer(player_name, 0).then(res => {
            setClutch(res.results)
        })
    }, [])

    const luckOnSubmit = (e) => {
        e.preventDefault();
        getLuckiestPerformancesForPlayer(player_name, luckMinRef.current.value).then(res => {
            setLuck(res.results);
        })
    }

    const clutchOnSubmit = (e) => {
        e.preventDefault();
        getClutchestPerformancesForPlayer(player_name, clutchMinRef.current.value).then(res => {
            setClutch(res.results);
        })
    }

    return (
        <div>
            <MenuBar/>
            {Object.keys(playerInfo).length > 0 &&
            <div className="text-center mt-5">
                <img src={playerInfo[0].playerHeadshotURL}/>
                <h1>{playerInfo[0].name}</h1>
                <h2>First Season: {playerInfo[0].firstSeason}</h2>
                <a href={playerInfo[0].playerStatsURL}>Player Stats</a>
            </div>
            }
            {Object.keys(playerShots).length > 0 && 
                <div className="text-center mt-5">
                    <h2>Shot Distribution</h2>
                    <Table 
                        dataSource={playerShots} 
                        columns={shotTableColumns} 
                        pagination={{ pageSizeOptions:[5, 10], defaultPageSize: 5, showQuickJumper:true }} 
                        className="ml-5 mr-5 mt-5"
                        rowKey="slugSeason"
                    />
                </div>
            }
            {Object.keys(idealShots).length > 0 &&
                <div className="text-center mt-5">
                    <h2>Ideal Shot Distribution</h2>
                    <Table 
                        dataSource={idealShots} 
                        columns={shotDistributionColumns} 
                        className="ml-5 mr-5 mt-5"
                        rowKey="Id"
                    />
                </div>
            }
            {Object.keys(luck).length > 0 &&
                <div className="text-center mt-5">
                    <h2>Luckiest Performances</h2>
                    <form onSubmit={luckOnSubmit}>
                        <label for="luckMin" className="mr-2 mt-5">Minimum Attempts: </label>
                        <input type="number" ref={luckMinRef} id="luckMin"/>
                        <input type="submit"/>
                    </form>
                    <Table 
                        dataSource={luck} 
                        columns={luckColumns} 
                        className="ml-5 mr-5"
                        rowKey="Id"
                    />
                </div>
            }
            {Object.keys(clutch).length > 0 &&
                <div className="text-center mt-5">
                    <h2>Most Clutch Performances</h2>
                    <form onSubmit={clutchOnSubmit}>
                        <label for="clutchMin" className="mr-2 mt-5">Minimum Attempts: </label>
                        <input type="number" ref={clutchMinRef} id="clutchMin"/>
                        <input type="submit"/>
                    </form>
                    <Table 
                        dataSource={clutch} 
                        columns={clutchColumns} 
                        className="ml-5 mr-5"
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

export default PlayerPage

