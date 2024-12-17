import { Organization } from "@/src/definitions";

import { getLocalOrganizations } from "@/src/actions/organizations";

export const fetchMoreOrganizations = async (organizations: Organization[], userDetails: any, filters: any) => {    
    const lastOrg = organizations[organizations.length - 1];
    const locationIds = userDetails?.locations?.map((l: any) => l.id) || null;
    const data = await getLocalOrganizations(
        locationIds,
        filters.userId,
        filters.localities,
        filters.page_size,
        lastOrg?.score || null,
        lastOrg?.id || null
    );
    return data;
};

export const fetchOrganizations = async (currentFilters:any, userDetails: any) => {
    const locationIds = userDetails?.locations?.map((l: any) => l.id) || null;
    const data = await getLocalOrganizations(
        locationIds,
        currentFilters.userId,
        currentFilters.localities,
        currentFilters.page_size,
        null,
        null
    );
    return data;
};
