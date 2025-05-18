import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import CampaignsPage from './pages/CampaignsPage';
import SocialMediaPage from './pages/SocialMediaPage';
import VideosPage from './pages/VideosPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/social-media" element={<SocialMediaPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

