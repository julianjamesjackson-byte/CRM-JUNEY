import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardView } from './components/dashboard/DashboardView';
import { FacilitiesView } from './views/FacilitiesView';
import { CandidatesView } from './views/CandidatesView';
import { PipelineView } from './views/PipelineView';
import { PairingView } from './views/PairingView';
import { PartnersView } from './views/PartnersView';
import { LoginView } from './views/LoginView';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginView />} />

        {/* Protected Routes (The VIP Section) */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
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
