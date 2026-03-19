import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Database, 
  ExternalLink, 
  Save,
  Activity
} from 'lucide-react';

export const SettingsPage = () => {
    const [darkMode, setDarkMode] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [streamEnabled, setStreamEnabled] = useState(true);

    const handleSave = () => {
        alert('Settings saved successfully!');
    };

    return (
        <div className="settings-page" style={{ padding: '2rem', maxWidth: '800px' }}>
            <div className="settings-header" style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ marginBottom: '0.5rem' }}>System Settings</h1>
                <p style={{ color: 'var(--text-muted)' }}>Configure your environment and personal preferences</p>
            </div>

            <div className="settings-sections" style={{ display: 'grid', gap: '2rem' }}>
                <section className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <User size={20} color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>Profile Information</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', opacity: 0.7 }}>Display Name</label>
                            <input type="text" defaultValue="Admin User" style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', opacity: 0.7 }}>Email Address</label>
                            <input type="email" defaultValue="admin@acs.local" style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px' }} />
                        </div>
                    </div>
                </section>

                <section className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Shield size={20} color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>System Preferences</h3>
                    </div>
                    
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h4 style={{ margin: 0 }}>Appearance</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>Switch between dark and light themes</p>
                            </div>
                            <button 
                                onClick={() => setDarkMode(!darkMode)}
                                style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                                {darkMode ? 'Dark' : 'Light'}
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h4 style={{ margin: 0 }}>Real-time Streaming</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>Enable or disable live log streams globally</p>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={streamEnabled} 
                                onChange={(e) => setStreamEnabled(e.target.checked)} 
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h4 style={{ margin: 0 }}>System Notifications</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>Alert me for new access requests and security events</p>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={notifications} 
                                onChange={(e) => setNotifications(e.target.checked)} 
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                </section>

                <section className="glass" style={{ padding: '1rem 2rem', borderLeft: '4px solid var(--primary)', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                             <Bell size={20} className="pulse" color="var(--primary)" />
                             <span style={{ fontSize: '0.875rem' }}>New version (v1.2.4) available. Review what's new in the release docs.</span>
                        </div>
                        <ExternalLink size={16} style={{ cursor: 'pointer' }} />
                    </div>
                </section>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button className="primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
