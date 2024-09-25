
import {onCall} from "firebase-functions/v2/https";
import {Organization, Person} from "./definitions";
import {createClient} from "@supabase/supabase-js";

const validOrganizationKeys = [
    "id",
    "name",
    "website_url",
    "linkedin_url",
    "twitter_url",
    "facebook_url",
    "logo_url",
    "sanitized_phone",
    "founded_year",
    "market_cap",
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
    "locationId",
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

export const getPeopleLabsData = async (websiteUrls: string[]) => {
    const supabaseAdmin = createAdminClient();
    const {data, error} = await supabaseAdmin
        .from("people_labs")
        .select("*")
        .in("website", websiteUrls);
    if (error) {
        throw error;
    }
    return data;
};

export const addLocation = onCall(async (request: any) => {
    const {location, userId} = request.data;
    console.log("Location:", location);
    console.log("user:", userId);
    try {
        const supabaseAdmin = createAdminClient();
        let newLocation = {} as any;
        const {data: existingLocation, error: locationError} = await supabaseAdmin
            .from("locations")
            .select("*")
            .eq("formatted_address", location.formatted_address)
            .maybeSingle();
        if (locationError) {
            throw locationError;
        }
        console.log("existingLocation:", existingLocation);
        if (!existingLocation) {
            console.log("Location not found, saving new location", location);
            newLocation = await saveLocation(
                {
                    ...convertPlaceToLocation(location),
                    page: 0,
                }
            );
            console.log("New location saved:", newLocation);
        } else {
            console.log("Location found:", existingLocation);
            newLocation = existingLocation;
        }
        const {error} = await supabaseAdmin
            .from("users_locations")
            .insert([{user_id: userId, location_id: newLocation.id}]);
        if (error) {
            throw error;
        }
        let allPeople = [] as Person[];
        const allOrgs = [] as Organization[];
        const allOrgWebsites = {} as any;
        const startingPage = newLocation.page || 1;
        let currentPage = startingPage;
        const perPage = 100;
        let totalPages = startingPage + 1;
        while (currentPage <= (10 + startingPage) && currentPage <= totalPages) {
            const response = await fetch("https://api.apollo.io/v1/mixed_people/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache",
                    "X-Api-Key": process.env.APOLLO_API_KEY || "",
                },
                body: JSON.stringify({
                    page: currentPage,
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
            console.log("Data:", data);
            if (response.ok) {
                allPeople = allPeople.concat(data.people);
                totalPages = data.pagination.total_pages;
                currentPage += 1;
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
            if (person.organization &&
                !allOrgs.find((org) => org.id === person.organization.id) &&
                !allOrgs.find((org) => org.website_url === person.organization.website_url)
            ) {
                if (person.organization.website_url) {
                    allOrgWebsites[person.organization.website_url] = true;
                }
                allOrgs.push(person.organization);
            }
            const cleanedPerson = {} as any;
            for (const key of validPersonKeys) {
                cleanedPerson[key] = person[key];
            }
            cleanedPerson.locationId = newLocation.id;
            return cleanedPerson;
        });
        const peopleLabsData = await getPeopleLabsData(Object.keys(allOrgWebsites));
        console.log("PeopleLabs data:", peopleLabsData);
        const allOrganizations = allOrgs.map((org: any) => {
            const cleanedOrg = {} as any;
            for (const key of validOrganizationKeys) {
                cleanedOrg[key] = org[key];
            }
            const peopleLabsOrg = peopleLabsData.find((p: any) => p.website === cleanedOrg.website_url);
            console.log("PeopleLabs org:", peopleLabsOrg);
            cleanedOrg.hires_in = [newLocation.id];
            cleanedOrg.sanitized_phone = org.sanitized_phone;
            if (peopleLabsOrg) {
                cleanedOrg.industry = peopleLabsOrg.industry;
                cleanedOrg.size = peopleLabsOrg.size;
                cleanedOrg.founded_year = cleanedOrg.founded_year || peopleLabsOrg.founded_year;
                cleanedOrg.locality = peopleLabsOrg.locality;
                cleanedOrg.region = peopleLabsOrg.region;
                cleanedOrg.country = peopleLabsOrg.country;
                cleanedOrg.linkedin_url = cleanedOrg.linkedin_url || peopleLabsOrg.linkedin_url;
            }
            return cleanedOrg;
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

    try {
        // Don't forget there is an upsert triggered function in Supabase that helps with this.
        const {data, error} = await supabaseAdmin
            .from("organizations").upsert(organizations, {onConflict: "id"}).select();
        if (error) {
            console.log(JSON.stringify(error));
            throw error;
        }
        console.log("Organizations saved:", data.length);
        return data;
    } catch (e) {
        console.error(`Failed to save organizations: ${JSON.stringify(e)}`);
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

export const convertPlaceToLocation = (place: any) => {
    return {
        locality: place.address_components
            ?.find((component: any) => component.types.includes("locality"))
            ?.long_name,
        admin_area_level_1: place.address_components
            ?.find((component: any) => component.types.includes("administrative_area_level_1"))
            ?.long_name,
        admin_area_level_2: place.address_components
            ?.find((component: any) => component.types.includes("administrative_area_level_2"))
            ?.long_name,
        country: place.address_components
            ?.find((component: any) => component.types.includes("country"))
            ?.long_name,
        formatted_address: place.formatted_address,
    };
};

export const saveLocation = async (location: any) => {
    const supabaseAdmin = createAdminClient();
    try {
        const {data, error} = await supabaseAdmin
            .from("locations")
            .insert(location)
            .select();
        if (error) {
            console.error("Error during insert:", JSON.stringify(error));
            throw error;
        }
        return data?.[0];
    } catch (e) {
        console.error(`Failed to save locations: ${JSON.stringify(e)}`);
        return [];
    }
};
