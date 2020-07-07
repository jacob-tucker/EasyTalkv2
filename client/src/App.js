import React from 'react';
import { Router, Route, Switch } from 'react-router-dom'

import ChatRoom from './components/ChatRoom/ChatRoom'
import Intro from './components/Intro/Intro'

import './App.css';
import { createBrowserHistory } from 'history';
export const appHistory = createBrowserHistory()

const App = () => (
    <Router history={appHistory}>
      <Switch>
        <Route exact path="/" component={Intro} />
        <Route path="/ChatRoom" component={ChatRoom} />
      </Switch>
    </Router>
)

export default App;
