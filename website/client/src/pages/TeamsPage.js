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
            <div className="text-center mt-5">
                <h1>Teams Page!</h1>
                <form onSubmit={onSubmit} className="mt-5">
                    <label for="team" className="mr-2">Team Name:</label>
                    <input type="text" ref={teamRef} id="team"/>
                    <input type="submit" value="Search!"/>
                </form>
            </div>
        </div>
    )
}
export default TeamsPage

