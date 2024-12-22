import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import LandingPage from './components/LandingPage';

const App = () => {
    return (
        <Auth0Provider
            domain={process.env?.REACT_APP_DOMAIN || ''}
            clientId={process.env?.REACT_APP_CLIENTID || ''}
            redirectUri={window.location.origin}
        >
            <Router>
                <Switch>
                    <Route path="/" component={LandingPage} />
                </Switch>
            </Router>
        </Auth0Provider>
    );
};

export default App;