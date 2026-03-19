import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccessForm } from '../AccessForm';
import { IdentityService } from '../../../services/IdentityService';
import { RequestService } from '../../../services/RequestService';

vi.mock('../../../services/IdentityService', () => ({
    IdentityService: {
        fetchIdentities: vi.fn(),
        getCurrentUser: vi.fn()
    }
}));

vi.mock('../../../services/RequestService', () => ({
    RequestService: {
        submitRequest: vi.fn()
    }
}));

vi.stubGlobal('alert', vi.fn());

const mockIdentities = {
    users: [{ id: 'u1', name: 'Analyst Jane', type: 'USER', email: 'jane@example.com' }],
    groups: [{ id: 'g1', name: 'Devs', type: 'GROUP' }],
    servicePrincipals: []
};

const mockSelectedObjects = [{ id: 'o1', name: 'users', type: 'table', catalog: 'main', schema: 'default' }];

describe('AccessForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        IdentityService.fetchIdentities.mockResolvedValue(mockIdentities);
    });

    it('renders placeholder when no objects selected', () => {
        render(<AccessForm selectedObjects={[]} />);
        expect(screen.getByText(/SELECT OBJECTS FROM THE CATALOG/i)).toBeInTheDocument();
    });

    it('renders form segments when objects are selected', async () => {
        render(<AccessForm selectedObjects={mockSelectedObjects} />);
        await waitFor(() => expect(screen.getByText('Analyst Jane')).toBeInTheDocument());
        expect(screen.getByText('2. Select Permissions')).toBeInTheDocument();
        expect(screen.getByText('3. Constraints & Justification')).toBeInTheDocument();
    });

    it('handles principal search filtering', async () => {
        render(<AccessForm selectedObjects={mockSelectedObjects} />);
        await waitFor(() => expect(screen.getByText('Analyst Jane')).toBeInTheDocument());
        
        const searchInput = screen.getByTestId('principal-search-input');
        fireEvent.change(searchInput, { target: { value: 'Jane' } });
        expect(screen.getByText('Analyst Jane')).toBeInTheDocument();
        
        fireEvent.change(searchInput, { target: { value: 'SomethingElse' } });
        expect(screen.queryByText('Analyst Jane')).not.toBeInTheDocument();
    });

    it('validates and submits the form', async () => {
        render(<AccessForm selectedObjects={mockSelectedObjects} onClearSelection={vi.fn()} />);
        await waitFor(() => expect(screen.getByText('Analyst Jane')).toBeInTheDocument());

        // Select principal
        fireEvent.click(screen.getByText('Analyst Jane'));
        
        // Select permission
        fireEvent.click(screen.getByTestId('permission-toggle-READ'));
        
        // Enter justification
        const justInput = screen.getByTestId('justification-input');
        fireEvent.change(justInput, { target: { value: 'This is a long enough justification for testing purposes.' } });
        
        // Submit
        const submitBtn = screen.getByTestId('submit-request-button');
        fireEvent.click(submitBtn);
        
        await waitFor(() => expect(RequestService.submitRequest).toHaveBeenCalled());
        expect(global.alert).toHaveBeenCalledWith('Access request submitted successfully!');
    });

    it('handles duration constraint', async () => {
        render(<AccessForm selectedObjects={mockSelectedObjects} />);
        await waitFor(() => expect(screen.getByText('Analyst Jane')).toBeInTheDocument());

        fireEvent.click(screen.getByLabelText(/Hours/i));
        const durationInput = screen.getByTestId('duration-input');
        fireEvent.change(durationInput, { target: { value: '5' } });
        
        // Just verify it doesn't crash and value updates
        expect(durationInput.value).toBe('5');
    });

    it('handles date range constraint and validation', async () => {
        render(<AccessForm selectedObjects={mockSelectedObjects} />);
        await waitFor(() => expect(screen.getByText('Analyst Jane')).toBeInTheDocument());

        fireEvent.click(screen.getByLabelText(/Date Range/i));
        
        const startInput = screen.getByLabelText(/Start Date/i);
        const endInput = screen.getByLabelText(/End Date/i);

        // Case: End before start
        fireEvent.change(startInput, { target: { value: '2026-04-01' } });
        fireEvent.change(endInput, { target: { value: '2026-03-01' } });

        fireEvent.click(screen.getByText('Analyst Jane'));
        fireEvent.click(screen.getByTestId('permission-toggle-READ'));
        fireEvent.change(screen.getByTestId('justification-input'), { target: { value: 'Valid justification here' } });
        
        fireEvent.click(screen.getByTestId('submit-request-button'));
        expect(global.alert).toHaveBeenCalledWith('End date must be after start date.');
    });

    it('sanitizes justification input', async () => {
        render(<AccessForm selectedObjects={mockSelectedObjects} />);
        await waitFor(() => expect(screen.getByText('Analyst Jane')).toBeInTheDocument());

        fireEvent.click(screen.getByText('Analyst Jane'));
        fireEvent.click(screen.getByTestId('permission-toggle-READ'));
        
        const justInput = screen.getByTestId('justification-input');
        fireEvent.change(justInput, { target: { value: '<script>alert(1)</script> Justification with HTML tags.' } });

        fireEvent.click(screen.getByTestId('submit-request-button'));
        await waitFor(() => {
            const lastCall = RequestService.submitRequest.mock.calls[0][0];
            expect(lastCall.justification).not.toContain('<script>');
            expect(lastCall.justification).toContain('scriptalert(1)/script');
        });
    });

    it('validates required fields before submission', async () => {
        render(<AccessForm selectedObjects={mockSelectedObjects} />);
        await waitFor(() => expect(screen.getByText('Analyst Jane')).toBeInTheDocument());

        const submitBtn = screen.getByTestId('submit-request-button');
        
        // No principal
        fireEvent.click(submitBtn);
        expect(global.alert).toHaveBeenCalledWith('Please select at least one principal.');

        // Select principal, but no permission
        fireEvent.click(screen.getByText('Analyst Jane'));
        fireEvent.click(submitBtn);
        expect(global.alert).toHaveBeenCalledWith('Please select at least one permission.');

        // Select permission, but no justification
        fireEvent.click(screen.getByTestId('permission-toggle-READ'));
        fireEvent.click(submitBtn);
        expect(global.alert).toHaveBeenCalledWith('Please provide a justification (at least 10 characters).');

        // Too short justification
        fireEvent.change(screen.getByTestId('justification-input'), { target: { value: 'short' } });
        fireEvent.click(submitBtn);
        expect(global.alert).toHaveBeenCalledWith('Please provide a justification (at least 10 characters).');

        // Too long justification (using a big string)
        const longJust = 'a'.repeat(1001);
        fireEvent.change(screen.getByTestId('justification-input'), { target: { value: longJust } });
        fireEvent.click(submitBtn);
        expect(global.alert).toHaveBeenCalledWith('Justification must be less than 1000 characters.');
    });
    it('renders multiple selected objects with correct icons', async () => {
        const multipleObjects = [
            { id: 'o1', name: 'cat1', type: 'catalog' },
            { id: 'o2', name: 'sch1', type: 'schema' },
            { id: 'o3', name: 'tab1', type: 'table' }
        ];
        render(<AccessForm selectedObjects={multipleObjects} />);
        
        await waitFor(() => expect(screen.getByText(/Requesting access to 3 objects/i)).toBeInTheDocument());
        expect(screen.getByText('cat1')).toBeInTheDocument();
        expect(screen.getByText('sch1')).toBeInTheDocument();
        expect(screen.getByText('tab1')).toBeInTheDocument();
        
        // Check for catalog, schema, table labels (from NodeIcon or SelectedObjectsList)
        expect(screen.getByText('catalog:')).toBeInTheDocument();
        expect(screen.getByText('schema:')).toBeInTheDocument();
        expect(screen.getByText('table:')).toBeInTheDocument();
    });

    it('handles mandatory date fields validation when RANGE is selected', async () => {
        render(<AccessForm selectedObjects={mockSelectedObjects} />);
        await waitFor(() => expect(screen.getByText('Analyst Jane')).toBeInTheDocument());

        fireEvent.click(screen.getByLabelText(/Date Range/i));
        
        fireEvent.click(screen.getByText('Analyst Jane'));
        fireEvent.click(screen.getByTestId('permission-toggle-READ'));
        fireEvent.change(screen.getByTestId('justification-input'), { target: { value: 'Valid justification here' } });
        
        const submitBtn = screen.getByTestId('submit-request-button');
        
        // Case: No start/end date
        fireEvent.click(submitBtn);
        expect(global.alert).toHaveBeenCalledWith('Please provide both start and end dates.');
    });
});
