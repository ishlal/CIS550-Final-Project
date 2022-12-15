import React, {useRef, useEffect, useState} from 'react';

import MenuBar from '../components/MenuBar';
import { getAllShotsOfPlayer } from '../fetcher';
function PlayersPage(props) {
    const playerRef = useRef();
    const [playerInfo, setPlayerInfo] = useState({});
    

    const onSubmit = (e) => {
        getAllShotsOfPlayer(playerRef.current.value, null).then(res => {
            setPlayerInfo(res.results)
        });
        e.preventDefault();
    }

    useEffect(() => {
        console.log(playerInfo);
    }, [playerInfo])

    return (
        <div>
            <MenuBar/>
            {Object.keys(playerInfo).length === 0 ? 
            <div>
                <h1>Players Page!</h1>
                <form onSubmit={onSubmit}>
                    <input type="text" ref={playerRef}/>
                    <input type="submit" value="Search!"/>
                </form>
            </div> :
            <div>
                <h1>{playerInfo[0].namePlayer}</h1>
                <h2>{playerInfo[0].nameTeam}</h2>
            </div>
            }
        </div>
    )
}

export default PlayersPage

