import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewerDashboard } from '../ReviewerDashboard';
import { AuditService } from '../../services/AuditService';
import { RequestService } from '../../services/RequestService';

vi.stubGlobal('alert', vi.fn());

vi.mock('../../services/AuditService', () => ({
    AuditService: {
        getLogs: vi.fn(),
        streamLogs: vi.fn().mockImplementation(() => ({ close: vi.fn() }))
    }
}));
vi.mock('../../services/RequestService', () => ({
    RequestService: {
        getRequests: vi.fn(),
        verifyRequest: vi.fn()
    }
}));

const mockAuditLogs = [
    { id: '1', timestamp: Date.now(), principalId: 'user1', action: 'LOGIN', resourcePath: 'System', result: 'SUCCESS' }
];

describe('ReviewerDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        AuditService.getLogs.mockResolvedValue(mockAuditLogs);
        RequestService.getRequests.mockResolvedValue([{ id: 'req-1', status: 'APPROVED', resourcePath: 'main.db.t1' }]);
    });

    it('renders audit logs by default', async () => {
        render(<ReviewerDashboard />);
        await waitFor(() => expect(screen.getByText('LOGIN')).toBeInTheDocument());
        expect(screen.getByText('user1')).toBeInTheDocument();
    });

    it('switches to requests view and handles verify', async () => {
        render(<ReviewerDashboard />);
        
        fireEvent.click(screen.getByText('Access Requests'));
        await waitFor(() => expect(screen.getByText('req-1')).toBeInTheDocument());
        
        const verifyBtn = screen.getByText('Verify Integrity');
        fireEvent.click(verifyBtn);
        
        expect(RequestService.verifyRequest).toHaveBeenCalledWith('req-1');
        await waitFor(() => expect(global.alert).toHaveBeenCalledWith(expect.stringMatching(/verified/)));
    });

    it('handles verify error', async () => {
        RequestService.verifyRequest.mockRejectedValue(new Error('Verify failed'));
        render(<ReviewerDashboard />);
        fireEvent.click(screen.getByText('Access Requests'));
        await waitFor(() => expect(screen.getByText('req-1')).toBeInTheDocument());
        
        fireEvent.click(screen.getByText('Verify Integrity'));
        await waitFor(() => expect(global.alert).toHaveBeenCalledWith('Verify failed'));
    });

    it('toggles live-stream for audit logs', async () => {
        render(<ReviewerDashboard />);
        const toggle = screen.getByRole('checkbox');
        
        fireEvent.click(toggle);
        expect(AuditService.streamLogs).toHaveBeenCalled();
    });

    it('shows integrity placeholder', () => {
        render(<ReviewerDashboard />);
        fireEvent.click(screen.getByText('Resource Integrity'));
        expect(screen.getByText('Catalog Integrity Checker')).toBeInTheDocument();
    });
});
