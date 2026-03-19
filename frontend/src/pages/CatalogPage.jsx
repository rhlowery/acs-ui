import React, { useState } from 'react';
import { Database, ChevronRight, CheckCircle2, Shield, Info, Terminal } from 'lucide-react';
import { CatalogTree } from '../components/catalog/CatalogTree';
import { AccessForm } from '../components/access-form/AccessForm';

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
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [showTerminal, setShowTerminal] = useState(false);

  const handleSelect = (node) => {
    setSelectedNode(node);
    const newPath = (node.path || '').split('/').filter(p => p);
    if (node.type !== 'catalog') {
      setBreadcrumbPath(['main', ...newPath]);
    } else {
      setBreadcrumbPath([node.name]);
    }
  };

  const handleToggle = (node) => {
    setSelectedObjects(prev => {
        const isSelected = prev.find(obj => obj.id === node.id || (obj.path === node.path && obj.name === node.name));
        if (isSelected) {
            return prev.filter(obj => obj.id !== node.id && !(obj.path === node.path && obj.name === node.name));
        }
        return [...prev, node];
    });
    if (!showTerminal) setShowTerminal(true);
  };

  const handleRightClick = (e, node) => {
    console.log('Right click on', node);
    // Shortcut for "Request Access For Me"
    if (!selectedObjects.find(o => o.name === node.name)) {
        setSelectedObjects(prev => [...prev, node]);
    }
    setShowTerminal(true);
  };

  return (
    <div className="catalog-page" style={{ display: 'flex', gap: '1rem', height: '100%', overflow: 'hidden' }}>
      <div className="catalog-sidebar" style={{ width: '280px', flexShrink: 0, overflowY: 'auto' }}>
        <CatalogTree onSelect={handleSelect} onRightClick={handleRightClick} onToggle={handleToggle} />
      </div>

      <div className="catalog-main" style={{ flex: 1, overflowY: 'auto', paddingRight: showTerminal ? '0' : '1rem' }}>
        <Breadcrumbs path={breadcrumbPath} />
        
        {selectedNode ? (
          <div className="details-view glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
               <Database size={32} color="var(--primary)" />
               <div>
                 <h1 style={{ margin: 0 }}>{selectedNode.name}</h1>
                 <p style={{ color: 'var(--text-muted)' }}>{selectedNode.type.toUpperCase()} • {selectedNode.path || '/'}</p>
               </div>
               <div style={{ marginLeft: 'auto' }}>
                 <button className="primary" onClick={() => handleToggle(selectedNode)}>
                   {selectedObjects.find(o => o.name === selectedNode.name) ? 'Remove from Request' : 'Add to Request'}
                 </button>
               </div>
            </div>

            <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', display: 'grid', gap: '1rem' }}>
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
          <div className="glass" style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', margin: '2rem' }}>
            <Database size={64} style={{ opacity: 0.1, marginBottom: '2rem' }} />
            <h2>Select a resource to browse</h2>
            <p style={{ color: 'var(--text-muted)' }}>Use the catalog tree on the left to navigate through schemas and tables.</p>
          </div>
        )}
      </div>

      {showTerminal && (
          <div className="provisioning-panel glass" style={{ width: '450px', flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <button onClick={() => setShowTerminal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <ChevronRight size={20} />
                  </button>
              </div>
              <AccessForm 
                selectedObjects={selectedObjects} 
                onClearSelection={() => setSelectedObjects([])}
                onSubmit={() => {}}
              />
          </div>
      )}
    </div>
  );
};
