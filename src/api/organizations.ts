'use server'
import { Organization } from '../definitions';
import { supabaseAdmin } from '../utils/supabase/admin';
import { supabase } from '../utils/supabase/client';

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

export const getLocalOrganizations = async (locations: string[]) => {
    const { data, error } = await supabaseAdmin
        .from('organizations')
        .select('name, id')
        .overlaps('hires_in', locations);    
    if (error) {
        console.error('Error fetching organizations:', error);
        throw error;
    }
    return data;
};

export const getCompanyDetails = async (id: string) => {
    const { data , error } = await supabaseAdmin.from('organizations').select('*').eq('id', id);
    if (error) {
        console.error('Error fetching company details:', error);
        throw error;
    }
    return data[0] as Organization;
}