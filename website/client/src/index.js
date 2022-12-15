import React from 'react';
import ReactDOM from 'react-dom';
import {
	BrowserRouter as Router,
	Route,
	Switch
} from 'react-router-dom';

import HomePage from './pages/HomePage';
import PlayersPage from './pages/PlayersPage';
import PlayerPage from './pages/PlayerPage';
import TeamsPage from './pages/TeamsPage';
import TeamPage from './pages/TeamPage';
import ClutchPage from './pages/ClutchPage';
import LuckPage from './pages/LuckPage';
import 'antd/dist/antd.css';

import "bootstrap/dist/css/bootstrap.min.css";
import "shards-ui/dist/css/shards.min.css"

ReactDOM.render(
  <div>
    <Router>
      <Switch>
        <Route exact
			path="/"
			render={() => (
				<HomePage />
			)}
		/>
        <Route exact
			path="/players"
			render={() => (
				<PlayersPage />
			)}
		/>
		<Route
			path="/players/:player_name"
			render={() => (
				<PlayerPage />
			)}
		/>
        <Route exact
			path="/teams"
			render={() => (
				<TeamsPage />
			)}
		/>
		<Route
			path="/teams/:team_name"
			render={() => (
				<TeamPage />
			)}
		/>
		<Route exact
			path="/luck"
			render={() => (
				<LuckPage />
			)}
		/>
		<Route exact
			path="/clutch"
			render={() => (
				<ClutchPage />
			)}
		/>
      </Switch>
    </Router>
  </div>,
  document.getElementById('root')
);

