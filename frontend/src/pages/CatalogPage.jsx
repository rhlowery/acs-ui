import React, { useState } from 'react';
import { Database, ChevronRight, CheckCircle2, Shield, Info } from 'lucide-react';
import { CatalogTree } from '../components/catalog/CatalogTree';
import { AccessRequestForm } from '../components/requests/AccessRequestForm';

const Breadcrumbs = ({ path }) => {
  const parts = ['Catalog', ...path.filter(p => p)];
  return (
    <div className="breadcrumbs">
      {parts.map((part, index) => (
        <React.Fragment key={`${part}-${index}`}>
          <span className="breadcrumb-item">{part}</span>
          {index < parts.length - 1 && <ChevronRight size={14} className="breadcrumb-separator" />}
        </React.Fragment>
      ))}
    </div>
  );
};

export const CatalogPage = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);
  const [showRequestForm, setShowRequestForm] = useState(false);

  const handleSelect = (node) => {
    setSelectedNode(node);
    // Construct breadcrumb path (simplified for this demonstration)
    const newPath = node.path.split('/').filter(p => p);
    if (node.type !== 'catalog') {
      // Catalog ID would normally be the first part
      setBreadcrumbPath(['main', ...newPath]);
    } else {
      setBreadcrumbPath([node.name]);
    }
  };

  const handleRightClick = (e, node) => {
    // Context menu logic could go here
    console.log('Right click on', node);
  };

  return (
    <div className="catalog-page" style={{ display: 'flex', gap: '2rem', height: '100%' }}>
      <div className="catalog-sidebar" style={{ width: '300px', flexShrink: 0 }}>
        <CatalogTree onSelect={handleSelect} onRightClick={handleRightClick} />
      </div>

      <div className="catalog-main" style={{ flex: 1 }}>
        <Breadcrumbs path={breadcrumbPath} />
        
        {selectedNode ? (
          <div className="details-view glass" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
               <Database size={32} color="var(--primary)" />
               <div>
                 <h1 style={{ margin: 0 }}>{selectedNode.name}</h1>
                 <p style={{ color: 'var(--text-muted)' }}>{selectedNode.type.toUpperCase()} • {selectedNode.path || '/'}</p>
               </div>
               <div style={{ marginLeft: 'auto' }}>
                 <button className="primary" onClick={() => setShowRequestForm(true)}>
                   Request Access
                 </button>
               </div>
            </div>

            <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="card glass">
                <Shield size={20} style={{ marginBottom: '0.5rem' }} />
                <h3>Permissions</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedNode.access === 'SELECT' ? (
                    <><CheckCircle2 size={16} color="var(--success)" /> <span>You have SELECT access</span></>
                  ) : (
                    <><Info size={16} color="var(--text-muted)" /> <span>Access required</span></>
                  )}
                </div>
              </div>
              <div className="card glass">
                <Info size={20} style={{ marginBottom: '0.5rem' }} />
                <h3>Metadata</h3>
                <p style={{ fontSize: '0.875rem' }}>Owner: data-admin</p>
                <p style={{ fontSize: '0.875rem' }}>Updated: 2 days ago</p>
              </div>
            </div>

            {selectedNode.type === 'table' && (
              <div style={{ marginTop: '2rem' }}>
                <h3>Preview (Mock)</h3>
                <div className="glass" style={{ padding: '1rem', overflowX: 'auto' }}>
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ padding: '0.5rem' }}>Column</th>
                        <th style={{ padding: '0.5rem' }}>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ padding: '0.5rem' }}>id</td><td style={{ padding: '0.5rem' }}>STRING</td></tr>
                      <tr><td style={{ padding: '0.5rem' }}>created_at</td><td style={{ padding: '0.5rem' }}>TIMESTAMP</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass" style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flex: 1 }}>
            <Database size={64} style={{ opacity: 0.1, marginBottom: '2rem' }} />
            <h3>No Resource Selected</h3>
            <p style={{ color: 'var(--text-muted)' }}>Explore the Unity Catalog tree and select a resource to view details and request access.</p>
          </div>
        )}

        {showRequestForm && selectedNode && (
          <AccessRequestForm 
            node={selectedNode} 
            onClose={() => setShowRequestForm(false)} 
            onSuccess={() => {
              // Optionally refresh or show success banner
            }}
          />
        )}
      </div>
    </div>
  );
};
