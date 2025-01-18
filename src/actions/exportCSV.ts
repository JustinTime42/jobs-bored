'use server'
import { supabaseAdmin } from "../utils/supabase/admin";

export const generateCSV = async (orgIds: string[]) => {

    const { data, error } = await supabaseAdmin
    .rpc('get_organizations_and_people', {
        org_ids_text: orgIds
    });
    if (error) {
        console.error('Error fetching organizations:', error);
        throw error;
    }
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