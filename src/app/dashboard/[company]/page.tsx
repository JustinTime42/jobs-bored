'use client'
import { addCompanyToFavorites, getCompanyDetails, removeCompanyFromFavorites, scrapeEmails, scrapeEmailsALL } from "@/src/actions/organizations";
import { useEffect, useState } from "react";
import ExternalLink from "@/src/components/Link/ExternalLink";
import { Organization, Person } from "@/src/definitions";
import styles from './CompanyPage.module.css';
import { getPeopleInOrganization } from "@/src/actions/people";
import AsyncButton from "@/src/components/async_button/AsyncButton";
import { getCompanyPeople, getPersonEmails } from "@/src/actions/apolloPeople";
import { useUserContext } from "../../context/UserContext";

const CompanyPage = ({ params }: { params: {company: string}}) => {
    const { user, loading: userLoading, error: userError, fetchUser } = useUserContext();
    const [companyDetails, setCompanyDetails] = useState<Organization | null>(null);
    const [people, setPeople] = useState<Person[]>([]);
    const [isFavorite, setIsFavorite] = useState<boolean>(false);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        if (!user) {
            return;
        }
        getCompanyDetails(params.company, user.id).then((data) => {
            setCompanyDetails(data);
            setIsFavorite(data.user_organizations?.some((org) => org.user_id === user.id) || false);
        });
        getPeopleInOrganization(params.company).then((data) => {
            setPeople(data);
        });
    }, [params.company, JSON.stringify(user)]);

    const handleGetEmail = async (id: string) => {
        await getPersonEmails(id)
        return await getPeopleInOrganization(params.company).then((data) => {
            setPeople(data);
        });
    }

    const handleAddToFavorites = async () => {
        await addCompanyToFavorites(user.id, params.company);
        return setIsFavorite(true);
    }
    const handleRemoveFromFavorites = async () => {
        await removeCompanyFromFavorites(user.id, params.company);
        return setIsFavorite(false);
    }

    const handleGetCompanyPeople = async () => {
        const people = await getCompanyPeople(params.company);
        getCompanyDetails(params.company, user.id).then((data) => {
            setCompanyDetails(data);
        });

        return setPeople(people);
    }

    const handleScrapeEmails = async () => {
        return await scrapeEmailsALL();
    }

    if (!companyDetails) {
        return <p>Loading...</p>;
    }
    return (
        <>
        <div className={styles.company}>          
            <div>
                <div><h3>{companyDetails.name}</h3>
                    {
                    isFavorite ? <AsyncButton label="Remove Favorite" asyncAction={handleRemoveFromFavorites} />:
                    <AsyncButton label="Add To Favorites" asyncAction={handleAddToFavorites} />
                    } 
                 </div>
                {companyDetails.website_url && <ExternalLink href={companyDetails.website_url}>Website</ExternalLink>}
                {companyDetails.linkedin_url && <ExternalLink href={companyDetails.linkedin_url}>LinkedIn</ExternalLink>}
                {companyDetails.twitter_url && <ExternalLink href={companyDetails.twitter_url}>Twitter</ExternalLink>}
                {companyDetails.facebook_url && <ExternalLink href={companyDetails.facebook_url}>Facebook</ExternalLink>}
                
            </div>
            <div>
                {companyDetails.phone && <p>{companyDetails.phone}</p>}
                {companyDetails.emails && <div className={styles.emails}>{companyDetails.emails.map(email => <a key={email} href={`mailto:${email}`}>{email}</a>)}</div>}
                {/* <AsyncButton label="scrape emails" asyncAction={handleScrapeEmails} /> */}
            </div>
            <img className={styles.company_logo} src={companyDetails.logo_url} alt={companyDetails.name} />

        </div>
        <div>
            {
                !companyDetails.fetched_people && <AsyncButton label="Find More People" asyncAction={handleGetCompanyPeople} />
            }            
            {people.map((person) => (
                <div key={person.id} className={styles.person}>
                    <img className={styles.person_photo} src={person.photo_url} alt={person.name} />
                    <div>
                        <p>{person.name}</p>
                        <p>{person.title && `Title: ${person.title}`}</p>
                        <p>{person.headline && `Headline: ${person.headline}`}</p>
                        <p>{person.city && person.city}{person.state && `, ${person.state}`} </p>
                        
                    </div>
                    <div>
                        {person.linkedin_url && <ExternalLink href={person.linkedin_url }>LinkedIn</ExternalLink>}
                        {person.facebook_url && <ExternalLink href={person.facebook_url}>Facebook</ExternalLink>}
                        {person.twitter_url && <ExternalLink href={person.twitter_url}>Twitter</ExternalLink>}
                        {person.github_url && <ExternalLink href={person.github_url}>GitHub</ExternalLink>}
                        {person.email !== "Email Unavailable" ? <p><a href={`mailto:${person.email}`}>{person.email}</a></p> :
                        <p>{person.email}</p>}
                        
                    </div>
                    {!person.email &&
                        <div>
                            <AsyncButton label="Find Email" asyncAction={() => handleGetEmail(person.id)}  />
                        </div>
                    }

                        

                </div>
            ))}
        </div>
    </>
    );
};

export default CompanyPage;