import React, {useRef, useEffect} from 'react';

import MenuBar from '../components/MenuBar';


function TeamsPage(props) {
    const teamRef = useRef();

    const onSubmit = (e) => {
        console.log(teamRef.current.value);
        e.preventDefault();
    }

    return (
        <div>
            <MenuBar />
            <h1>Teams Page!</h1>
            <form onSubmit={onSubmit}>
                <input type="text" ref={teamRef}/>
                <input type="submit" value="Search!"/>
            </form>
        </div>
    )
}
export default TeamsPage

