
'use server'
import { Organization } from "../definitions";
import { saveOrganizations } from "./organizations";
import { savePeople } from "./people";
import { getLocalPeople } from "./apolloPeople";
import { functions } from "../utils/firebase/firebase";
import { httpsCallable, getFunctions } from "firebase/functions";

export const addLocation = async (location: string) => {
    try{
        const addLocation = httpsCallable(functions, 'addLocation');        
        addLocation({location: location});
        return location;   
    }
    catch (e) {
        throw new Error(`${e}`);
    }
} 