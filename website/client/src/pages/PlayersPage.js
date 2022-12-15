import React, {useRef} from 'react';

import MenuBar from '../components/MenuBar';
import {useHistory} from 'react-router-dom';

function PlayersPage(props) {
    const playerRef = useRef();
    const history = useHistory();

    const onSubmit = (e) => {
        e.preventDefault();
        history.push(`/players/${playerRef.current.value}`);
    }

    return (
        <div>
            <MenuBar/>
            <div>
                <h1>Players Page!</h1>
                <form onSubmit={onSubmit}>
                    <input type="text" ref={playerRef}/>
                    <input type="submit" value="Search!"/>
                </form>
            </div>
        </div>
    )
}

export default PlayersPage

