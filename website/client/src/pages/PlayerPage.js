import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';

import MenuBar from '../components/MenuBar';
import { getPlayerInfo, getPlayerShotPerformances, getIdealShotDistribution, getLuckiestPerformancesForPlayer, getClutchestPerformancesForPlayer } from '../fetcher';
import { shotDistributionColumns, shotTableColumns, luckColumns, clutchColumns } from './tableColumns';

import {Table} from 'antd';
function PlayerPage(props) {
    let { player_name } = useParams();
    const [playerInfo, setPlayerInfo] = useState({});
    const [playerShots, setPlayerShots] = useState({});
    const [idealShots, setIdealShots] = useState({});
    const [luck, setLuck] = useState({});
    const [clutch, setClutch] = useState({});

    useEffect(() => {
        console.log(player_name);
        getPlayerInfo(player_name).then(res => {
            setPlayerInfo(res.results)
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
            console.log(res);
            setClutch(res.results)
        })
    }, [])

    return (
        <div>
            <MenuBar/>
            {Object.keys(playerInfo).length > 0 &&
            <div>
                <img src={playerInfo[0].playerHeadshotURL}/>
                <h1>{playerInfo[0].name}</h1>
                <h2>First Season: {playerInfo[0].firstSeason}</h2>
                <a href={playerInfo[0].playerStatsURL}>Player Stats</a>
            </div>
            }
            {Object.keys(playerShots).length > 0 && 
                <div>
                    <h2>Shot Distribution</h2>
                    <Table 
                        dataSource={playerShots} 
                        columns={shotTableColumns} 
                        pagination={{ pageSizeOptions:[5, 10], defaultPageSize: 5, showQuickJumper:true }} 
                        style={{ width: '70vw' }}
                        rowKey="slugSeason"
                    />
                </div>
            }
            {Object.keys(idealShots).length > 0 &&
                <div>
                    <h2>Ideal Shot Distribution</h2>
                    <Table 
                        dataSource={idealShots} 
                        columns={shotDistributionColumns} 
                        style={{ width: '70vw' }}
                        rowKey="Id"
                    />
                </div>
            }
            {Object.keys(luck).length > 0 &&
                <div>
                    <h2>Luckiest Performances</h2>
                    <Table 
                        dataSource={luck} 
                        columns={luckColumns} 
                        style={{ width: '70vw' }}
                        rowKey="Id"
                    />
                </div>
            }
            {Object.keys(clutch).length > 0 &&
                <div>
                    <h2>Most Clutch Performances</h2>
                    <Table 
                        dataSource={clutch} 
                        columns={clutchColumns} 
                        style={{ width: '70vw' }}
                        rowKey="Id"
                    />
                </div>
            }
        </div>
    )
}

export default PlayerPage

