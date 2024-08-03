'use server'

import { Organization, Person } from "../definitions";

const validOrganizationKeys = [
	"id",
	"created_at",
	"name",
	"website_url",
	"linkedin_url",
	"twitter_url",
	"facebook_url",
	"primary_phone",
	"hires_in"
];
const validPersonKeys = [
	"id",
	"created_at",
	"name",
	"first_name",
	"last_name",	
	"title",
	"linkedin_url",
	"twitter_url",
	"facebook_url",
	"github_url",
	"photo_url",
	"state",
	"city",
	"country",
	"primary_phone",
	"organization_id",
	"organization"
];
export const getLocalPeople = async (location: string) => {
    try {
        let allPeople = [] as Person[];
        let page = 1;
        const perPage = 100; // Number of results per page
        let totalPages = 1;
      
        while (page <= 1) {
			const response = await fetch("https://api.apollo.io/v1/mixed_people/search", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
					'X-Api-Key': process.env.APOLLO_API_KEY!
				},
				body: JSON.stringify({
				page: page,
				per_page: perPage,
				person_titles: ["Web Developer", "programmer", "software developer", "software engineer"],
				person_locations: [location]
				})
			});
		
			const data = await response.json();
			const people = data.people.map((person: any) => {				
				person.primary_phone = person.phone_numbers?.[0]?.sanitized_number;
				if (person.organization) {
					person.organization.primary_phone = person.organization?.primary_phone?.sanitized_number
					person.organization.hires_in = [location];
					person.organization = Object.keys(person.organization).reduce((acc:any, key) => {
						if (validOrganizationKeys.includes(key)) {
							acc[key] = person.organization[key];
						}
						return acc;
					}, {} as Organization);
				}
				person = Object.keys(person).reduce((acc:any, key) => {
					if (validPersonKeys.includes(key)) {
						acc[key] = person[key];
					}
					return acc;
				}, {} as Person)
				return person
			})
			if (response.ok) {
				allPeople = allPeople.concat(people);
				totalPages = data.pagination.total_pages;
				page += 1;
			} else {
				console.error('Error fetching data:', data);
				break;
			}
        }
        return allPeople;
        
    } catch (e) {
        console.error(e);
        return []
    }
};