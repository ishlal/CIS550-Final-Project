import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';

import MenuBar from '../components/MenuBar';
import { getTeamInfo, getTeamShotPerformances, getLuckiestPerformancesForTeam } from '../fetcher';
import { shotTableColumns, luckColumns } from './Columns';
import {Table} from 'antd';
function TeamPage(props) {
    let { team_name } = useParams();
    const [teamInfo, setTeamInfo] = useState({});
    const [teamShots, setTeamShots] = useState({});
    const [luck, setLuck] = useState({});

    useEffect(() => {
        getTeamInfo(team_name).then(res => {
            setTeamInfo(res.results[0])
        });
        getTeamShotPerformances(team_name).then(res => {
            setTeamShots(res.results)
        });
        getLuckiestPerformancesForTeam(team_name).then(res => {
            console.log(res);
            setLuck(res.results)
        })
    }, [])

    return (
        <div>
            <MenuBar/>
            {Object.keys(teamInfo).length > 0 && 
                <div>
                    <h1>{teamInfo.name}</h1>
                    <h2>City: {teamInfo.city}</h2>
                    <h2>Championships: {teamInfo.championships}</h2>
                    <h2>Conference Titles: {teamInfo.confTitles}</h2>
                    <h2>Division Titles: {teamInfo.divisionTitles}</h2>
                    <h2>Playoff Appearances: {teamInfo.playoffApps}</h2>
                </div>
            }
            {Object.keys(teamShots).length > 0 && 
                <div>
                    <h2>Shot Distribution</h2>
                    <Table 
                        dataSource={teamShots} 
                        columns={shotTableColumns} 
                        pagination={{ pageSizeOptions:[5, 10], defaultPageSize: 5, showQuickJumper:true }} 
                        style={{ width: '70vw' }}
                        rowKey="slugSeason"
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
        </div>
    )
}

export default TeamPage

