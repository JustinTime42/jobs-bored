'use server'
import { orgType } from '../app/dashboard/page';
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

export const getCompanyDetails = async (orgId: string, userId: string) => {
    const { data , error } = await 
        supabaseAdmin
        .from('organizations')
        .select('*, user_organizations(*)')
        .eq('id', orgId);
    if (error) {
        console.error('Error fetching company details:', error);
        throw error;
    }
    console.log(data)
    return data[0] as Organization;
}

export const addCompanyToFavorites = async (userId: string, companyId: string) => {
    const { data, error } = await supabaseAdmin
    .from('user_organizations').insert([{user_id: userId, organization_id: companyId}]);
    if (error) {
        throw new Error(`Failed to add company to favorites: ${error}`);;
    }
    return data;
}

export const removeCompanyFromFavorites = async (userId: string, companyId: string) => {
    const { data, error } = await supabaseAdmin
    .from('user_organizations')
    .delete()
    .eq('user_id', userId)
    .eq('organization_id', companyId);
    if (error) {
        throw new Error(`Failed to remove company from favorites: ${error}`);
    }
    return data;
}

export const getFavoriteCompanies = async (userId: string) => {
    const { data, error } = await supabaseAdmin
    .from('user_organizations')
    .select('details:organizations(*)')
    .eq('user_id', userId);
    if (error) {
        throw new Error(`Failed to get favorite companies: ${error}`);
    }
    return data;
}