
'use server'
import { Organization } from "../definitions";
import { saveOrganizations } from "./organizations";
import { savePeople } from "./people";
import { getOrganizations } from "./apolloOrganizations";
import { getLocalPeople } from "./apolloPeople";

export const addLocation = async (location: string) => {
    try{
        const localPeople = await getLocalPeople(location);
        const organizations = [] as Organization[];        
        localPeople.forEach(person => {
            const isOrganizationAlreadyAdded = organizations.some(organization => organization.id === person.organization_id);
            if (!isOrganizationAlreadyAdded && person.organization?.id) {               
                organizations.push(person.organization);
            }
        })
        await saveOrganizations(organizations);
        console.log("Finished saving organizations")
        await savePeople(localPeople.filter(person => person.organization?.id));
        // const urls = organizations.map(organization => organization.website_url);
        // const lambdaKey = process.env.LAMDA_KEY || ''; 
        // fetch("https://yc3errea4a.execute-api.us-east-1.amazonaws.com/default/scraper_http_handler", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //         "cache-control": "no-cache",
        //         "X-Api-Key": lambdaKey
        //     },
        //     body: JSON.stringify({ "urls": urls })
        // })    
        return localPeople;   
    }
    catch (e) {
        throw new Error(`Location error: ${e}`);
    }
} 