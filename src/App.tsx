import React, { useEffect, useState } from 'react';
import './App.css';
import EnslaverVoyageConnections from './components/EnslaverVoyageConnections';
import { EnslaverContribution, EnslaverContributionType } from './models/EnslaverContribution';
import { MockServiceContext } from './tests/Mocks'
import { ServiceContext } from './services/ServiceContext';

const serviceContext = MockServiceContext;
const AppServiceContext = React.createContext<ServiceContext>(MockServiceContext);

function App() {
  const [contrib, setContrib] = useState<EnslaverContribution|null>(null);
  useEffect(
    () => {
      serviceContext.enslaversService
        .createContribution(1, EnslaverContributionType.Edit)
        .then(c => setContrib(c));
    },
    [contrib]);
  return (
    <div className="App">
      <AppServiceContext.Provider value={serviceContext}>
        {contrib !== null && <EnslaverVoyageConnections contribution={contrib} onUpdate={setContrib} />}
      </AppServiceContext.Provider>
    </div>
  );
}

export default App;
