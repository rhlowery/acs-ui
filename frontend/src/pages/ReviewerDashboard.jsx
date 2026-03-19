import React, { useState, useEffect } from 'react';
import { AuditService } from '../services/AuditService';
import { RequestService } from '../services/RequestService';
import { CatalogService } from '../services/CatalogService';
import { 
  History, 
  Search, 
  Filter, 
  RefreshCcw, 
  CheckCircle2, 
  Activity, 
  Database,
  ShieldCheck,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export const ReviewerDashboard = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [requests, setRequests] = useState([]);
    const [isLiveEnabled, setIsLiveEnabled] = useState(false);
    const [selectedTab, setSelectedTab] = useState('AUDIT_LOG'); // AUDIT_LOG, REQUESTS, INTEGRITY
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (selectedTab === 'AUDIT_LOG') fetchAuditLogs();
        if (selectedTab === 'REQUESTS') fetchRequests();
    }, [selectedTab]);

    useEffect(() => {
        let stream = null;
        if (isLiveEnabled) {
            if (selectedTab === 'AUDIT_LOG') {
                stream = AuditService.streamLogs((newLog) => {
                    setAuditLogs(prev => [newLog, ...prev]);
                });
            } else if (selectedTab === 'REQUESTS') {
                stream = RequestService.streamRequests((updatedReq) => {
                    setRequests(prev => {
                        const index = prev.findIndex(r => r.id === updatedReq.id);
                        if (index !== -1) {
                            const newRequests = [...prev];
                            newRequests[index] = { ...newRequests[index], ...updatedReq };
                            return newRequests;
                        }
                        return [updatedReq, ...prev];
                    });
                });
            }
        }
        return () => stream?.close();
    }, [isLiveEnabled, selectedTab]);

    const fetchAuditLogs = async () => {
        setIsLoading(true);
        try {
            const data = await AuditService.getLogs();
            setAuditLogs(Array.isArray(data) ? data : []);
        } finally { setIsLoading(false); }
    };

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const data = await RequestService.getRequests();
            setRequests(data);
        } finally { setIsLoading(false); }
    };

    const handleVerify = async (id) => {
        try {
            await RequestService.verifyRequest(id);
            alert(`Request ${id} verified and audit entry created.`);
            fetchRequests();
        } catch (err) { alert(err.message); }
    };

    return (
        <div className="dashboard-container" style={{ padding: '2rem' }}>
            <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Reviewer & Auditor Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Audit trails, request verification, and compliance monitoring</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
                        <span style={{ fontSize: '0.875rem' }}>Live Stream</span>
                        <input 
                            type="checkbox" 
                            checked={isLiveEnabled} 
                            onChange={(e) => setIsLiveEnabled(e.target.checked)} 
                            style={{ cursor: 'pointer' }}
                        />
                         {isLiveEnabled && <Activity size={14} color="var(--success)" className="pulse" />}
                     </div>
                     <button className="primary" onClick={selectedTab === 'AUDIT_LOG' ? fetchAuditLogs : fetchRequests}>
                        <RefreshCcw size={16} style={{ marginRight: '0.5rem' }} /> Refresh
                     </button>
                </div>
            </div>

            <div className="dashboard-tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
                {[
                    { id: 'AUDIT_LOG', label: 'Audit Log', icon: History },
                    { id: 'REQUESTS', label: 'Access Requests', icon: TrendingUp },
                    { id: 'INTEGRITY', label: 'Resource Integrity', icon: ShieldCheck }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'none',
                            border: 'none',
                            color: selectedTab === tab.id ? 'white' : 'var(--text-muted)',
                            borderBottom: selectedTab === tab.id ? '2px solid var(--primary)' : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: selectedTab === tab.id ? 'bold' : 'normal'
                        }}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="glass table-container" style={{ padding: '1rem', overflowX: 'auto', minHeight: '400px' }}>
                {selectedTab === 'AUDIT_LOG' && (
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-muted)', fontSize: '0.875rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '1rem' }}>Timestamp</th>
                                <th style={{ padding: '1rem' }}>Principal</th>
                                <th style={{ padding: '1rem' }}>Action</th>
                                <th style={{ padding: '1rem' }}>Resource</th>
                                <th style={{ padding: '1rem' }}>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.map((log, idx) => (
                                <tr key={log.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td style={{ padding: '1rem' }}>{log.principalId}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className="badge" style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)' }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{log.resourcePath}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {log.result === 'SUCCESS' ? 
                                            <CheckCircle2 size={16} color="var(--success)" /> : 
                                            <AlertTriangle size={16} color="var(--error)" />
                                        }
                                    </td>
                                </tr>
                            ))}
                            {auditLogs.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', opacity: 0.3 }}>
                                        <History size={48} style={{ marginBottom: '1rem' }} />
                                        <p>No audit logs available.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {selectedTab === 'REQUESTS' && (
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-muted)', fontSize: '0.875rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '1rem' }}>ID</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}>Resource</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{req.id}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ color: req.status === 'APPROVED' ? 'var(--success)' : 'var(--text-muted)' }}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{req.resourcePath}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <button onClick={() => handleVerify(req.id)} style={{ padding: '0.4rem 0.8rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                                            Verify Integrity
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {selectedTab === 'INTEGRITY' && (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <Database size={64} style={{ opacity: 0.1, marginBottom: '2rem' }} />
                        <h3>Catalog Integrity Checker</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Select a catalog resource from the tree to perform a deep-scan verification.</p>
                        <p style={{ fontSize: '0.875rem', marginTop: '1rem' }}>Feature coming soon: Automated Policy Drift Detection</p>
                    </div>
                )}
            </div>
        </div>
    );
};
