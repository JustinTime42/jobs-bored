'use client';
import { useEffect, useState } from "react";
import { useUserContext } from "../../context/UserContext";
import useLocalOrganizations from "../../hooks/useLocalOrgs";
import { getUserDetails } from "@/src/actions/user";
import { useRouter } from 'next/navigation';
import { Organization } from "@/src/definitions";
import ExternalLink from "@/src/components/Link/ExternalLink";
import CompanyCard, { CompanyCardProps } from "@/src/components/company_card/CompanyCard";
import styles from './Feed.module.css';
import CompanyDetails from "@/src/components/company_details/CompanyDetails";
import { supabase } from "@/src/utils/supabase/client";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";

const Feed = () => {
    const { user, loading: userLoading, error: userError, fetchUser } = useUserContext();
    const [userDetails, setUserDetails] = useState<any>({});
    const { organizations, loading: orgLoading, error: orgError } = useLocalOrganizations(userDetails?.locations);
    const [ activeOrganization, setActiveOrganization ] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            getUserDetails(user.id).then((data) => {
                console.log("user Details", data)
                setUserDetails(data);
            });
        }
    },[JSON.stringify(user)]);

    const handleOpenCompany = async (expanded: boolean, org: Organization) => {
        if (expanded) {
            const {data, error} = await supabase.from('activity_log').insert([
                { type: 'viewCompanyDetails', contact: org.id, body: org.name }
            ]);
            setActiveOrganization(org.id);
            if (error) {
                console.error('Error inserting new activity log:', error);
                return;
            }
            return
        }
        return
    }

    if (userLoading || orgLoading) {
        return <p>Loading...</p>;
    }
    if (userError || orgError) {
        return <p>Error: </p>;
    }
    if (!user) {
        return router.push('/');
    }
    if (userDetails?.locations?.length === 0) {
        return (
            <div>
                <h1>Dashboard</h1>
                <p>No organizations found. Add a location in your<ExternalLink href='/settings'>account settings</ExternalLink>.</p>
            </div>
        );
    } else if (organizations.length === 0) {
        return (
            <div>
                <h1>Dashboard</h1>
                <p>No organizations found in your locations. Note: If you just added a new location, wait a few minutes and then refresh the page. It can take up to 2 minutes for us to gather information on relevant companies and add them to your feed for the first time.</p>
            </div>
        );
    }
    return (
        <div className={styles.feed}>
            {organizations.map((organization) => (
                <Accordion onChange={(e, x)=>handleOpenCompany(x, organization)} key={organization.id}>
                    <AccordionSummary expandIcon>
                    <CompanyCard                          
                        company={organization}
                    />
                    </AccordionSummary>
                    <AccordionDetails>
                        <CompanyDetails 
                            company={organization} 
                            userId={user.id}
                            isActive={activeOrganization === organization.id}
                        />
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>

            // <div className={styles.feed}>
            //     {organizations.map((organization) => (
            //         <CompanyCard 
            //             className={activeOrganization === organization.id ? 'active' : ''} 
            //             viewDetails={handleOpenCompany} 
            //             company={organization} 
            //             key={organization.id}/>
            //     ))}
            // </div>
            // <div className={styles.details}>
            //     {activeOrganization && (
            //         <CompanyDetails companyId={activeOrganization} userId={user.id}/>

            //     )}
            // </div>
    );
}

export default Feed