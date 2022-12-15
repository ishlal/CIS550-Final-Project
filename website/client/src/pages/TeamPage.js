import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';

import MenuBar from '../components/MenuBar';
import { getTeamInfo } from '../fetcher';
// import { shotDistributionColumns, shotTableColumns, luckColumns, clutchColumns } from './TableColumns';
import {Table} from 'antd';
function TeamPage(props) {
    let { team_name } = useParams();
    const [teamInfo, setTeamInfo] = useState({});

    useEffect(() => {
        getTeamInfo(team_name).then(res => {
            setTeamInfo(res.results[0])
        });
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
        </div>
    )
}

export default TeamPage

