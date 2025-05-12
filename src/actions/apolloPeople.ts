'use server'

import { Organization, Person } from "../definitions";
import { supabaseAdmin } from "../utils/supabase/admin";

const validOrganizationKeys = [
	"id",
	"created_at",
	"name",
	"website_url",
	"linkedin_url",
	"twitter_url",
	"facebook_url",
	"sanitized_phone",
	"hires_in",
	"logo_url",
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
        while (page <= 10 && page <= totalPages) {
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
					person.organization.hires_in = [`${person.city} ${person.state} ${person.country}`];
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
        console.error("Apollo People", e);
        return []
    }
};

export const getPersonEmail = async (id: string) => {
	try {
		const requestHeaders = {
			"Content-Type": "application/json",
			"Cache-Control": "no-cache",
			"X-Api-Key": process.env.APOLLO_API_KEY!
		};
		const response = await fetch("https://api.apollo.io/v1/people/match", {
			method: 'POST',
			headers: requestHeaders,
			body: JSON.stringify({ id:id })
		});
		const responseData = await response.json();
		const emailAddress = responseData.person.email;
		// console.log('Email:', emailAddress);
		if (!emailAddress) {
			await supabaseAdmin
			.from('people').update({email: 'Email Unavailable'}).eq('id', id);
			return 'Email Unavailable';
		} else {
			const {data, error} = await supabaseAdmin
				.from('people').update({email: emailAddress}).eq('id', id);
			if (error) {
				throw error;
			}
			return emailAddress;
		}

	} catch (e) {
		console.error('Failed to get email:', e);
		return [];
	}
}

export const getCompanyPeople = async (company_id: string) => {
	try {
		const requestHeaders = {
			"Content-Type": "application/json",
			"Cache-Control": "no-cache",
			"X-Api-Key": process.env.APOLLO_API_KEY!
		};
		const response = await fetch("https://api.apollo.io/v1/mixed_people/search", {
			method: 'POST',
			headers: requestHeaders,
			body: JSON.stringify({
				organization_ids: [company_id],
				per_page: 100,
				page: 1,
				person_titles: [
					"Web Developer",
					"programmer",
					"software developer",
					"software engineer",
					"CEO",
					"CTO",
					"Technical Recruiter",
					"Human Resources"
				]

			})
		});
		const data = await response.json();
		const cleanPeople = data.people.map((person: any) => {
			person = Object.keys(person).reduce((acc:any, key) => {
				if (validPersonKeys.includes(key)) {
					acc[key] = person[key];
				}
				delete acc['organization']
				return acc;
			}, {} as Person)
			return person
		})		
		const dbResponse = await supabaseAdmin
			.from('people')
			.upsert(cleanPeople, {onConflict: 'id'})
			.select('*');
		await supabaseAdmin
			.from('organizations')
			.update({fetched_people: true})
			.eq('id', company_id);
		if (dbResponse.error) {
			throw dbResponse.error;
		}
		const people = dbResponse.data;
		
		// Process each person to detect tech keywords and update organization technologies
		for (const person of cleanPeople) {
			// Removed the call to detectTechKeywordsAndUpdateOrg
		}
		
		return people

	}
	catch (e) {
		console.error('Failed to get company people:', e);
		return [];
	}
}