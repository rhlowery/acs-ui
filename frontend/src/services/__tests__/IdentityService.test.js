import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IdentityService } from '../IdentityService';
import { server } from '../../test/setup';
import { http, HttpResponse } from 'msw';

describe('IdentityService', () => {
    it('fetches identities correctly', async () => {
        server.use(
            http.get('/api/users', () => {
                return HttpResponse.json([{ id: 'u1', name: 'User 1' }]);
            }),
            http.get('/api/groups', () => {
                return HttpResponse.json([{ id: 'g1', name: 'Group 1' }]);
            })
        );

        const data = await IdentityService.fetchIdentities();
        expect(data.users).toHaveLength(1);
        expect(data.groups).toHaveLength(1);
        expect(data.users[0].type).toBe('USER');
    });

    it('handles fetch failure', async () => {
        server.use(
            http.get('/api/users', () => new HttpResponse(null, { status: 500 })),
            http.get('/api/groups', () => HttpResponse.json([]))
        );

        await expect(IdentityService.fetchIdentities()).rejects.toThrow();
    });

    it('handles getCurrentUser failure', async () => {
        server.use(
            http.get('/api/auth/me', () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        const user = await IdentityService.getCurrentUser();
        expect(user).toBeNull();
    });

    it('handles getCurrentUser network error', async () => {
        server.use(
            http.get('/api/auth/me', () => {
                return HttpResponse.error();
            })
        );

        const user = await IdentityService.getCurrentUser();
        expect(user).toBeNull();
    });
});
