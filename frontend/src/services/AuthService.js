export const AuthService = {
    getCurrentUser() {
        return {
            id: 'mock-user-123',
            name: 'Mock Approver',
            roles: ['APPROVER', 'AUDITOR', 'ADMIN'] // All roles for demonstration
        };
    },
    
    hasRole(role) {
        const user = this.getCurrentUser();
        return user.roles.includes(role);
    }
};
