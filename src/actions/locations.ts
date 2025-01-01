
'use server'
import { functions } from "../utils/firebase/firebase";
import { httpsCallable } from "firebase/functions";
import { supabaseAdmin } from "../utils/supabase/admin";

export const addLocation = async (location: google.maps.places.PlaceResult, userId: string) => {
    try{
        const addLocation = httpsCallable(functions, 'addLocation');  
        
        console.log("location", location)
        console.log("userId", userId)
        await addLocation({location, userId});
        return location;   
    }
    catch (e) {
        throw new Error(`${e}`);
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