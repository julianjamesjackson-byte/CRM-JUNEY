
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardView } from './components/dashboard/DashboardView';
import { FacilitiesView } from './views/FacilitiesView';
import { CandidatesView } from './views/CandidatesView';
import { PipelineView } from './views/PipelineView';

// Placeholder views for routes not yet implemented
const PlaceholderView = ({ title }: { title: string }) => (
  <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center h-full text-slate-500">
    <h1 className="text-3xl font-bold text-slate-900 mb-4">{title}</h1>
    <p>This module is coming in the next step.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardView />} />
          <Route path="facilities" element={<FacilitiesView />} />
          <Route path="candidates" element={<CandidatesView />} />
          <Route path="pipeline" element={<PipelineView />} />
          <Route path="partners" element={<PlaceholderView title="Recruiting Partners" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
