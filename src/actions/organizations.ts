'use server'
import { httpsCallable } from 'firebase/functions';
import { Organization } from '../definitions';
import { supabaseAdmin } from '../utils/supabase/admin';
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

export const getLocalOrganizations = async (locations: string[] | null, userId: string | null, localities: string[] | null, page_size: number, previous_score: number | null, previous_id: string | null) => {
    console.log("Getting local organizations", locations)
    console.log("Getting local organizations", localities)
    
    const { data, error } = await supabaseAdmin
    .rpc('get_organizations_with_filters_and_scores', {
        location_ids: locations,
        user_param_id: userId,
        filter_locality: localities?.length === 0 ? null : localities,
        page_size: page_size,
        previous_score: previous_score,
        previous_id: previous_id
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
    console.log(data)
    return data.map((d: any) => d.details) as Organization[];
}

export const scrapeEmails = async (startUrls: string[]) => {
    try {
        const emailScraper = httpsCallable(functions, 'scrapeEmails');
        const { data } = await emailScraper({websites:startUrls});
        console.log("Emails scraped:", data);
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
                // .is('emails', null)
                .containedBy('emails', [])
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
            // console.log('Scraping emails for:', Object.keys(data));
        }
        console.log("Data length", allData.length)
        console.log("First Element", allData[0])
        const website_urls = allData.map((org: {website_url:string}) => org.website_url);
        scrapeEmails(website_urls);
    }
    catch (e) {
        throw new Error(`Failed to scrape emails: ${e}`);
    }
}