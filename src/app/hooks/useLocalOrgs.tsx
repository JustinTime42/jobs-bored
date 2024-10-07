import { getLocalOrganizations } from '@/src/actions/organizations';
import { useState, useEffect } from 'react';

const useLocalOrganizations = (locations?: any[]) => {
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchOrganizations = async () => {
        
        if (!locations) return 
        setLoading(true);
        try {
            const locationIds = locations.map(l => l.location.id);
            console.log(locationIds)
            const data = await getLocalOrganizations(locationIds);
            console.log(data)
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