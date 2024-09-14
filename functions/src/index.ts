
import {onCall} from "firebase-functions/v2/https";
import * as functions from "firebase-functions";
import {Account, Person} from "./definitions";
import {createClient} from "@supabase/supabase-js";

const validOrganizationKeys = [
    "id",
    "name",
    "website_url",
    "linkedin_url",
    "twitter_url",
    "facebook_url",
    "logo_url",
    "organization_street",
    "organization_city",
    "organization_state",
    "organization_country",
    "organization_postal_code",
];

const validPersonKeys = [
    "id",
    "name",
    "first_name",
    "last_name",
    "title",
    "headline",
    "linkedin_url",
    "twitter_url",
    "facebook_url",
    "github_url",
    "photo_url",
    "state",
    "city",
    "country",
    "primary_phone",
    "organization_id",
];

export const createAdminClient = () => {
    return createClient(
        process.env.SUPABASE_URL || "",
        process.env.SUPABASE_KEY || "",
        {auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        }}
    );
};

export const getOrgDetails = async (organizationIds: string[]) => {
    try {
        const requestHeaders = {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "X-Api-Key": process.env.APOLLO_API_KEY || "",
        };
        const body = {
            page: 1,
            per_page: 100,
            organization_ids: organizationIds,
        };
        let allOrganizations: Account[] = [];
        let hasMore = true;

        while (hasMore) {
            const response = await fetch("https://api.apollo.io/api/v1/mixed_companies/search", {
                method: "POST",
                headers: requestHeaders,
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const responseData = await response.json();
            // const cleanedAccounts = responseData.accounts.map((org: any) => {
            //     const cleanedAccount = {} as any;
            //     for (const key of validOrganizationKeys) {
            //         cleanedAccount[key] = org[key];
            //     }
            //     return cleanedAccount;
            // });
            const cleanedOrgs = responseData.organizations.map((org: any) => {
                const cleanedOrg = {} as any;
                for (const key of validOrganizationKeys) {
                    cleanedOrg[key] = org[key];
                }
                return cleanedOrg;
            });

            allOrganizations = allOrganizations
                .concat(cleanedOrgs);
            if (responseData.organizations.length < body.per_page) {
                hasMore = false;
            } else {
                body.page += 1;
            }
        }

        return allOrganizations.filter((org) => org.website_url !== null) || [];
    } catch (e) {
        functions.logger.error(`Failed to access: ${e}`);
        return [];
    }
};

export const addLocation = onCall(async (request: any) => {
    const {location} = request.data;
    try {
        let allPeople = [] as Person[];
        const allOrgIds = {} as any;
        let page = 1;
        const perPage = 100;
        let totalPages = 20;
        while (page <= 10 && page <= totalPages) {
            const response = await fetch("https://api.apollo.io/v1/mixed_people/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache",
                    "X-Api-Key": process.env.APOLLO_API_KEY || "",
                },
                body: JSON.stringify({
                    page: page,
                    per_page: perPage,
                    person_titles: [
                        "Web Developer",
                        "programmer",
                        "software developer",
                        "software engineer",
                    ],
                    organization_num_employees_ranges: ["5,5000"],
                    person_locations: [location.formatted_address],
                }),
            });

            const data = await response.json();
            if (response.ok) {
                allPeople = allPeople.concat(data.people);
                totalPages = data.pagination.total_pages;
                page += 1;
            } else {
                console.error("Error fetching data:", data);
                break;
            }
        }
        // Deduplicate allPeople based on id
        allPeople = allPeople.reduce((uniquePeople: Person[], person: Person) => {
            if (!uniquePeople.some((p) => p.id === person.id)) {
                uniquePeople.push(person);
            }
            return uniquePeople;
        }, []);
        allPeople = allPeople.map((person:any) => {
            if (person.organization?.id) {
                allOrgIds[person.organization.id] = true;
            }
            const cleanedPerson = {} as any;
            for (const key of validPersonKeys) {
                cleanedPerson[key] = person[key];
            }
            return cleanedPerson;
        });
        const orgDetails = await getOrgDetails(Object.keys(allOrgIds));
        const allOrganizations = orgDetails.map((org: any) => {
            org.hires_in = [location.toLowerCase()];
            org.primary_phone = org.sanitized_phone;
            return org;
        });
        console.log("Organizations found:", allOrganizations);
        await saveOrganizations(allOrganizations);
        await savePeople(allPeople);
        console.log("People found:", allPeople.length);
        return allPeople;
    } catch (e) {
        console.error("Apollo People", e);
        return [];
    }
});

export const saveOrganizations = async (organizations: any) => {
    const supabaseAdmin = createAdminClient();
    const duplicateWebsites = organizations.filter((org: any, index: number, self: any[]) =>
        index !== self.findIndex((o: any) => o.website_url === org.website_url)
    );

    if (duplicateWebsites.length > 0) {
        console.log("Organizations with duplicate website URLs:", duplicateWebsites);
    } else {
        console.log("No organizations with duplicate website URLs found.");
    }
    try {
        const {data, error} = await supabaseAdmin
            .from("organizations").upsert(organizations).select();
        if (error) {
            console.log(JSON.stringify(error));
            throw error;
        }
        console.log("Organizations saved:", data.length);
        return data;
    } catch (e) {
        console.error(`Failed to save organizations: ${e}`);
        return [];
    }
};

export const savePeople = async (people: any[]) => {
    const supabaseAdmin = createAdminClient();
    console.log("Saving people:", people.length);
    try {
        const {data, error} = await supabaseAdmin
            .from("people")
            .upsert(people, {onConflict: "id"})
            .select();

        if (error) {
            console.error("Error during upsert:", JSON.stringify(error));
            throw error;
        }

        return data;
    } catch (e) {
        console.error(`Failed to save people: ${JSON.stringify(e)}`);
        return [];
    }
};
