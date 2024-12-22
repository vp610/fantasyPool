import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Welcome to Our Application</h1>
            <p>Please choose an option below:</p>
            <div>
                <Link to="/login">
                    <button style={{ margin: '10px', padding: '10px 20px' }}>Log In</button>
                </Link>
                <Link to="/register">
                    <button style={{ margin: '10px', padding: '10px 20px' }}>Register</button>
                </Link>
            </div>
        </div>
    );
};

export default LandingPage;