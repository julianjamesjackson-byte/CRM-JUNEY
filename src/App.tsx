
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardView } from './components/dashboard/DashboardView';
import { FacilitiesView } from './views/FacilitiesView';
import { CandidatesView } from './views/CandidatesView';
import { PipelineView } from './views/PipelineView';
import { PairingView } from './views/PairingView';
import { PartnersView } from './views/PartnersView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardView />} />
          <Route path="facilities" element={<FacilitiesView />} />
          <Route path="candidates" element={<CandidatesView />} />
          <Route path="pipeline" element={<PipelineView />} />
          <Route path="pairing" element={<PairingView />} />
          <Route path="partners" element={<PartnersView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
