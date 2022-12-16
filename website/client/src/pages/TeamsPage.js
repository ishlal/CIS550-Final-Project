import React, {useRef} from 'react';

import MenuBar from '../components/MenuBar';
import {useHistory} from 'react-router-dom';

function TeamsPage(props) {
    const teamRef = useRef();
    const history = useHistory();

    const onSubmit = (e) => {
        e.preventDefault();
        history.push(`/teams/${teamRef.current.value}`);
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

