import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Database, 
  Shield, 
  Activity, 
  Settings, 
  LogOut, 
  Search, 
  Plus, 
  Bell, 
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { CatalogPage } from './pages/CatalogPage';
import { ApproverDashboard } from './pages/ApproverDashboard';
import { ReviewerDashboard } from './pages/ReviewerDashboard';
import { SettingsPage } from './pages/SettingsPage';
import { AuthService } from './services/AuthService';

const Sidebar = ({ activeTab, setActiveTab }) => (
  <div className="sidebar">
    <div className="brand">
      <Shield size={32} />
      <span>ACS UI</span>
    </div>
    <div className="nav">
      <a href="#" className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
        <Activity size={20} />
        Dashboard
      </a>
      <a href="#" className={`nav-link ${activeTab === 'access-requests' ? 'active' : ''}`} onClick={() => setActiveTab('access-requests')}>
        <Clock size={20} />
        Access Requests
      </a>
      <a href="#" className={`nav-link ${activeTab === 'catalog' ? 'active' : ''}`} onClick={() => setActiveTab('catalog')}>
        <Database size={20} />
        Data Catalog
      </a>
      {AuthService.hasRole('APPROVER') && (
        <a href="#" className={`nav-link ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
          <CheckCircle2 size={20} />
          Approvals
        </a>
      )}
      {AuthService.hasRole('AUDITOR') && (
        <a href="#" className={`nav-link ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
          <Activity size={20} />
          Audit Logs
        </a>
      )}
    </div>
    <div className="spacer" style={{ flex: 1 }}></div>
    <div className="nav">
      <a href="#" className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
        <Settings size={20} />
        Settings
      </a>
      <a href="#" className="nav-link" style={{ color: 'var(--danger)' }}>
        <LogOut size={20} />
        Logout
      </a>
    </div>
  </div>
);

const Header = ({ username }) => (
  <div className="header">
    <div className="search-bar glass" style={{ border: 'none', background: 'var(--glass-bg)', padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '50px', width: '380px' }}>
      <Search size={18} color="var(--text-muted)" />
      <input type="text" placeholder="Search resources, requests..." style={{ background: 'transparent', border: 'none', color: 'var(--text)', width: '100%', outline: 'none' }} />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <Bell size={20} className="hover-pulse" style={{ cursor: 'pointer' }} />
      <div className="user-profile glass">
        <div className="avatar">{username?.charAt(0) || 'U'}</div>
        <span style={{ fontWeight: 500 }}>{username || 'Anonymous User'}</span>
      </div>
    </div>
  </div>
);

const Dashboard = ({ stats, requests }) => (
  <div className="dashboard">
    <div className="stat-group">
      <div className="stat-card glass">
        <span className="stat-label">Total Requests</span>
        <span className="stat-value">{stats.total}</span>
      </div>
      <div className="stat-card glass" style={{ borderLeftColor: 'var(--warning)' }}>
        <span className="stat-label">Pending Approval</span>
        <span className="stat-value">{stats.pending}</span>
      </div>
      <div className="stat-card glass" style={{ borderLeftColor: 'var(--success)' }}>
        <span className="stat-label">Active Permissions</span>
        <span className="stat-value">{stats.active}</span>
      </div>
    </div>

    <h2 style={{ marginBottom: '1.5rem' }}>Recent Access Requests</h2>
    <div className="card-grid">
      {requests.map(req => (
        <div key={req.id} className="card glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span className={`badge badge-${req.status === 'APPROVED' ? 'success' : req.status === 'PENDING' ? 'warning' : 'danger'}`}>
              {req.status}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(req.createdAt).toLocaleDateString()}</span>
          </div>
          <h3 style={{ marginBottom: '0.25rem' }}>{req.catalogName || 'Unknown Table'}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>Requested by {req.requesterId}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
             <span>{req.privileges?.join(', ') || 'No privileges'}</span>
             <button className="secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>View Details</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const EmptyState = ({ title, icon: Icon }) => (
  <div className="glass" style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flex: 1 }}>
    <Icon size={64} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
    <h2 style={{ marginBottom: '0.5rem' }}>{title}</h2>
    <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>This section is currently under development. Please check back later for updates.</p>
    <button style={{ marginTop: '2rem' }}>Go Home</button>
  </div>
)

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch('/api/auth/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }

        const reqRes = await fetch('/api/storage/requests');
        if (reqRes.ok) {
          const reqData = await reqRes.json();
          setRequests(reqData || []);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    active: requests.filter(r => r.status === 'APPROVED').length
  };

  return (
    <div className="layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Header username={user?.userId || user?.name || (user?.email?.split('@')[0])} />
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <Activity size={48} color="var(--primary)" className="spin" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard stats={stats} requests={requests.slice(0, 3)} />}
            {activeTab === 'access-requests' && <Dashboard stats={stats} requests={requests} />}
            {activeTab === 'catalog' && <CatalogPage />}
            {activeTab === 'approvals' && <ApproverDashboard />}
            {activeTab === 'audit' && <ReviewerDashboard />}
            {activeTab === 'settings' && <SettingsPage />}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
