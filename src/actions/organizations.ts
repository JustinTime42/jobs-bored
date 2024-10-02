'use server'
import { httpsCallable } from 'firebase/functions';
import { Organization } from '../definitions';
import { supabaseAdmin } from '../utils/supabase/admin';
import { supabase } from '../utils/supabase/client';
import { functions } from '../utils/firebase/firebase';

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
    const localities = locations.map(location => location.toLowerCase());
    const { data, error } = await supabaseAdmin
    .rpc('get_organizations_with_scores', {
        location_ids: locations.map(loc => loc.toLowerCase())
      });   
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

export const scrapeEmails = async (startUrl: string) => {
    try {
        const emailScraper = httpsCallable(functions, 'emailScraper');
        const { data } = await emailScraper({startUrl});
        return data;
    }
    catch (e) {
        throw new Error(`Failed to scrape emails: ${e}`);
    }
}

export const scrapeEmailsALL = async () => {
    try {
        let from = 0;
        const pageSize = 1000;
        let allData:any = [];
        let hasMoreData = true;

        while (hasMoreData) {
            const { data, error } = await supabaseAdmin
                .from('organizations')
                .select('website_url')
                .not('website_url', 'is', null)
                .range(from, from + pageSize - 1);

            if (error) {
                console.error('Error fetching data:', error);
                break;
            }

            if (data.length > 0) {
                allData = allData.concat(data);
                from += pageSize;
            } else {
                hasMoreData = false;
            }
            console.log('Scraping emails for:', Object.keys(data));
        }
        console.log("Data length", allData.length)
        console.log("First Element", allData[0])
        await scrapeEmails(allData[5].website_url);
        await scrapeEmails(allData[0].website_url);
        allData.forEach(async (org: {website_url:string}, i: number) => {
            setTimeout(async () => {
                await scrapeEmails(org.website_url);
            }, i * 100);
        });
    }
    catch (e) {
        throw new Error(`Failed to scrape emails: ${e}`);
    }
}