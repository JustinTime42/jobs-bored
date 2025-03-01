'use server'
import { httpsCallable } from 'firebase/functions';
import { Organization } from '../definitions';
import { supabaseAdmin } from '../utils/supabase/admin';
import { functions } from '../utils/firebase/firebase';

export const saveOrganizations = async (organizations: any[]) => {

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

export const getLocalOrganizations = async (
    locations: string[] | null, 
    userId: string | null, 
    localities: string[] | null, 
    page_size: number, 
    previous_score: number | null, 
    previous_id: string | null,
    favoritesOnly: boolean = false
) => {
    if (!userId) throw new Error('User ID is required');
    
    console.log('getLocalOrganizations params:', {
        locations,
        userId,
        localities,
        page_size,
        previous_score,
        previous_id,
        favoritesOnly
    });
    
    // Try a simpler query first to check if organizations exist
    const { data: orgCheck, error: orgCheckError } = await supabaseAdmin
        .from('organizations')
        .select('id, hires_in')
        .limit(5);
        
    console.log('Organization check:', {
        orgs: orgCheck,
        error: orgCheckError?.message || null
    });
    
    // Check if any organizations match the location_ids
    if (locations && locations.length > 0) {
        const { data: orgLocCheck, error: orgLocCheckError } = await supabaseAdmin
            .from('organizations')
            .select('id, name, hires_in')
            .overlaps('hires_in', locations)
            .limit(5);
            
        console.log('Organizations with matching locations:', {
            orgs: orgLocCheck,
            error: orgLocCheckError?.message || null
        });
    }
    
    // Check if the location exists
    if (locations && locations.length > 0) {
        const { data: locCheck, error: locCheckError } = await supabaseAdmin
            .from('locations')
            .select('id, locality')
            .in('id', locations)
            .limit(10);
            
        console.log('Location check:', {
            locations: locCheck,
            error: locCheckError?.message || null
        });
    }
    
    // Check if the user exists
    const { data: userCheck, error: userCheckError } = await supabaseAdmin
        .from('users')
        .select('id, is_junior')
        .eq('id', userId)
        .single();
        
    console.log('User check:', {
        user: userCheck,
        error: userCheckError?.message || null
    });
    
    // Check if the user has any favorites
    const { data: favCheck, error: favCheckError } = await supabaseAdmin
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', userId)
        .limit(5);
        
    console.log('User favorites check:', {
        favorites: favCheck,
        error: favCheckError?.message || null
    });
    
    // Now try a simpler version of the RPC call
    try {
        const { data, error } = await supabaseAdmin
        .rpc('get_organizations_with_filters_and_scores', {
            location_ids: locations,
            user_param_id: userId,
            filter_locality: localities?.length === 0 ? null : localities,
            page_size: page_size,
            previous_score: previous_score,
            previous_id: previous_id,
            favorites_only: favoritesOnly
          });   
        
        console.log('getLocalOrganizations result:', {
            dataLength: data?.length || 0,
            error: error?.message || null
        });
        
        if (error) {
            console.error('Error fetching organizations:', error);
            throw error;
        }
        return data;
    } catch (e) {
        console.error('Exception in getLocalOrganizations:', e);
        throw e;
    }
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
    return data.map((d: any) => d.details) as Organization[];
}

export const scrapeEmails = async (startUrls: string[]) => {
    try {
        const emailScraper = httpsCallable(functions, 'scrapeEmails');
        const { data } = await emailScraper({websites:startUrls});
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
        }
        const website_urls = allData.map((org: {website_url:string}) => org.website_url);
        scrapeEmails(website_urls);
    }
    catch (e) {
        throw new Error(`Failed to scrape emails: ${e}`);
    }
}