const API_BASE = '/api';

export const IdentityService = {
    async fetchIdentities() {
        const [usersRes, groupsRes] = await Promise.all([
            fetch(`${API_BASE}/users`),
            fetch(`${API_BASE}/groups`)
        ]);

        if (!usersRes.ok || !groupsRes.ok) {
            throw new Error('Failed to fetch identities');
        }

        const users = await usersRes.json();
        const groups = await groupsRes.json();

        return {
            users: users.map(u => ({ ...u, type: 'USER' })),
            groups: groups.map(g => ({ ...g, type: 'GROUP' })),
            servicePrincipals: [] // Backend spec for SPs not confirmed, placeholder
        };
    },

    async getCurrentUser() {
        try {
            const res = await fetch(`${API_BASE}/auth/me`);
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            return null;
        }
    }
};
