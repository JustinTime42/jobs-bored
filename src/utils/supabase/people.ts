import { supabaseAdmin } from "./admin";

export const savePeople = async (people: any[]) => {
    console.log("Saveing people")
    console.log("first person: ", people[0])
    const peopleWithoutOrg = people.map((person: any) => {
        delete person.organization;
        return person;
    });
    try {
        const { data, error } = await supabaseAdmin.from("people").insert(peopleWithoutOrg).select();
        if (error) {
            console.log(JSON.stringify(error));
        throw error;
        }
        return data;
    } catch (e) {
        console.error(`Failed to save people: ${JSON.stringify(e)}`);
        return [];
    }
    };