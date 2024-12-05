import { getLocalOrganizations } from '@/src/actions/organizations';
import { FiltersState } from '@/src/components/feed_filters/Filters';
import { Organization } from '@/src/definitions';
import { useState, useEffect } from 'react';

type Filters = {
    userId:string
    localities: string[];
}

const useLocalOrganizations = (locations: any[],  filters: FiltersState) => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchOrganizations = async () => { 
        console.log("Fetching organizations")       
        if (!locations) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const locationIds = locations.length > 0 ? locations.map(l => l.id) : null;            
            const localities = filters.localities ? filters.localities : null;
            console.log("Localities", localities)
            console.log(filters)
            const data = await getLocalOrganizations(locationIds, filters.userId || null, localities, filters.page_size, filters.previous_score, filters.previous_id);
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