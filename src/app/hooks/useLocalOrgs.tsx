import { getLocalOrganizations } from '@/src/api/organizations';
import { useState, useEffect } from 'react';

const useLocalOrganizations = (locations?: string[]) => {
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchOrganizations = async () => {
        
        if (!locations) return 
        setLoading(true);
        try {
            const data = await getLocalOrganizations(locations);
            setOrganizations(data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, [locations]);

    return { organizations, loading, error };
}

export default useLocalOrganizations;