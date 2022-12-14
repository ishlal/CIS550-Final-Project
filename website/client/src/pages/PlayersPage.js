import React, {useRef, useEffect} from 'react';

import MenuBar from '../components/MenuBar';
function PlayersPage(props) {
    const playerRef = useRef();

    const onSubmit = (e) => {
        console.log(playerRef.current.value);
        e.preventDefault();
    }

    return (
        <div>
            <MenuBar/>
            <h1>Players Page!</h1>
            <form onSubmit={onSubmit}>
                <input type="text" ref={playerRef}/>
                <input type="submit" value="Search!"/>
            </form>
        </div>
    )
}

export default PlayersPage

