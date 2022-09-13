import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import EnslaverVoyageConnections from './components/EnslaverVoyageConnections';
import { EnslaverContribution } from './models/EnslaverContribution';

function App() {
  const [contrib, setContrib] = useState<EnslaverContribution|null>(null);
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Demo page
        </p>
        if (contrib !== null) {
          <EnslaverVoyageConnections contribution={contrib!} onUpdate={setContrib} />
        }
      </header>
    </div>
  );
}

export default App;
