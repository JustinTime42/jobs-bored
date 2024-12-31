'use client'
import { addCompanyToFavorites, getCompanyDetails, removeCompanyFromFavorites } from "@/src/actions/organizations";
import { useEffect, useState } from "react";
import ExternalLink from "@/src/components/Link/ExternalLink";
import { Organization, Person } from "@/src/definitions";
import styles from './CompanyPage.module.css';
import { getPeopleInOrganization } from "@/src/actions/people";
import AsyncButton from "@/src/components/async_button/AsyncButton";
import { getCompanyPeople } from "@/src/actions/apolloPeople";
import { useUserContext } from "../../app/context/UserContext";
import { Facebook, Favorite, FavoriteBorder, Twitter } from "@mui/icons-material";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LinkIcon from '@mui/icons-material/Link';
import PersonInfo from "../person_info/PersonInfo";
import CopyText from "../copy_text/CopyText";
import { useMediaQuery } from 'react-responsive'
import { IconButton } from "@mui/material";
import { createClient } from "@/src/utils/supabase/client";

const CompanyDetails = ( { company, userId, isActive  }: { company: Organization, userId: string, isActive: boolean }) => {
    const { user, loading: userLoading, error: userError, fetchUser } = useUserContext();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [companyDetails, setCompanyDetails] = useState<Organization | null>(company);
    const [people, setPeople] = useState<Person[]>([]);
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [ hideMoreButton, setHideMoreButton ] = useState<boolean>(companyDetails?.fetched_people || false);
    const isMobile = useMediaQuery({ maxWidth: 1200 });
    const supabase = createClient();

    useEffect(() => {
        if (isActive){
            setIsLoading(true);
            getCompanyDetails(company.id, userId).then((data) => {
                console.log(data)
                setCompanyDetails(data);
                setHideMoreButton(data.fetched_people || false);
                setIsFavorite(data.user_organizations?.find((org) => org.user_id === userId) || false);
            });
            getPeopleInOrganization(company.id).then((data) => {
                setPeople(data);
                setIsLoading(false);
            });
            setHideMoreButton(company.fetched_people || false);
        }   
    }, [isActive, company]);

    const handleToggleFavorites = async () => {
        if (isFavorite) {
            await removeCompanyFromFavorites(user.id, company.id);
            return setIsFavorite(false);
        } else {
            await addCompanyToFavorites(userId, company.id);
            return setIsFavorite(true);
        }
    }

    const handleGetCompanyPeople = async () => {
        supabase.from('activity_log').insert([
            { type: 'getCompanyPeople', contact: company.id, body: company.name }
        ]);
        const people = await getCompanyPeople(company.id);
        getCompanyDetails(company.id, user.id).then((data) => {
            setCompanyDetails({...data, fetched_people: true});
            setTimeout(() => setHideMoreButton(true), 1000);
        });

        return setPeople(people);
    }

    return (
        <div className={styles.container}>
            {!isMobile &&
                <div className={styles.company}>
                    <h3>{company.name}</h3>
                    <div>
                    <ExternalLink href={company.linkedin_url}><LinkedInIcon/></ExternalLink>
                    <ExternalLink href={company.website_url || ""}><LinkIcon/></ExternalLink>
                    {company.twitter_url && <ExternalLink href={company.twitter_url}><Twitter /></ExternalLink>}
                    {company.facebook_url && <ExternalLink href={company.facebook_url}><Facebook /></ExternalLink>}
                    <IconButton
                        onClick={handleToggleFavorites}
                        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        className={styles.favorite_button}
                    >
                        {isFavorite ? <Favorite  /> : <FavoriteBorder />}
                    </IconButton>                    
                </div>
                </div>
            }
            {
                isMobile &&
                <div className='flex flex-row items-center'>
                <ExternalLink href={company.website_url ||""} className='font-bold'>{company.name}</ExternalLink>
                <IconButton
                    onClick={handleToggleFavorites}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    className={styles.favorite_button}
                >
                    {isFavorite ? <Favorite  /> : <FavoriteBorder />}
                </IconButton>
            </div>
            }

            <h4>Contacts:</h4>
            <div>      
                {company.emails && 
                    <div className={styles.emails}>
                        {company.emails.map(email => (
                            <div key={email} className={styles.email}>
                                <p>{email}</p>
                                <CopyText text={email} />
                            </div>
                        ))}
                    </div>
                }
                {
                    isLoading && <p>Loading...</p>
                }
                {people.map((person) => (
                    <PersonInfo key={person.id} person={person} />
                ))}
            </div>
            { 
                !hideMoreButton &&
                <AsyncButton label="Find More People" asyncAction={handleGetCompanyPeople} />
            } 
        </div>
    );
};

export default CompanyDetails;