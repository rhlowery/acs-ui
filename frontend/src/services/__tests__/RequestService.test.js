import { describe, it, expect, vi } from 'vitest';
import { RequestService } from '../RequestService';
import { server } from '../../test/setup';
import { http, HttpResponse } from 'msw';

describe('RequestService', () => {
    it('submits a request successfully', async () => {
        let capturedPayload;
        server.use(
            http.post('/api/storage/requests', async ({ request }) => {
                capturedPayload = await request.json();
                return HttpResponse.json({ id: 'res-1' });
            })
        );

        const mockRequest = {
            requesterId: 'me',
            principals: ['u1'],
            objects: [{ type: 'table', name: 't1', catalog: 'c1', schema: 's1' }],
            permissions: ['READ'],
            justification: 'testing',
            timeConstraint: { type: 'PERMANENT' }
        };

        const result = await RequestService.submitRequest(mockRequest);
        expect(result.id).toBe('res-1');
        expect(capturedPayload.resources[0].tableName).toBe('t1');
    });

    it('handles submission error with fallback message', async () => {
        server.use(
            http.post('/api/storage/requests', () => {
                return new HttpResponse(null, { status: 400 });
            })
        );

        await expect(RequestService.submitRequest({ objects: [] })).rejects.toThrow('Submission failed');
    });

    it('handles submission error with custom message', async () => {
        server.use(
            http.post('/api/storage/requests', () => {
                return HttpResponse.json({ message: 'Custom Backend Error' }, { status: 400 });
            })
        );

        await expect(RequestService.submitRequest({ objects: [] })).rejects.toThrow('Custom Backend Error');
    });

    it('uses default catalog and schema if missing', async () => {
        let capturedPayload;
        server.use(
            http.post('/api/storage/requests', async ({ request }) => {
                capturedPayload = await request.json();
                return HttpResponse.json({ id: 'res-2' });
            })
        );

        const mockRequest = {
            requesterId: 'me',
            principals: ['u1'],
            objects: [{ type: 'table', name: 't1' }], // Missing catalog and schema
            permissions: ['READ'],
            justification: 'testing',
            timeConstraint: { type: 'PERMANENT' }
        };

        await RequestService.submitRequest(mockRequest);
        expect(capturedPayload.resources[0].catalogName).toBe('main');
        expect(capturedPayload.resources[0].schemaName).toBe('default');
    });
});
