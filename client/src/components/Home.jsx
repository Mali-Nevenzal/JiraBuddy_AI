import React, { useState } from 'react';
import InputForm from './InputForm';

const Home = () => {
  const [showInputForm, setShowInputForm] = useState(false);  // State to control InputForm visibility
//   const [showButton, setShowButton] = useState(true);
  const toggleInputForm = () => {
    setShowInputForm(!showInputForm);  // Toggle the state to show/hide InputForm
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}>
      <div>Jira Buddy - AI</div>
      <h3>Let AI split the tasks, then you can add them to Jira with a single click!</h3>
      {/* Button to toggle InputForm */}
      {!showInputForm && <button onClick={toggleInputForm}>Get Started</button>}
      {/* Conditionally render the InputForm */}
      {showInputForm && <InputForm />}
    </div>
  );
};

export default Home;
