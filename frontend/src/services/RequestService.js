const API_BASE = '/api';

export const RequestService = {
    async submitRequest(request) {
        // Map to backend schema for submission
        const payload = {
            requesterId: request.requesterId,
            principals: request.principals,
            resources: request.objects.map(obj => ({
                resourceType: obj.type,
                catalogName: obj.catalog || 'main',
                schemaName: obj.schema || 'default',
                tableName: obj.name,
                privileges: request.permissions
            })),
            justification: request.justification,
            timeConstraint: request.timeConstraint
        };

        const res = await fetch(`${API_BASE}/storage/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            let errorMessage = 'Submission failed';
            try {
                const error = await res.json();
                errorMessage = error.message || errorMessage;
            } catch (e) {
                // Ignore JSON parse error if body is empty
            }
            throw new Error(errorMessage);
        }

        return await res.json();
    }
};
