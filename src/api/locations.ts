
'use server'
import { functions } from "../utils/firebase/firebase";
import { httpsCallable } from "firebase/functions";
import { Suggestion } from "use-places-autocomplete";
import { supabaseAdmin } from "@/functions/src/supabase";

export const addLocation = async (location: google.maps.places.PlaceResult, locationId: any) => {
    try{
        const addLocation = httpsCallable(functions, 'addLocation');        
        addLocation({location: {...location, locationId}});
        return location;   
    }
    catch (e) {
        throw new Error(`${e}`);
    }
} 

export const saveLocation = async (location: google.maps.places.PlaceResult) => {
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
        const {data, error} = await supabaseAdmin
            .from("locations")
            .upsert(locationDetails)
            .select('id');
        if (error) {
            console.error("Error during upsert:", JSON.stringify(error));
            throw error;
        }
        return data[0];
    } catch (e) {
        console.error(`Failed to save locations: ${JSON.stringify(e)}`);
        return [];
    }
};