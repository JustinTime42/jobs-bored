'use server'
import { supabaseAdmin } from "../utils/supabase/admin";

export const savePeople = async (people: any[]) => {

    const peopleWithoutOrg = Array.from(new Map(
        people.map(person => {
            delete person.organization;
            return [person.id, person];
        })
    ).values());

    try {
        const { data, error } = await supabaseAdmin
            .from("people")
            .upsert(peopleWithoutOrg, { onConflict: 'id' });

        if (error) {
            console.error("Error during upsert:", JSON.stringify(error));
            throw error;
        }

        // Instead of directly calling the Firebase function, we'll handle this server-side
        // or we can call a separate server action if needed
        // for (const person of peopleWithoutOrg) {
        //     await detectTechKeywordsAndUpdateOrg(person);
        // }

        return data;
    } catch (e) {
        console.error(`Failed to save people: ${JSON.stringify(e)}`);
        return [];
    }
};

export const getPeopleInOrganization = async (organizationId: string) => {
    const { data, error } = await supabaseAdmin
        .from("people")
        .select("*")
        .eq("organization_id", organizationId);

    if (error) {
        console.error("Error fetching people:", error);
        throw error;
    }

    return data;
};