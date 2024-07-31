export const getOrganizations = async (organization_ids: string[]) => {
    try {
        const requestHeaders = {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "X-Api-Key": process.env.APOLLO_API_KEY!
        };
        const data = {
            page: 1,
            per_page: 10,
            organization_ids: [organization_ids]
        };
        let allOrganizations = [] as any[];
        let hasMore = true;

        while (hasMore) {
            const response = await fetch("https://api.apollo.io/api/v1/mixed_companies/search", {
                method: 'POST',
                headers: requestHeaders,
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const responseData = await response.json();
            allOrganizations = allOrganizations.concat(responseData.organizations || []);

            if (responseData.organizations.length < data.per_page) {
                hasMore = false;
            } else {
                data.page += 1;
            }
        }

        return allOrganizations;
    } catch (e) {
        console.error(`Failed to access: ${e}`);
        return []
    }
};