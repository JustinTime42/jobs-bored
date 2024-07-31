export const getLocalPeople = async (location: string) => {
    try {
        const requestHeaders = {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "X-Api-Key": process.env.APOLLO_API_KEY!
        };

        const data = {
            page: 1,
            per_page: 10,
            person_locations: [location],
            person_titles: ["Web Developer", "programmer", "software developer", "software engineer"]
        };

        let allPeople: any[] = [];
        let hasMore = true;

        while (hasMore) {
            const response = await fetch("https://api.apollo.io/v1/mixed_people/search", {
                method: 'POST',
                headers: requestHeaders,
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const responseData = await response.json();
            allPeople = allPeople.concat(responseData.people || []);

            if (responseData.people.length < data.per_page) {
                hasMore = false;
            } else {
                data.page += 1;
            }
        }

        return allPeople;
        
    } catch (e) {
        console.error(`Failed to access: ${e}`);
        return []
    }
};