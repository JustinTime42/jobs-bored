
'use server'
import { Organization } from "../definitions";
import { saveOrganizations } from "../utils/supabase/organizations";
import { savePeople } from "../utils/supabase/people";
import { getOrganizations } from "./apolloOrganizations";
import { getLocalPeople } from "./apolloPeople";

export const addLocation = async (location: string) => {
    try{
        const localPeople = await getLocalPeople(location);
        const organizations = [] as Organization[];
        localPeople.forEach(person => {
            const isOrganizationAlreadyAdded = organizations.some(organization => organization.id === person.organization_id);
            if (!isOrganizationAlreadyAdded) {
                organizations.push(person.organization);
            }
        })
        await saveOrganizations(organizations);
        await savePeople(localPeople);
        
    }
    catch (e) {
        throw new Error(`error: ${e}`);
    }
    return "Success";

}