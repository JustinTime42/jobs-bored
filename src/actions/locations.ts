'use server'
import { functions } from "../utils/firebase/firebase";
import { httpsCallable } from "firebase/functions";
import { supabaseAdmin } from "../utils/supabase/admin";

export const addLocation = async (location: any, userId: string) => {
    try{
        const addLocation = httpsCallable(functions, 'addLocation');  
        console.log("Calling Firebase function with:", {
            location: JSON.stringify(location),
            userId
        });

        console.log("location", location)
        console.log("userId", userId)
        const response = await addLocation({location, userId});
        console.log("Firebase function response:", response);
        return location;   
    }
    catch (e) {
        throw new Error(`${e}`);
    }
} 

export const populateOrganizations = async () => {
    const processOrganizations = async () => {
        const populateOrganizations = httpsCallable(functions, 'populateOrganizations');
        const { data, error } = await supabaseAdmin
        .from('organizations')
        .select('*')
        .eq('fetched_people', false)
        .limit(500);
        
        console.log("Number of companies selected:", data?.length);
        if (error) {
            throw error;
        }

        // If no data or empty array, stop the process
        if (!data || data.length === 0) {
            console.log("No more organizations to process. Stopping.");
            return false;
        }

        const results = await populateOrganizations({organizationIds: data.map((org: any) => org.id)});
        console.log(results);
        return true;
    };

    // Initial run
    let shouldContinue = await processOrganizations();
    
    // Set up interval to run every 5 minutes if there are still organizations to process
    if (shouldContinue) {
        const intervalId = setInterval(async () => {
            try {
                shouldContinue = await processOrganizations();
                if (!shouldContinue) {
                    console.log("Process completed. Clearing interval.");
                    clearInterval(intervalId);
                }
            } catch (error) {
                console.error("Error in scheduled organization processing:", error);
                clearInterval(intervalId);
            }
        }, 5 * 60 * 1000); // 5 minutes in milliseconds
        
        // Return the interval ID in case you want to clear it externally
        return intervalId;
    }
}

// moved all the below to firebase functions
export const saveLocation = async (location: google.maps.places.PlaceResult, userId: string ) => {

    const locationDetails = {
        locality: location.address_components
            ?.find((component: any) => component.types.includes("locality"))
            ?.long_name,
        admin_area_level_1: location.address_components
            ?.find((component: any) => component.types.includes("administrative_area_level_1"))
            ?.long_name,
        admin_area_level_2: location.address_components
            ?.find((component: any) => component.types.includes("administrative_area_level_2"))
            ?.long_name,
        country: location.address_components
            ?.find((component: any) => component.types.includes("country"))
            ?.long_name,
        formatted_address: location.formatted_address,
    };
    try {
        // @TODO - handle if location already exists, still need to add to user_locations, and need to try to get more devs from that location
        const {data: locationData, error: locationError} = await supabaseAdmin
            .from("locations")
            .upsert(locationDetails,
                {
                    onConflict: 'locality, admin_area_lvl1, country',
                    ignoreDuplicates: false, 
                })
            .select();

        const { data, error } = await supabaseAdmin
            .from('users_locations')
            .insert([
              { user_id: userId, location_id: locationData?.[0].id },
        ]);
        if (error || locationError) {
            console.error("Error during upsert:", JSON.stringify(error));
            throw error;
        }
        return data?.[0];
    } catch (e) {
        console.error(`Failed to save locations: ${JSON.stringify(e)}`);
        return [];
    }
};