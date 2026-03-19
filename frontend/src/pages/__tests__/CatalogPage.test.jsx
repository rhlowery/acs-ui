import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CatalogPage } from '../CatalogPage';
import { CatalogService } from '../../services/CatalogService';

vi.mock('../../services/CatalogService');

describe('CatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders invitation to select a resource initially', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce([]);
    render(<CatalogPage />);
    expect(screen.getByText('Select a resource to browse')).toBeInTheDocument();
  });

  it('updates breadcrumbs and details when a node is selected', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce([
      { id: 'main', name: 'main', type: 'catalog', path: '/', access: 'SELECT' }
    ]);
    
    render(<CatalogPage />);
    
    const catalogNode = await screen.findByText('main');
    fireEvent.click(catalogNode);
    
    // Breadcrumb should update
    expect(screen.getByText('Catalog')).toBeInTheDocument();
    
    // Details should show
    expect(screen.getAllByText('main')[0]).toBeInTheDocument();
    expect(screen.getByText('You have SELECT access')).toBeInTheDocument();
  });
});
