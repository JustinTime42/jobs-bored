import { getLocalOrganizations } from '@/src/actions/organizations';
import { FiltersState } from '@/src/components/feed_filters/Filters';
import { useState, useEffect } from 'react';

type Filters = {
    userId:string
    localities: string[];
}

const useLocalOrganizations = (locations: any[],  filters: FiltersState) => {
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchOrganizations = async () => {        
        if (!locations) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const locationIds = locations.map(l => l.id);
            const localities = filters.localities?.length > 0 ? filters.localities : null;
            console.log(localities)
            const data = await getLocalOrganizations(locationIds, filters.userId || null, localities);
            console.log(data)
            setOrganizations(data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("filters", filters)
        fetchOrganizations();
    }, [locations, filters.userId, filters.localities]);

    return { organizations, loading, error, fetchOrganizations };
}

export default useLocalOrganizations;