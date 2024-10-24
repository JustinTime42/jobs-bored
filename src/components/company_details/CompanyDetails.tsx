'use client'
import { addCompanyToFavorites, getCompanyDetails, removeCompanyFromFavorites, scrapeEmails, scrapeEmailsALL } from "@/src/actions/organizations";
import { useEffect, useState } from "react";
import ExternalLink from "@/src/components/Link/ExternalLink";
import { Organization, Person } from "@/src/definitions";
import styles from './CompanyPage.module.css';
import { getPeopleInOrganization } from "@/src/actions/people";
import AsyncButton from "@/src/components/async_button/AsyncButton";
import { getCompanyPeople, getPersonEmails } from "@/src/actions/apolloPeople";
import { useUserContext } from "../../app/context/UserContext";
import { Email, Facebook, GitHub, LinkedIn, Twitter } from "@mui/icons-material";
import EmailLink from "../email_link/EmailLink";

const CompanyDetails = ( { company, userId, isActive  }: { company: Organization, userId: string, isActive: boolean }) => {
    const { user, loading: userLoading, error: userError, fetchUser } = useUserContext();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [companyDetails, setCompanyDetails] = useState<Organization | null>(null);
    const [people, setPeople] = useState<Person[]>([]);
    const [isFavorite, setIsFavorite] = useState<boolean>(false);

    useEffect(() => {
        if (isActive){
            setIsLoading(true);
            getPeopleInOrganization(company.id).then((data) => {
                setPeople(data);
                setIsLoading(false);
            });
        }   
    }, [isActive]);

    const handleGetEmail = async (id: string) => {
        await getPersonEmails(id)
        return await getPeopleInOrganization(company.id).then((data) => {
            setPeople(data);
        });
    }

    const handleAddToFavorites = async () => {
        await addCompanyToFavorites(userId, company.id);
        return setIsFavorite(true);
    }
    const handleRemoveFromFavorites = async () => {
        await removeCompanyFromFavorites(user.id, company.id);
        return setIsFavorite(false);
    }

    const handleGetCompanyPeople = async () => {
        const people = await getCompanyPeople(company.id);
        getCompanyDetails(company.id, user.id).then((data) => {
            setCompanyDetails(data);
        });

        return setPeople(people);
    }

    const handleScrapeEmails = async () => {
        return await scrapeEmailsALL();
    }

    return (
        <div className={styles.container}>
            <div className={styles.company}>          
                <div>
                </div>
                <div>
                    {company.phone && <p>{company.phone}</p>}
                    
                    {/* <AsyncButton label="scrape emails" asyncAction={handleScrapeEmails} /> */}
                </div>
                

            </div>
            <div>
                {
                    !company.fetched_people && <AsyncButton label="Find More People" asyncAction={handleGetCompanyPeople} />
                }       
                {company.emails && <div className={styles.emails}>{company.emails.map(email => <EmailLink key={email} email={email}/>)}</div>}     
                {people.map((person) => (
                    <div key={person.id} className={styles.person}>      
                        <img className={styles.person_photo} src={person.photo_url} alt={person.name} />
                        <p>{person.name}</p>                        
                        <p>{person.title && `${person.title}`}</p>
                        <p>{person.headline && `${person.headline}`}</p>
                        <p>{person.city && person.city}{person.state && `, ${person.state}`} </p>
                        <div className={styles.person_links}>
                            {person.linkedin_url && <ExternalLink href={person.linkedin_url }><LinkedIn /></ExternalLink>}
                            {person.facebook_url && <ExternalLink href={person.facebook_url}><Facebook /></ExternalLink>}
                            {person.twitter_url && <ExternalLink href={person.twitter_url}><Twitter /></ExternalLink>}
                            {person.github_url && <ExternalLink href={person.github_url}><GitHub /></ExternalLink>}
                            {!person.email &&
                            <div>
                                <AsyncButton label="Find Email" asyncAction={() => handleGetEmail(person.id)}  />
                            </div>
                            }
                            {person.email && <EmailLink email={person.email} />}
                            {person.email === "Email Unavailable" ? <p>{person.email}</p> :
                            null}
                            
                        </div>


                            

                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompanyDetails;