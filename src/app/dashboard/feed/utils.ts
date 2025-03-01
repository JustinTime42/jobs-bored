import { Organization } from "@/src/definitions";

import { getLocalOrganizations } from "@/src/actions/organizations";

export const fetchMoreOrganizations = async (organizations: Organization[], userDetails: any, filters: any) => {    
    const lastOrg = organizations[organizations.length - 1];
    const locationIds = userDetails?.locations?.map((l: any) => l.id) || null;
    const userId = userDetails?.id || filters.userId;
    
    if (!userId) {
        console.error('User ID is missing in fetchMoreOrganizations');
        throw new Error('User ID is required');
    }
    
    const data = await getLocalOrganizations(
        locationIds,
        userId,
        filters.localities,
        filters.page_size,
        lastOrg?.score || null,
        lastOrg?.id || null,
        filters.favoritesOnly || false
    );
    return data;
};

export const fetchOrganizations = async (currentFilters:any, userDetails: any) => {
    const locationIds = userDetails?.locations?.map((l: any) => l.id) || null;
    const userId = userDetails?.id || currentFilters.userId;
    
    if (!userId) {
        console.error('User ID is missing in fetchOrganizations');
        throw new Error('User ID is required');
    }
    
    const data = await getLocalOrganizations(
        locationIds,
        userId,
        currentFilters.localities,
        currentFilters.page_size,
        null,
        null,
        currentFilters.favoritesOnly || false
    );
    return data;
};
