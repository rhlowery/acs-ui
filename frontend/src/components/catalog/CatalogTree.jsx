import React, { useState, useEffect } from 'react';
import { 
  Database, 
  FolderIcon, 
  TableIcon, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  LockIcon,
  MoreVertical
} from 'lucide-react';
import { CatalogService } from '../../services/CatalogService';

const TreeNode = ({ node, catalogId, level = 0, onSelect, onRightClick, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleOpen = async (e) => {
    e.stopPropagation();
    if (!isOpen && children.length === 0) {
      setLoading(true);
      try {
        const data = await CatalogService.getNodes(catalogId || node.id, node.path);
        setChildren(data || []);
      } catch (err) {
        console.error('Failed to load children', err);
      } finally {
        setLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    onRightClick(e, node);
  };

  const nodeIcon = node.type === 'catalog' ? <Database size={16} /> : 
                   node.type === 'schema' ? <FolderIcon size={16} /> : 
                   <TableIcon size={16} />;

  const permissionIcon = node.access === 'SELECT' ? 
                         <CheckCircle2 size={14} color="var(--success)" /> : 
                         <LockIcon size={14} color="var(--text-muted)" />;

  return (
    <div className="tree-node-container" style={{ marginLeft: `${level * 16}px` }}>
      <div 
        className={`tree-node ${isOpen ? 'open' : ''}`}
        onClick={() => onSelect(node)}
        onContextMenu={handleContextMenu}
      >
        <span className="expand-icon" onClick={toggleOpen}>
          {node.type !== 'table' && (
            loading ? <div className="spinner-mini" /> : (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)
          )}
        </span>
        <input 
          type="checkbox" 
          checked={node.isSelected || false}
          onChange={(e) => {
            e.stopPropagation();
            onToggle(node);
          }}
          className="node-checkbox"
          style={{ marginRight: '8px', cursor: 'pointer' }}
        />
        <span className="node-icon">{nodeIcon}</span>
        <span className="node-label">{node.name}</span>
        <span className="node-meta" style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          {permissionIcon}
        </span>
      </div>
      
      {isOpen && (
        <div className="tree-children">
          {children.map(child => (
            <TreeNode 
              key={`${child.path}-${child.name}`} 
              node={child} 
              catalogId={catalogId || node.id} 
              level={level + 1} 
              onSelect={onSelect}
              onRightClick={onRightClick}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CatalogTree = ({ onSelect, onRightClick, onToggle }) => {
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const data = await CatalogService.getRegistrations();
        const mapped = data.map(c => ({
          id: c.id,
          name: c.name,
          type: 'catalog',
          path: '/',
          access: c.access || 'NONE'
        }));
        setCatalogs(mapped);
      } catch (err) {
        console.error('Failed to load catalogs', err);
      } finally {
        setLoading(false);
      }
    };
    loadCatalogs();
  }, []);

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="catalog-tree glass">
      <div className="tree-header">
        <h3>Unity Catalog</h3>
      </div>
      <div className="tree-content">
        {catalogs.map(catalog => (
          <TreeNode 
            key={catalog.id} 
            node={catalog} 
            level={0} 
            onSelect={onSelect}
            onRightClick={onRightClick}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
};
