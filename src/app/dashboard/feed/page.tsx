'use client';
import { useEffect, useState, useRef, useCallback } from "react";
import { useUserContext } from "../../context/UserContext";
import { getUserDetails } from "@/src/actions/user";
import { useRouter } from 'next/navigation';
import { Organization } from "@/src/definitions";
import ExternalLink from "@/src/components/Link/ExternalLink";
import CompanyCard from "@/src/components/company_card/CompanyCard";
import styles from './Feed.module.css';
import CompanyDetails from "@/src/components/company_details/CompanyDetails";
import Filters from "@/src/components/feed_filters/Filters";
import AsyncButton from "@/src/components/async_button/AsyncButton";
import { useMediaQuery } from 'react-responsive';
import { generateCSV } from "@/src/actions/exportCSV";
import { getLocalOrganizations } from "@/src/actions/organizations";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";

const initialFilters = {
    localities: null as string[] | null,
    userId: null,
    page_size: 10,
    previous_score: null,
    previous_id: null
};

const Feed = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const { user, loading: userLoading, error: userError } = useUserContext();
    const [userDetails, setUserDetails] = useState<any>({});
    const [filters, setFilters] = useState(initialFilters);
    const filtersRef = useRef(filters);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [activeOrganization, setActiveOrganization] = useState<Organization | null>(null);
    const [orgLoading, setOrgLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const router = useRouter();
    const isMobile = useMediaQuery({ maxWidth: 1200 });
    const lastOrganizationRef = useCallback((node: HTMLDivElement) => {
        // console.log("filters:", filters)
        if (orgLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchMoreOrganizations();
            }
            if (node) observer.current?.observe(node);
        });
        if (node) observer.current.observe(node);
    }, [orgLoading, hasMore]);

    useEffect(() => {
        if (user) {
            getUserDetails(user.id).then(async(data) => {
                setUserDetails(data);
                console.log(data)
                const updatedFilters = {
                    ...filters,
                    localities: data.locations.map((l: any) => l.locality),
                };
                setFilters(updatedFilters)
                const orgs = await getLocalOrganizations(
                    data.locations.map((l: any) => l.id),
                    null,
                    updatedFilters.localities,
                    updatedFilters.page_size,
                    null,
                    null
                );
                setOrganizations(orgs)
            });
        }
    }, [JSON.stringify(user)]);

    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    const fetchOrganizations = async (currentFilters:any) => {
        console.log("filters", currentFilters.localities)
        setOrgLoading(true);
        const locationIds = userDetails?.locations?.map((l: any) => l.id) || null;
        const data = await getLocalOrganizations(
            locationIds,
            currentFilters.userId,
            currentFilters.localities,
            currentFilters.page_size,
            null,
            null
        );
        setOrganizations(data);
        setOrgLoading(false);
    };

    const fetchMoreOrganizations = async () => {
        if (orgLoading) return;

        setOrgLoading(true);
        const lastOrg = organizations[organizations.length - 1];
        const locationIds = userDetails?.locations?.map((l: any) => l.id) || null;
        const data = await getLocalOrganizations(
            locationIds,
            filtersRef.current.userId,
            filtersRef.current.localities,
            filtersRef.current.page_size,
            lastOrg?.score || null,
            lastOrg?.id || null
        );
        if (data?.length === 0) {
            setHasMore(false);
        }
        if (data?.length > 0) {
            setOrganizations((prev) => [...prev, ...data]);
        }
        setOrgLoading(false);
    };

    const handleGenerateCSV = async () => {
        const orgIds = organizations.map((o) => o.id);
        const csvData = await generateCSV(orgIds);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'organizations.csv';
        a.click();
    };

    const toggleFavorites = () => {
        setFilters((prev) => ({ ...prev, userId: prev.userId ? null : user.id }));
    };

    const toggleLocality = (locality: string) => {
        setFilters((prev) => ({
            ...prev,
            localities: prev.localities?.includes(locality)
                ? prev.localities.filter((l:any) => l !== locality)
                : [...(prev.localities || []), locality],
        }));
    };

    if (userLoading) return <p>Loading...</p>;
    if (userError) return <p>Error: {userError.message}</p>;

    if (!user) {
        router.push('/');
        return null;
    }

    if (userDetails?.locations?.length === 0) {
        return (
            <div>
                <h1>Dashboard</h1>
                <p>
                    No organizations found. Add a location in your
                    <ExternalLink href="/dashboard/settings"> account settings</ExternalLink>.
                </p>
            </div>
        );
    }

    return isMobile ? (
        <div className={styles.feed} ref={containerRef}>
            <div className={styles.feedMenu}>
                <AsyncButton asyncAction={handleGenerateCSV} label="Export" />
                <Filters
                    userLocations={userDetails.locations}
                    filters={filters}
                    toggleFavorites={toggleFavorites}
                    toggleLocality={toggleLocality}
                    submitQuery={() => fetchOrganizations(filters)}
                />
            </div>
            {organizations.map((org, index) => (
                <Accordion ref={index === organizations.length - 1 ? lastOrganizationRef : null} key={org.id}>
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
            </div>
        </div>
    ) : (
        <div className={`${styles.container} flex-none basis-[400px]`}>
            <div className={styles.feed} ref={containerRef}>
                <div className={styles.feedMenu}>
                    <AsyncButton asyncAction={handleGenerateCSV} label="Export" />
                    <Filters
                        userLocations={userDetails.locations}
                        filters={filters}
                        toggleFavorites={toggleFavorites}
                        toggleLocality={toggleLocality}
                        submitQuery={() => fetchOrganizations(filters)}
                    />
                </div>
                {organizations.map((org, index) => (
                    <div ref={index === organizations.length - 1 ? lastOrganizationRef : null} key={org.id} onClick={() => setActiveOrganization(org)}>
                        <CompanyCard
                            company={org}
                            className={activeOrganization?.id === org.id ? 'active' : ''}
                        />
                    </div>
                ))}
            </div>
            <div className={styles.details}>
                {activeOrganization && (
                    <CompanyDetails company={activeOrganization} userId={user.id} isActive />
                )}
            </div>
            <div className={styles.loadMore}>
                {orgLoading && <p>Loading more...</p>}
            </div>
        </div>
    );
};

export default Feed;
