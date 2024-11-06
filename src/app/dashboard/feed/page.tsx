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
import { useMediaQuery } from 'react-responsive'
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import Filters from "@/src/components/feed_filters/Filters";
import { FiltersState } from "@/src/components/feed_filters/Filters";
import { generateCSV } from "@/src/actions/exportCSV";
import AsyncButton from "@/src/components/async_button/AsyncButton";

const Feed = () => {
    const isMobile = useMediaQuery({ maxWidth: 1200 });
    const { user, loading: userLoading, error: userError } = useUserContext();
    const [userDetails, setUserDetails] = useState<any>({});
    const [filters, setFilters] = useState<FiltersState>({} as FiltersState);
    const [getOrgParams, setGetOrgParams] = useState<FiltersState>({} as FiltersState);
    const { 
        organizations, 
        loading: orgLoading, 
        error: orgError,
    } = 
        useLocalOrganizations(userDetails?.locations, getOrgParams);
    const [ activeOrganization, setActiveOrganization ] = useState<Organization | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            getUserDetails(user.id).then((data) => {
                console.log("user Details", data)
                setUserDetails(data);
            });
        }
    },[JSON.stringify(user)]);

    useEffect(() => {
        setActiveOrganization(null);
    },[filters.localities, filters.userId]);

    const toggleFavorites = () => {        
        setFilters((prev:any) => {
            if (prev.userId) {
                return { ...prev, userId: null };
            } else {
                return { ...prev, userId: user.id };
            }
        });
    };

    const toggleLocality = (locality: string) => {
        console.log("Toggling locality")
        console.log("filters", filters)
        setFilters((prev:FiltersState) => {
            const newLocality = prev.localities?.includes(locality)
                ? prev.localities?.filter((l:any) => l !== locality)
                : [...prev.localities || [], locality];
            return { ...prev, localities: newLocality };
        });
    };

    const handleOpenCompany = async (expanded: boolean, org: Organization) => {
        console.log('Opening company:', org);
        if (expanded) {
            const {data, error} = await supabase.from('activity_log').insert([
                { type: 'viewCompanyDetails', contact: org.id, body: org.name }
            ]);
            setActiveOrganization(org);
            if (error) {
                console.error('Error inserting new activity log:', error);
                return;
            }
            return
        }
        return
    }

    const getFilteredOrgs = async() => {
        console.log("Filters", filters.localities)
        setGetOrgParams(filters);
    }

    const handleGenerateCSV = async () => {
        const orgIds = organizations.map((o: any) => o.id);
        const csvData = await generateCSV(orgIds);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'organizations.csv';
        a.click();
    }   

    if (userLoading || orgLoading) {
        return <p>Loading...</p>;
    }
    if (userError || orgError) {
        return <p>Error: {userError?.message} {orgError?.message} </p>;
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
    } 
    if (isMobile) {
        return (
            <div className={styles.feed}>
                <div className={styles.feedMenu}>
                    <div>
                    <AsyncButton asyncAction={handleGenerateCSV} label="Export" />
                    </div>
                    
                    <Filters 
                        userLocations={userDetails.locations}
                        filters={filters}
                        toggleFavorites={toggleFavorites}
                        toggleLocality={toggleLocality}
                        submitQuery={getFilteredOrgs}
                    />
                </div>
  
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
                            isActive={activeOrganization?.id === organization.id}
                        />
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
        )
    }
    else {
        return (
            <div className={`${styles.container} flex-none basis-[400px]`}>
                <div className={styles.feed}>
                    <div className={styles.feedMenu}>
                        <AsyncButton asyncAction={handleGenerateCSV} label="Export" />
                        <Filters 
                            userLocations={userDetails.locations}
                            filters={filters}
                            toggleFavorites={toggleFavorites}
                            toggleLocality={toggleLocality}
                            submitQuery={getFilteredOrgs}
                        />  
                    </div>
                    {organizations.map((organization) => (
                        <div key={organization.id} onClick={() => handleOpenCompany(true, organization)}>
                            <CompanyCard                                 
                                className={activeOrganization?.id === organization.id ? 'active' : ''} 
                                company={organization} 
                                key={organization.id}
                            />
                        </div>
                    ))}
                </div>
                <div className={styles.details}>
                    {activeOrganization && (
                        <CompanyDetails 
                            company={activeOrganization} 
                            userId={user.id} 
                            isActive={true}
                        />
    
                    )}
                    </div>
            </div>
        );
    }
}

export default Feed