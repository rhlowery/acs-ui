import React, { useState } from 'react';
import { X, Shield, Calendar, AlignLeft, User } from 'lucide-react';
import { RequestService } from '../../services/RequestService';
import { AuthService } from '../../services/AuthService';

export const AccessRequestForm = ({ node, onClose, onSuccess }) => {
    const currentUser = AuthService.getCurrentUser();
    const [principalId, setPrincipalId] = useState(currentUser?.userId || '');
    const [privileges, setPrivileges] = useState([]);
    const [justification, setJustification] = useState('');
    const [expiration, setExpiration] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availablePrivileges = ['SELECT', 'UPDATE', 'INSERT', 'DELETE', 'CREATE', 'DROP', 'USE_CATALOG', 'USE_SCHEMA'];

    const togglePrivilege = (priv) => {
        setPrivileges(prev => 
            prev.includes(priv) ? prev.filter(p => p !== priv) : [...prev, priv]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (privileges.length === 0) {
            window.alert('Please select at least one privilege.');
            return;
        }
        if (!justification.trim()) {
            window.alert('Please provide a justification.');
            return;
        }

        setIsSubmitting(true);
        try {
            const request = {
                requesterId: currentUser?.userId || 'guest',
                userId: principalId,
                resourceType: node.type.toUpperCase(),
                resourcePath: node.path === '/' ? node.name : `${node.path}/${node.name}`,
                privileges,
                justification,
                expirationTime: expiration ? new Date(expiration).toISOString() : null,
                status: 'PENDING',
                createdAt: new Date().toISOString()
            };
            await RequestService.submitRequest(request);
            window.alert('Access request submitted successfully!');
            onSuccess?.();
            onClose();
        } catch (err) {
            window.alert(`Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Shield size={24} color="var(--primary)" />
                        <h2 style={{ margin: 0 }}>Request Access</h2>
                    </div>
                    <X size={24} onClick={onClose} style={{ cursor: 'pointer', opacity: 0.5 }} />
                </div>

                <form onSubmit={handleSubmit} aria-label="access-request-form">
                    <div className="form-group">
                        <label htmlFor="principalId"><User size={14} style={{ marginRight: '4px' }} /> Principal (User ID)</label>
                        <input 
                            id="principalId"
                            type="text" 
                            value={principalId} 
                            onChange={e => setPrincipalId(e.target.value)} 
                            placeholder="e.g., user_123"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="resourcePath">Resource Path</label>
                        <input id="resourcePath" type="text" value={node.path === '/' ? node.name : `${node.path}/${node.name}`} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                    </div>

                    <div className="form-group">
                        <label>Privileges</label>
                        <div className="privilege-selector">
                            {availablePrivileges.map(priv => (
                                <label key={priv} className="privilege-item">
                                    <input 
                                        type="checkbox" 
                                        checked={privileges.includes(priv)}
                                        onChange={() => togglePrivilege(priv)}
                                    />
                                    {priv}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="expiration"><Calendar size={14} style={{ marginRight: '4px' }} /> Expiration (Optional)</label>
                        <input 
                            id="expiration"
                            type="datetime-local" 
                            value={expiration} 
                            onChange={e => setExpiration(e.target.value)} 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="justification"><AlignLeft size={14} style={{ marginRight: '4px' }} /> Justification</label>
                        <textarea 
                            id="justification"
                            rows="3" 
                            value={justification} 
                            onChange={e => setJustification(e.target.value)} 
                            placeholder="Why do you need this access?"
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" className="secondary" onClick={onClose} style={{ flex: 1 }}>
                            Cancel
                        </button>
                        <button type="submit" className="primary" disabled={isSubmitting} style={{ flex: 1 }}>
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
