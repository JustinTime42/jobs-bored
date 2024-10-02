
import {onCall} from "firebase-functions/v2/https";
import {Organization, Person} from "./definitions";
import {createClient} from "@supabase/supabase-js";
import axios from "axios";
import * as cheerio from "cheerio";

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


const userAgentList = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/602.3.12 (KHTML, like Gecko)",
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

export const emailScraper = onCall({timeoutSeconds: 300, memory: "4GiB"}, async (req: any) => {
    const supabaseAdmin = createAdminClient();
    const {startUrl} = req.data;
    console.log("Starting URL:", startUrl);

    if (!startUrl) {
        console.log("No start URL provided.");
        return;
    }

    const maxDepth = 3;
    const startTime = Date.now();
    const maxDuration = 60 * 1000; // 1 minute in milliseconds

    const visitedUrls = new Set<string>();
    const emails = new Set<string>();

    const commonTlds = [".com", ".net", ".gov", ".org", ".biz", ".edu", ".io", ".co", ".us", ".uk", ".ca", ".au"];
    let domain: string;

    try {
        const urlObj = new URL(startUrl);
        domain = urlObj.hostname;
    } catch (error) {
        console.log("Invalid start URL.");
        await supabaseAdmin
            .from("organizations")
            .update({unreachable_url: true})
            .eq("website_url", startUrl);
        return;
    }

    let userAgentIndex = 0;

    // Initialize the queue with the start URL at depth 0
    const queue: { url: string; depth: number }[] = [];
    queue.push({url: startUrl, depth: 0});

    while (queue.length > 0) {
        if (Date.now() - startTime > maxDuration) {
            console.log("Max duration reached.");
            break;
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const {url, depth} = queue.shift()!;

        if (depth > maxDepth) {
            continue;
        }

        if (visitedUrls.has(url)) {
            continue;
        }
        console.log(`Processing (Depth ${depth}): ${url}`);
        visitedUrls.add(url);

        // Rotate User-Agent
        const userAgent = userAgentList[userAgentIndex % userAgentList.length];
        userAgentIndex++;

        // Politeness delay
        await delay(2000); // 2-second delay between requests

        try {
            const response = await axios.get(url, {
                headers: {
                    "User-Agent": userAgent,
                },
            });

            if (response.status !== 200 && url === startUrl) {
                console.log("Unreachable website:", url);
                await supabaseAdmin
                    .from("organizations")
                    .update({unreachable_url: true})
                    .eq("website_url", startUrl);
                continue;
            }

            const $ = cheerio.load(response.data);

            // Extract emails from mailto links
            $("a[href^='mailto:']").each((i, elem) => {
                const href = $(elem).attr("href");
                if (href) {
                    const email = href.split(":")[1];
                    const cleanedEmail = cleanEmail(email, domain, commonTlds);
                    if (cleanedEmail) {
                        console.log("Found email (mailto):", cleanedEmail);
                        emails.add(cleanedEmail);
                    }
                }
            });

            // Extract emails from text within <p> and heading tags
            let textContent = "";
            $("p, h1, h2, h3, h4, h5, h6").each((i, elem) => {
                textContent += $(elem).text() + " ";
            });

            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
            const foundEmails = textContent.match(emailRegex);
            if (foundEmails) {
                for (const email of foundEmails) {
                    const cleanedEmail = cleanEmail(email, domain, commonTlds);
                    if (cleanedEmail) {
                        console.log("Found email (text):", cleanedEmail);
                        emails.add(cleanedEmail);
                    }
                }
            }

            // Collect links to follow
            const linksToFollow: string[] = [];

            $("a").each((i, elem) => {
                const href = $(elem).attr("href");
                if (href) {
                    let newUrl: string;
                    try {
                        newUrl = new URL(href, url).href;
                    } catch (error) {
                        return;
                    }
                    const newUrlObj = new URL(newUrl);
                    if (newUrlObj.hostname === domain && !visitedUrls.has(newUrl)) {
                        linksToFollow.push(newUrl);
                    }
                }
            });

            // Add new URLs to the queue with incremented depth
            for (const link of linksToFollow) {
                queue.push({url: link, depth: depth + 1});
            }
        } catch (error) {
            console.log(`Error fetching ${url}:`, (error as Error).message);
            // Handle errors silently or log them as needed
        }
    }

    console.log("Emails found:", Array.from(emails));

    const {data, error} = await supabaseAdmin
        .from("organizations")
        .update({emails: Array.from(emails)})
        .eq("website_url", startUrl);

    if (error) {
        throw error;
    }

    return data;
});

function cleanEmail(email: string, domain: string, commonTlds: string[]): string | null {
    console.log("Checking email:", email);
    // Trim query strings and whitespace
    const emailWithoutQuery = email.split("?")[0].trim();

    // Remove trailing characters that are not part of the email
    const emailTrimmed = emailWithoutQuery.replace(/[^\w@.+-]/g, "");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
        return null;
    }

    // Exclude emails with invalid extensions
    const invalidExtensions = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".css", ".js", ".json", ".xml"];
    for (const ext of invalidExtensions) {
        if (emailTrimmed.endsWith(ext)) {
            return null;
        }
    }

    // Check if email domain matches common TLDs or current domain
    const emailDomain = emailTrimmed.split("@")[1];
    if (emailDomain === domain.replace(/^www\./, "") || commonTlds.some((tld) => emailDomain.endsWith(tld))) {
        return emailTrimmed.toLowerCase();
    }

    return null;
}

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
