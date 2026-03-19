import React, { useState, useEffect } from 'react';
import { RequestService } from '../services/RequestService';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Radio, 
  Activity, 
  MessageSquare, 
  ShieldAlert, 
  Filter 
} from 'lucide-react';

export const ApproverDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [isLiveEnabled, setIsLiveEnabled] = useState(false);
    const [error, setError] = useState(null);
    const [selectedTab, setSelectedTab] = useState('PENDING'); // PENDING, APPROVED, REJECTED
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [currentRequestId, setCurrentRequestId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        let stream = null;
        if (isLiveEnabled) {
            stream = RequestService.streamRequests((newReq) => {
                setRequests(prev => [newReq, ...prev]);
            });
        }
        return () => stream?.close();
    }, [isLiveEnabled]);

    const fetchRequests = async () => {
        try {
            const data = await RequestService.getRequests();
            setRequests(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleApprove = async (id) => {
        try {
            await RequestService.approveRequest(id);
            fetchRequests(); // Refresh table
        } catch (err) { alert(err.message); }
    };

    const handleRejectClick = (id) => {
        setCurrentRequestId(id);
        setShowRejectionModal(true);
    };

    const handleConfirmReject = async () => {
        if (!rejectionReason) {
            alert('Rejection reason is required.');
            return;
        }
        try {
            await RequestService.rejectRequest(currentRequestId, rejectionReason);
            setShowRejectionModal(false);
            setRejectionReason('');
            fetchRequests();
        } catch (err) { alert(err.message); }
    };

    const filteredRequests = requests.filter(r => r.status === selectedTab || (selectedTab === 'PENDING' && !r.status));

    return (
        <div className="dashboard-container" style={{ padding: '2rem' }}>
            <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Approver Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage and review access requests for your catalogs</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
                        <span style={{ fontSize: '0.875rem' }}>Live Feed</span>
                        <input 
                            type="checkbox" 
                            checked={isLiveEnabled} 
                            onChange={(e) => setIsLiveEnabled(e.target.checked)} 
                            style={{ cursor: 'pointer' }}
                        />
                         {isLiveEnabled && <Radio size={14} color="var(--error)" className="pulse" />}
                     </div>
                     <button className="primary" onClick={fetchRequests} style={{ padding: '0.5rem 1rem' }}>
                        <Activity size={16} style={{ marginRight: '0.5rem' }} /> Refresh
                     </button>
                </div>
            </div>

            <div className="dashboard-tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
                {['PENDING', 'APPROVED', 'REJECTED'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'none',
                            border: 'none',
                            color: selectedTab === tab ? 'white' : 'var(--text-muted)',
                            borderBottom: selectedTab === tab ? '2px solid var(--primary)' : 'none',
                            cursor: 'pointer',
                            fontWeight: selectedTab === tab ? 'bold' : 'normal',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="glass table-container" style={{ padding: '1rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ color: 'var(--text-muted)', fontSize: '0.875rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '1rem' }}>Principal</th>
                            <th style={{ padding: '1rem' }}>Resource</th>
                            <th style={{ padding: '1rem' }}>Permission</th>
                            <th style={{ padding: '1rem' }}>Justification</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.map(req => (
                            <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="table-row">
                                <td style={{ padding: '1rem' }}>{req.principalId}</td>
                                <td style={{ padding: '1rem' }}>{req.resourcePath}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span className="badge glass" style={{ padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', background: 'rgba(52, 191, 191, 0.1)' }}>
                                        {req.permission}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', maxWidth: '300px' }}>
                                    <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {req.justification}
                                    </p>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {selectedTab === 'PENDING' ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button 
                                                onClick={() => handleApprove(req.id)}
                                                className="primary" 
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                                title="Approve access"
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleRejectClick(req.id)}
                                                style={{ padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--error)', color: '#ef4444', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                                title="Reject access"
                                            >
                                                <XCircle size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7 }}>
                                            {selectedTab === 'APPROVED' ? <CheckCircle2 size={14} color="var(--success)" /> : <XCircle size={14} color="var(--error)" />}
                                            <span style={{ fontSize: '0.75rem' }}>{req.status}</span>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredRequests.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', opacity: 0.3 }}>
                                    <Clock size={48} style={{ marginBottom: '1rem' }} />
                                    <p>No {selectedTab.toLowerCase()} requests found.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Rejection Modal */}
            {showRejectionModal && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="glass modal-content" style={{ padding: '2rem', width: '400px', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3>Confirm Rejection</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Provide a reason for rejecting this request.</p>
                        <textarea 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g., Access not required for your role."
                            style={{ width: '100%', height: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem', borderRadius: '4px', marginBottom: '1.5rem', resize: 'none' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button onClick={() => setShowRejectionModal(false)} style={{ background: 'none', color: 'white', border: 'none', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleConfirmReject} className="primary" style={{ padding: '0.5rem 1.5rem' }}>Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
