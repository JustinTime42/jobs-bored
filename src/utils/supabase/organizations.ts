import { supabaseAdmin } from "./admin";

export const saveOrganizations = async (organizations: any[]) => {
    console.log("Saving organizations")
    console.log("first org: ", organizations[0])
    try {
        const { data, error } = await supabaseAdmin.from("organizations").upsert(organizations).select();
        if (error) {
            console.log(JSON.stringify(error));
            throw error;
        }
        return data;
    } catch (e) {
        console.error(`Failed to save organizations: ${e}`);
        return [];
    }
};

export const getLocalOrganizations = async (location: string) => {
    const { data, error } = await supabaseAdmin.from("organizations").select('*').contains('hires_in', [location]);
    if (error) {
        throw error;
    }
    return data;
};