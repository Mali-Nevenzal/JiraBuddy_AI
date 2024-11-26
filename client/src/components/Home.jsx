import React, { useState } from 'react';
import InputForm from './InputForm';
import './Home.css';

const Home = () => {
    const [showInputForm, setShowInputForm] = useState(false);

    const toggleInputForm = () => {
        setShowInputForm(!showInputForm);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <div className="header-container">
                <div className="logos-container">
                    <img className="logo" src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg" alt="Gemini Logo" />
                    <img className="logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Jira_Logo.svg/2560px-Jira_Logo.svg.png" alt="Jira Logo" />
                </div>
                <div style={{ alignItems: 'center', justifyContent: 'center', width: '100%', paddingRight: '12%' }}>
                    <div className="project-name">Jira Buddy - AI</div>
                    <h3 className="project-description">Let AI split the tasks, then you can add them to Jira with a single click!</h3>
                </div>
            </div>

            {!showInputForm && <button onClick={toggleInputForm}>Get Started</button>}

            {showInputForm && <InputForm className="input-form" />}
        </div>
    );
};

export default Home;
