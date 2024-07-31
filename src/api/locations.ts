
import { getOrganizations } from "./apolloOrganizations";
import { getLocalPeople } from "./apolloPeople";

export const addLocation = async (location: string) => {
    const localPeople = await getLocalPeople(location);
    const organizationIds = localPeople.map(person => person.organization_id);
    localPeople.forEach(person => {
        person.employment_history.forEach((employment:any) => {
            organizationIds.push(employment.organization_id);
        });
    })
    const orgData = await getOrganizations(organizationIds);

}