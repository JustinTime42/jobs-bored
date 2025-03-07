import {onCall, onRequest} from "firebase-functions/v2/https";
import {Organization, Person} from "./definitions";
import {createClient} from "@supabase/supabase-js";
import axios from "axios";
import * as cheerio from "cheerio";
import {CloudTasksClient} from "@google-cloud/tasks";
const tasksClient = new CloudTasksClient();


// List of common technologies used in web and software development
const technologies = [
    // Programming Languages
    "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Ruby", "PHP", "Go", "Rust", "Swift", "Kotlin", "Scala",
    // Frontend Frameworks/Libraries
    "React", "Angular", "Vue", "Svelte", "Next", "Nuxt", "Gatsby",
    "jQuery", "Ember", "Backbone", "Redux", "MobX",
    "Zustand", "Jotai", "Recoil", "React Query", "SWR", "Tailwind", "Bootstrap",
    "Material UI", "Chakra UI", "Styled Components",

    // Backend Frameworks
    "Node", "Express", "Django", "Flask", "Spring", "ASP.NET", "Laravel",
    "Ruby on Rails", "FastAPI", "NestJS", "Strapi",
    "Koa", "Hapi", "Adonis", "Meteor", "Sails", "Feathers",

    // Databases
    "MongoDB", "PostgreSQL", "MySQL", "SQLite", "Oracle", "SQL", "Redis", "Elasticsearch", "Cassandra", "DynamoDB",
    "Firebase", "Supabase", "Fauna", "Neo4j", "CouchDB", "MariaDB",

    // Cloud Providers
    "AWS", "Azure", "Google Cloud", "Heroku", "DigitalOcean", "Vercel", "Netlify", "Cloudflare", "Linode", "Vultr",

    // DevOps/Tools
    "Docker", "Kubernetes", "Jenkins", "Travis CI", "CircleCI", "GitHub Actions",
    "GitLab CI", "Terraform", "Ansible", "Puppet",
    "Chef", "Prometheus", "Grafana", "ELK Stack", "Nginx", "Apache",

    // Mobile
    "React Native", "Flutter", "Ionic", "Xamarin", "Cordova", "Capacitor",
    "SwiftUI", "UIKit", "Kotlin Multiplatform",

    // Testing
    "Jest", "Mocha", "Chai", "Cypress", "Selenium", "Puppeteer", "Playwright",
    "TestCafe", "Enzyme", "React Testing Library",
    "JUnit", "PyTest", "PHPUnit", "RSpec",

    // Other
    "GraphQL", "REST API", "WebSockets", "gRPC", "Kafka", "RabbitMQ", "WebRTC",
    "PWA", "Electron", "Tauri", "WebAssembly",
    "Blockchain", "Ethereum", "Solidity", "Web3", "AI", "Machine Learning",
    "TensorFlow", "PyTorch", "NLP", "Computer Vision",
];
console.log(technologies);
// /**
//  * Detects technologies mentioned in a text string
//  * @param text The text to analyze for technology mentions
//  * @returns Array of detected technologies
//  */
// const detectTechnologies = (text: string): string[] => {
//     if (!text) return [];

//     const normalizedText = text.toLowerCase();
//     return technologies.filter(tech =>
//         normalizedText.includes(tech.toLowerCase())
//     );
// };
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
    "technologies",
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
    console.log("Getting PeopleLabs data for websites:", websiteUrls);
    const supabaseAdmin = createAdminClient();
    const {data, error} = await supabaseAdmin
        .from("people_labs")
        .select("*")
        .in("website", websiteUrls);
    if (error) {
        console.error("Error fetching PeopleLabs data:", error);
        throw error;
    }
    return data;
};
export const populateOrganizations = onCall({timeoutSeconds: 600, memory: "4GiB"}, async (request: any) => {
    const {organizationIds} = request.data;
    console.log("First organization id:", organizationIds[0]);
    console.log("Populating organizations:", organizationIds.length);
    // try {
    const results = await getCompanyPeople(organizationIds);
    console.log("Results:", results);
    return results;
    // } catch (e) {
    //     console.error("Error populating organizations:", e);
    //     return [];
    // }
});

export const getCompanyPeople = async (companyIds: string[]) => {
    console.log("Getting company people for companies:", companyIds.length);
    console.log("companyIds:", companyIds);
    const supabaseAdmin = createAdminClient();
    try {
        const requestHeaders = {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "X-Api-Key": process.env.APOLLO_API_KEY || "",
        };
        let allPeople: Person[] = [];
        let page = 1;
        const perPage = 100;
        let totalPages = 1;

        while (page <= totalPages) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const response = await fetch("https://api.apollo.io/v1/mixed_people/search", {
                method: "POST",
                headers: requestHeaders,
                body: JSON.stringify({
                    organization_ids: companyIds,
                    per_page: perPage,
                    page: page,
                    person_titles: [
                        "software engineering manager",
                        "software engineering director",
                        "software engineering lead",
                        "Engineering Director",
                        "Technical Director",
                        "Development Director",
                        "IT Director",
                        "Engineering Team Lead",
                        "Development Team Lead",
                        "Technical Team Lead",
                        "Engineering Manager",
                        "Technical Manager",
                        "VP of Engineering",
                        "VP of Technology",
                        "Head of Engineering",
                        "Head of Technology",
                        "Director of Engineering",
                        "Director of Technology",
                        "CEO",
                        "CTO",
                        "Technical Recruiter",
                        "Human Resources",
                        "Junior Software Engineer",
                        "Junior Developer",
                        "Entry Level Software Engineer",
                        "Entry Level Developer",
                    ],
                    organization_num_employees_ranges: ["11,1000"],
                }),
            });

            if (!response.ok) {
                console.error("Error fetching more people data:", response);
                console.log("companyIds:", companyIds);
                break;
            }

            const data = await response.json();
            console.log("Appolo All People Response:", data.people.length);
            console.log("page:", page);
            console.log("totalPages:", totalPages);
            allPeople = allPeople.concat(data.people);
            totalPages = data.pagination.total_pages;
            page++;
        }
        console.log("found people:", allPeople.length);
        const cleanPeople = allPeople.map((person: any) => {
            person = Object.keys(person).reduce((acc:any, key) => {
                if (validPersonKeys.includes(key)) {
                    acc[key] = person[key];
                }
                delete acc["organization"];
                return acc;
            }, {} as Person);
            return person;
        });

        const uniqueCleanPeople = cleanPeople.reduce((acc: Person[], current: Person) => {
            if (!acc.some((person) => person.id === current.id)) {
                acc.push(current);
            }
            return acc;
        }, []);

        const juniorPeople = uniqueCleanPeople.filter((person: Person) => {
            const title = person.title?.toLowerCase() || "";
            const headline = person.headline?.toLowerCase() || "";
            return title.includes("junior") || headline.includes("junior") ||
                title.includes("entry") || headline.includes("entry");
        });
        const juniorCompanyIds = juniorPeople.reduce((acc: string[], current: Person) => {
            if (!acc.includes(current.organization_id) && current.organization_id) {
                acc.push(current.organization_id);
            }
            return acc;
        }, [] as string[]);

        const dbResponse = await supabaseAdmin
            .from("people")
            .upsert(uniqueCleanPeople, {onConflict: "id"})
            .select("*");
        await supabaseAdmin
            .from("organizations")
            .update({fetched_people: true})
            .in("id", companyIds);
        await supabaseAdmin
            .from("organizations")
            .update({hires_juniors: true})
            .in("id", juniorCompanyIds);
        if (dbResponse.error) {
            throw dbResponse.error;
        }
        const people = dbResponse.data;
        console.log("More People saved:", dbResponse.data.length);
        return people;
    } catch (e) {
        console.error("Failed to get company people:", e);
        return [];
    }
};

export const addLocation = onCall({timeoutSeconds: 900, memory: "4GiB"}, async (request: any) => {
    const startMemory = process.memoryUsage();
    console.log("Starting memory usage:", startMemory);
    const {location, userId} = request.data;
    console.log("Received data:", {
        locationData: JSON.stringify(location),
        userId,
    });
    console.log("Location: ", location);
    console.log("user: ", userId);
    try {
        const supabaseAdmin = createAdminClient();
        let newLocation = {} as any;
        const {data: existingLocation, error: locationError} = await supabaseAdmin
            .from("locations")
            .select("*")
            .eq("formatted_address", location.formatted_address.toLowerCase())
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
            .insert([{
                user_id: userId,
                location_id: newLocation.id,
                localized_formatted_address: location.localized_formatted_address,
            }]);
        if (error) {
            throw error;
        }
        let allPeople = [] as Person[];
        const allOrgs = [] as Organization[];
        const allOrgWebsites = {} as any;
        const startingPage = newLocation.page || 1;
        let currentPage = startingPage;
        const country =
            location.address_components.find((component: any) => component.types.includes("country"))?.long_name;
        const countriesWithStates =
            ["Canada", "United States", "Australia", "India", "Brazil", "Mexico", "Germany"];
        let apiLocation = location.formatted_address;
        if (!countriesWithStates.includes(country)) {
            const city =
                location.address_components.find((component: any) => component.types.includes("locality"))?.long_name;
            apiLocation = `${city}, ${country}`;
        }
        console.log("API Location:", apiLocation);
        const perPage = 100;
        let totalPages = startingPage + 1;
        const newCompanies = new Set<string>([]);
        while ((currentPage <= (20 + startingPage)) && (currentPage <= totalPages) && (newCompanies.size < 200)) {
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
                    organization_num_employees_ranges: ["11,1000"],
                    person_locations: apiLocation,
                }),
            });


            const data = await response.json();
            if (response.ok) {
                allPeople = allPeople.concat(data.people);
                totalPages = data.pagination.total_pages;
                currentPage += 1;
            } else {
                console.error("Error fetching data:", data);
                break;
            }
            data.people.forEach((person: { organization?: { id: string } }) => {
                if (person.organization?.id) {
                    newCompanies.add(person.organization.id);
                }
            });
        }
        if (currentPage >= totalPages) {
            currentPage = 0;
        }
        updateLocation({...newLocation, page: currentPage});
        // Deduplicate allPeople based on id
        allPeople = allPeople.reduce((uniquePeople: Person[], person: Person) => {
            if (!uniquePeople.some((p) => p.id === person.id)) {
                uniquePeople.push(person);
            }
            return uniquePeople;
        }, []);
        allPeople = allPeople.map((person:any) => {
            if (person.organization &&
                !allOrgs.find((org) => org.id === person.organization.id)
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
        console.log("All cleaned people:", allPeople.length);
        const allUrls = Object.keys(allOrgWebsites);
        const peopleLabsData = [] as any;
        for (let i = 0; i < allUrls.length; i += 100) {
            const urls = allUrls.slice(i, i + 100);
            const data = await getPeopleLabsData(urls);
            peopleLabsData.push(...data);
        }
        console.log("PeopleLabs data:", peopleLabsData.length);
        const allOrganizations = allOrgs.map((org: any) => {
            const cleanedOrg = {} as any;
            for (const key of validOrganizationKeys) {
                cleanedOrg[key] = org[key];
            }
            const peopleLabsOrg = peopleLabsData.find((p: any) => p.website === cleanedOrg.website_url);

            cleanedOrg.hires_in = [newLocation.id];
            cleanedOrg.sanitized_phone = org.sanitized_phone;
            if (peopleLabsOrg) {
                cleanedOrg.industry = peopleLabsOrg.industry;
                cleanedOrg.size = peopleLabsOrg.size;
                cleanedOrg.founded_year = cleanedOrg.founded_year || peopleLabsOrg.founded_year;
                cleanedOrg.locality = peopleLabsOrg.locality || location.locality;
                cleanedOrg.region = peopleLabsOrg.region || location.region;
                cleanedOrg.country = peopleLabsOrg.country || location.country;
                cleanedOrg.linkedin_url = cleanedOrg.linkedin_url || peopleLabsOrg.linkedin_url;
            }
            return cleanedOrg;
        });
        console.log("All organizations:", allOrganizations.map((org: any) => org.id));
        console.log("All Orgs Length:", allOrganizations.length);
        const allNewPeople = await getCompanyPeople(allOrganizations.map((org: any) => org.id));
        console.log("All new people:", allNewPeople.length);
        const enqueueResult = await enqueueScrapingTasks(allUrls);
        console.log("Enqueue result:", enqueueResult);
        console.log("Organizations found:", allOrganizations.length);
        await saveOrganizations(allOrganizations);
        await savePeople(allPeople);
        console.log("People found:", allPeople.length);
        const endMemory = process.memoryUsage();
        console.log("Memory usage delta:", {
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            rss: endMemory.rss - startMemory.rss,
        });
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
            .from("organizations").upsert(organizations, {
                onConflict: "id",
                ignoreDuplicates: false,
            }).select();
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
    const addressComponents = place.english_address_components || place.address_components;
    const formattedAddress = place.english_formatted_address || place.formatted_address;
    return {
        locality: addressComponents
            ?.find((component: any) => component.types.includes("locality"))
            ?.long_name?.toLowerCase(),
        admin_area_level_1: addressComponents
            ?.find((component: any) => component.types.includes("administrative_area_level_1"))
            ?.long_name?.toLowerCase(),
        admin_area_level_2: addressComponents
            ?.find((component: any) => component.types.includes("administrative_area_level_2"))
            ?.long_name?.toLowerCase(),
        country: addressComponents
            ?.find((component: any) => component.types.includes("country"))
            ?.long_name?.toLowerCase(),
        formatted_address: formattedAddress?.toLowerCase(),
    };
};

export const updateLocation = async (location: any) => {
    const supabaseAdmin = createAdminClient();
    try {
        const {data, error} = await supabaseAdmin
            .from("locations")
            .update(location)
            .eq("id", location.id)
            .select();
        if (error) {
            console.error("Error during update:", JSON.stringify(error));
            throw error;
        }
        return data?.[0];
    } catch (e) {
        console.error(`Failed to update locations: ${JSON.stringify(e)}`);
        return [];
    }
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

export const scrapeEmails = onCall({timeoutSeconds: 300, memory: "4GiB"}, async (request: any) => {
    const {websites} = request.data;
    console.log("Scraping emails for websites:", websites);
    try {
        const result = await enqueueScrapingTasks(websites);
        console.log("Enqueue result:", result);
        return {message: "Email scraping tasks enqueued"};
    } catch (e) {
        console.error("Error scraping emails:", e);
        return [];
    }
});

export const enqueueScrapingTasks = async (websites: string[]) => {
    if (!websites || !Array.isArray(websites)) {
        return {error: "Invalid request: Missing websites"};
    }

    const project = "jobs-bored-47992";
    const location = "us-central1"; // Update to your Cloud Functions region
    const queue = "email-scraping-queue"; // Name of your Cloud Tasks queue

    const parent = tasksClient.queuePath(project, location, queue);

    const tasks = websites.map((websiteUrl: string) => {
        const payload = {startUrl: websiteUrl};

        // Construct the request body
        const task: any = {
            httpRequest: {
                httpMethod: "POST",
                url: `https://${location}-${project}.cloudfunctions.net/emailScraper`,
                headers: {"Content-Type": "application/json"},
                body: Buffer.from(JSON.stringify(payload)),
                // Optionally, add authentication
                // oidcToken: {
                //     serviceAccountEmail: "<your-service-account>@<project-id>.iam.gserviceaccount.com",
                // },
                dispatchDeadline: {
                    seconds: 1800, // 30 minutes
                },
            },
        };

        return tasksClient.createTask({parent, task});
    });

    try {
        // Wait for all tasks to be created
        await Promise.all(tasks);
        console.log("Tasks created successfully");
        return {message: "Tasks created successfully"};
    } catch (error) {
        console.error("Error creating tasks:", error);
        return {error: "Error creating tasks"};
    }
};

export const emailScraper = onRequest({timeoutSeconds: 400, memory: "4GiB"}, async (req, res) => {
    try {
        const supabaseAdmin = createAdminClient();
        if (req.method !== "POST") {
            res.status(405).send("Method Not Allowed");
            return;
        }
        const {startUrl} = req.body;
        if (!startUrl) {
            console.log("No start URL provided.");
            res.status(400).send("Bad Request: Missing startUrl");
            return;
        }
        console.log("Starting URL:", startUrl);

        const maxDepth = 2;
        const maxLinksPerPage = 20;
        const maxPages = 50;
        const maxContentLength = 1024 * 1024 * 2;
        let pagesProcessed = 0;
        const startTime = Date.now();
        const maxDuration = 120 * 1000; // 2 minute in milliseconds

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
            res.status(400).send("Bad Request: Invalid startUrl");
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

            if (pagesProcessed >= maxPages) {
                console.log("Max pages processed.");
                break;
            }

            const nextItem = queue.shift();
            if (!nextItem) {
                continue;
            }

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const {url, depth} = nextItem;

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
                    maxContentLength: maxContentLength,
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
                            if (linksToFollow.length >= maxLinksPerPage) {
                                return false;
                            }
                        }
                    }
                    return;
                });

                // Add new URLs to the queue with incremented depth
                for (const link of linksToFollow) {
                    queue.push({url: link, depth: depth + 1});
                }
            } catch (error) {
                console.log(`Error fetching ${url}:`, (error as Error).message);
                continue;
            }
            pagesProcessed++;
        }

        console.log("Emails found:", Array.from(emails));

        const {error} = await supabaseAdmin
            .from("organizations")
            .update({emails: Array.from(emails)})
            .eq("website_url", startUrl);

        if (error) {
            console.error("Error updating emails:", error);
            res.status(500).send("Internal Server Error");
            return;
        }

        res.status(200).send("Email Scraping Completed Successfully");
    } catch (e) {
        console.error("Error scraping emails:", e);
        res.status(500).send("Internal Server Error");
    }
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
