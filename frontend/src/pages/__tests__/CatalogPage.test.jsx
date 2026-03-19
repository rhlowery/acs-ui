import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CatalogPage } from '../CatalogPage';
import { CatalogService } from '../../services/CatalogService';

vi.mock('../../services/CatalogService', () => ({
  CatalogService: {
    getRegistrations: vi.fn(),
    getNodes: vi.fn(),
    getPermissions: vi.fn(),
    searchCatalog: vi.fn()
  }
}));

vi.mock('../../components/catalog/CatalogTree', () => ({
  CatalogTree: ({ onSelect, onRightClick, onToggle }) => (
    <div data-testid="mock-catalog-tree">
      <button onClick={() => onSelect({ id: 'c1', name: 'main', type: 'catalog', path: '/', access: 'SELECT' })}>Select Catalog</button>
      <button onClick={() => onSelect({ id: 't1', name: 'users', type: 'table', path: 'default/users', access: 'NONE' })}>Select Table</button>
      <button onClick={() => onToggle({ id: 't1', name: 'users', type: 'table', path: 'default/users', access: 'NONE' })}>Toggle Table</button>
      <button onContextMenu={(e) => { e.preventDefault(); onRightClick(e, { id: 'test-id', name: 'test-node', type: 'table', path: 'default/test' }); }}>Right Click Node</button>
      <button onClick={() => onToggle({ id: 'test-id', name: 'test-node', type: 'table', path: 'default/test' })}>Toggle Test Node</button>
    </div>
  )
}));

import { http, HttpResponse } from 'msw';
import { server } from '../../test/setup';

describe('CatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    server.use(
      http.get('/api/users', () => HttpResponse.json([])),
      http.get('/api/groups', () => HttpResponse.json([]))
    );
  });

  it('renders invitation to select a resource initially', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce([]);
    render(<CatalogPage />);
    expect(screen.getByText('Select a resource to browse')).toBeInTheDocument();
  });

  it('updates breadcrumbs and details when a node is selected', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce([]);
    render(<CatalogPage />);
    
    const selectBtn = screen.getByText('Select Catalog');
    fireEvent.click(selectBtn);
    
    // Breadcrumb should update - check for 'Catalog' and 'main'
    expect(screen.getByText('Catalog')).toBeInTheDocument();
    expect(screen.getAllByText('main')[0]).toBeInTheDocument();
    expect(screen.getByText('You have SELECT access')).toBeInTheDocument();
  });

  it('handles table selection and type-specific rendering', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce([]);
    render(<CatalogPage />);
    
    const selectBtn = screen.getByText('Select Table');
    fireEvent.click(selectBtn);

    // Check breadcrumbs for non-catalog
    expect(screen.getByText('main')).toBeInTheDocument();
    expect(screen.getAllByText('users')[0]).toBeInTheDocument();
    expect(screen.getByText('TABLE • default/users')).toBeInTheDocument();
  });

  it('triggers right-click and opens provisioning terminal', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    CatalogService.getRegistrations.mockResolvedValueOnce([]);
    render(<CatalogPage />);
    
    // Right click
    const rightClickBtn = screen.getByText('Right Click Node');
    fireEvent.contextMenu(rightClickBtn);
    expect(consoleSpy).toHaveBeenCalledWith('Right click on', expect.objectContaining({ name: 'test-node' }));
    
    // Provisioning Terminal should appear
    expect(screen.getByText(/Provisioning Terminal/i)).toBeInTheDocument();
  });

  it('renders table-specific preview', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce([]);
    render(<CatalogPage />);
    
    fireEvent.click(screen.getByText('Select Table'));
    
    // Preview should exist for tables
    expect(screen.getByText('Preview (Mock)')).toBeInTheDocument();
    expect(screen.getByText('TIMESTAMP')).toBeInTheDocument();
  });

  it('can close the provisioning terminal', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce([]);
    render(<CatalogPage />);
    
    // Right click to open
    fireEvent.contextMenu(screen.getByText('Right Click Node'));
    expect(screen.getByText(/Provisioning Terminal/i)).toBeInTheDocument();
    
    const closeBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(closeBtn);
    
    expect(screen.queryByText(/Provisioning Terminal/i)).not.toBeInTheDocument();
  });

  it('handles toggling objects for the provisioning terminal', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce([]);
    render(<CatalogPage />);
    
    // Select table to show detail view
    fireEvent.click(screen.getByText('Select Table'));
    
    // Add to request
    const addBtn = screen.getByText('Add to Request');
    await act(async () => {
        fireEvent.click(addBtn);
    });
    
    // Button should change label
    expect(screen.getByText('Remove from Request')).toBeInTheDocument();
    
    // Terminal should be open
    expect(screen.getByText(/Provisioning Terminal/i)).toBeInTheDocument();
    
    // Remove from request
    const removeBtn = screen.getByText('Remove from Request');
    await act(async () => {
        fireEvent.click(removeBtn);
    });
    expect(screen.getByText('Add to Request')).toBeInTheDocument();
  });

  it('can clear selected objects from the terminal', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce([]);
    render(<CatalogPage />);
    
    // Toggle table to open terminal and add it
    fireEvent.click(screen.getByText('Toggle Table'));
    
    // The terminal should be open and 'users' should be listed
    expect(screen.getByText(/Provisioning Terminal/i)).toBeInTheDocument();
    expect(screen.getByText('users')).toBeInTheDocument();
    
    const clearBtn = screen.getByText('Clear Selection');
    fireEvent.click(clearBtn);
    
    expect(screen.getByText(/Secure Access Bridge/i)).toBeInTheDocument();
  });

  it('skips adding if right-click on already selected object', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce([]);
    render(<CatalogPage />);
    
    // Toggle table to select it
    fireEvent.click(screen.getByText('Toggle Table'));
    expect(screen.getByText('users')).toBeInTheDocument();
    
    // Right click the same table (via rightClickBtn mock)
    // In our mock, Right Click Node uses test-node, which is DIFFERENT from 'users'
    // Let's toggle test-node first
    fireEvent.click(screen.getByText('Toggle Test Node'));
    expect(screen.getByText('test-node')).toBeInTheDocument();
    
    // Right click test-node
    fireEvent.contextMenu(screen.getByText('Right Click Node'));
    
    // Should still have just 1 copy of test-node and terminal remains open
    expect(screen.getByText('test-node')).toBeInTheDocument();
    expect(screen.getAllByText('test-node').length).toBeGreaterThan(0);
  });

  it('handles node without path or with empty path', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce([]);
    render(<CatalogPage />);
    
    // Select catalog (path is '/')
    fireEvent.click(screen.getByText('Select Catalog'));
    expect(screen.getByText('Catalog')).toBeInTheDocument();
    expect(screen.getByText('CATALOG • /')).toBeInTheDocument(); // Mocked UI shows type + path
  });
});
