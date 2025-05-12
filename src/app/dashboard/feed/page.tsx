'use client';
import { useEffect, useState, useRef, useCallback } from "react";
import { useUserContext } from "../../context/UserContext";
import { Organization } from "@/src/definitions";
import ExternalLink from "@/src/components/Link/ExternalLink";
import CompanyCard from "@/src/components/company_card/CompanyCard";
import styles from './Feed.module.css';
import CompanyDetails from "@/src/components/company_details/CompanyDetails";
import Filters from "@/src/components/feed_filters/Filters";
import AsyncButton from "@/src/components/async_button/AsyncButton";
import { useMediaQuery } from 'react-responsive';
import { generateCSV } from "@/src/actions/exportCSV";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { fetchMoreOrganizations, fetchOrganizations } from "./utils";

const initialFilters = {
    localities: [] as string[] | null,
    userId: null,
    favoritesOnly: false,
    page_size:20,
    previous_score: null,
    previous_id: null
};

const Feed = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const { user, loading: userLoading, error: userError } = useUserContext();
    const [filters, setFilters] = useState({...initialFilters, localities: user?.locations.map((l: any) => l.locality) || [], userId: user?.id});
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [activeOrganization, setActiveOrganization] = useState<Organization | undefined>(undefined);
    const [orgLoading, setOrgLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [endReached, setEndReached] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 1200 });
    const lastOrganizationRef = useCallback((node: HTMLDivElement) => {
        if (orgLoading || !hasMore || !node) return;
        
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !orgLoading && hasMore && !endReached) {
                handleFetchMore(organizations, user, filters, hasMore);
            }
        });
        
        observer.current.observe(node);
    }, [orgLoading, hasMore, user, filters, organizations, endReached]);

    useEffect(() => {
        if (user) {
            // console.log('User object in Feed:', {
            //     id: user.id,
            //     is_junior: user.is_junior,
            //     locations: user.locations?.map((l: any) => ({ id: l.id, locality: l.locality }))
            // });
            
            setFilters(prev => ({
                ...prev,
                localities: user?.locations.map((l: any) => l.locality) || [],
                userId: user.id
            }));
            handleFetch({
                ...filters,
                localities: user?.locations.map((l: any) => l.locality) || [],
                userId: user.id
            });
        }
    }, [user, userLoading]);

    const handleFetch = async (currentFilters:any) => {
        setOrgLoading(true);
        setEndReached(false);
        setHasMore(true);
        try {
            const data = await fetchOrganizations({...currentFilters}, user);
            setOrganizations(data);
            setOrgLoading(false);
        } catch (error) {
            console.error("Error fetching organizations:", error);
            setOrgLoading(false);
        }
    };

    const handleFetchMore = async (organizations: Organization[], user: any, filters: any, hasMore: boolean) => {
        if (!hasMore || endReached) return;
        if (orgLoading) return;
        
        setOrgLoading(true);
        const data = await fetchMoreOrganizations(organizations, user, filters);
        
        if (!data || data.length === 0) {
            setHasMore(false);
            setEndReached(true);
        } else {
            setOrganizations((prev) => [...prev, ...data]);
        }
        
        setOrgLoading(false);
    };

    const handleGenerateCSV = async () => {
        if (user.subscription_status !== 'active') {
            throw new Error('This feature is only available to paid users.');
        }
        const orgIds = organizations.map((o: any) => o.id);
        const csvData = await generateCSV(orgIds);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'organizations.csv';
        a.click();
    }   

    const toggleFavorites = () => {
        setFilters((prev) => ({ ...prev, favoritesOnly: !prev.favoritesOnly }));
    };

    const toggleLocality = (locality: string) => {
        setFilters((prev) => ({
            ...prev,
            localities: prev.localities?.includes(locality)
                ? prev.localities.filter((l:any) => l !== locality)
                : [...(prev.localities || []), locality],
        }));
    };

    const handleAccordionChange = (orgId: string) => {
        if (activeOrganization?.id === orgId) {
            setActiveOrganization(undefined);
        } else {
            setActiveOrganization(organizations.find((org: any) => org.id === orgId));
        }
    };

    if (userLoading) return <p>Loading...</p>;
    if (userError) return <p>Error: {userError.message}</p>;

    if (!user?.locations || user?.locations?.length === 0) {
        return (
            <div>
                <h1>Dashboard</h1>
                <p>
                    We're still building your feed. Please refresh the page in a few minutes.
                    <ExternalLink href="/dashboard/settings"> account settings</ExternalLink>.
                </p>
            </div>
        );
    }

    return isMobile ? (
        <div className={styles.feed} style={{width: '100%'}} ref={containerRef}>
            <div className={styles.feedMenu}>
                <AsyncButton asyncAction={handleGenerateCSV} label="Export" />
                <Filters
                    userLocations={user?.locations}
                    filters={filters}
                    toggleFavorites={toggleFavorites}
                    toggleLocality={toggleLocality}
                    submitQuery={() => handleFetch(filters)}
                />
            </div>
            {organizations.length === 0 && <p>We're still building your feed. Please refresh the page in a few minutes.</p>}
            {organizations.map((org, index) => (
                <Accordion 
                    ref={index === organizations.length - 1 ? lastOrganizationRef : null} 
                    key={org.id}
                    onChange={() => handleAccordionChange(org.id)}
                    expanded={activeOrganization?.id === org.id}
                >
                    <AccordionSummary>
                        <CompanyCard company={org} />
                    </AccordionSummary>
                    <AccordionDetails>
                        <CompanyDetails company={org} userId={user.id} isActive={activeOrganization?.id === org.id} />
                    </AccordionDetails>
                </Accordion>
            ))}
            <div className={styles.loadMore}>
                {orgLoading && <p>Loading more...</p>}
                {endReached && <p>All organizations loaded</p>}
            </div>
        </div>
    ) : (
        <div className={styles.container}>
            <div style={{display: 'flex', flexDirection: 'row', gap: '1em', width: '100%', justifyContent: 'center'}}>
            <div className={styles.feed} ref={containerRef}>
                <div className={styles.feedMenu}>
                    <AsyncButton asyncAction={handleGenerateCSV} label="Export" />
                    <Filters
                        userLocations={user.locations}
                        filters={filters}
                        toggleFavorites={toggleFavorites}
                        toggleLocality={toggleLocality}
                        submitQuery={() => handleFetch(filters)}
                    />
                </div>
                {organizations.length === 0 && <p>We're still building your feed. Please refresh the page in a few minutes.</p>}
                {organizations.map((org, index) => (
                    <div ref={index === organizations.length - 1 ? lastOrganizationRef : null} key={org.id} onClick={() => setActiveOrganization(org)}>
                        <CompanyCard
                            company={org}
                            className={activeOrganization?.id === org.id ? 'active' : ''}
                        />
                    </div>
                ))}
                <div className={styles.loadMore}>
                    {orgLoading && <p>Loading more...</p>}
                    {endReached && <p>All organizations loaded</p>}
                </div>
            </div>
            <div className={styles.details}>
                {activeOrganization && (
                    <CompanyDetails company={activeOrganization} userId={user.id} isActive />
                )}
            </div>
            </div>
        </div>
    );
};

export default Feed;