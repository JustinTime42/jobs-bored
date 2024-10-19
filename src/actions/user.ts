'use server'
import { supabaseAdmin } from "../utils/supabase/admin";
import { supabase } from "../utils/supabase/client";

export const getUserDetails = async (uid: string) => {

    const { data: userData } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

    if (!userData) {
        throw new Error('User not found');
    }
    try {
        const {data, error} = await supabaseAdmin
            .from('users_locations')
            .select('locations(*)')
            .eq('user_id', uid);
        if (error) throw error;
        const locations = data.map((l: any) => l.locations);
        console.log("locations", locations)
        console.log("data", data)
        return { ...userData, locations: locations};
    } catch (error) {
        console.error('Error fetching locations:', error);
    }
};

export const createUserDetails = async (user: any) => {
    const { data, error } = await supabaseAdmin
        .from("users")
        .insert(user)
        .single();
    if (error) throw error;
    return data;
}

export const updateUserDetails = async (user: any) => {
    const { data, error } = await supabaseAdmin
        .from("users")
        .update(user)
        .eq("id", user.id)
        .single();
    if (error) throw error;
    return user;
}

export const generateCSV = async (locations: string[]) => {
    console.log(locations)
    const { data, error } = await supabaseAdmin
    .rpc('get_organizations_and_people', {
        location_ids_text: locations
    });
    if (error) {
        console.error('Error fetching organizations:', error);
        throw error;
    }
    console.log("data", data)
    // Convert data to CSV format
    const headers = ['name', 'website_url', 'linkedin_url', 'email']
    const csvRows = [headers.join(',')]
    data.forEach((row: any) => {
        const values = headers.map(header => {
            const escaped = ('' + row[header]).replace(/"/g, '\\"')
            return `"${escaped}"`
        })
        csvRows.push(values.join(','))
    })
    return csvRows.join('\n');
}