'use client';
import { useEffect, useState } from "react";
import { useUserContext } from "../../context/UserContext";
import useLocalOrganizations from "../../hooks/useLocalOrgs";
import { getUserDetails } from "@/src/actions/user";
import { useRouter } from 'next/navigation';
import { Organization } from "@/src/definitions";
import ExternalLink from "@/src/components/Link/ExternalLink";
import { getFavoriteCompanies } from '@/src/actions/organizations';
import CompanyCard, { CompanyCardProps } from "@/src/components/company_card/CompanyCard";
import styles from './Favorites.module.css';
import CompanyDetails from "@/src/components/company_details/CompanyDetails";
import { supabase } from "@/src/utils/supabase/client";

const Favorites = () => {
    const { user, loading: userLoading, error: userError, fetchUser } = useUserContext();
    const [userDetails, setUserDetails] = useState<any>({});
    const [ activeOrganization, setActiveOrganization ] = useState<string | null>(null);
    const [favoriteCompanies, setFavoriteCompanies] = useState<any[]>([]);
    const router = useRouter();

    // useEffect(() => {
    //     if (user) {
    //         getUserDetails(user.id).then((data) => {
    //             setUserDetails(data);
    //         });
    //         getFavoriteCompanies(user.id).then((data) => {
    //             setFavoriteCompanies(data);
    //         })
    //     }
    // },[JSON.stringify(user)]);

    const handleOpenCompany = async (company:Partial<Organization>) => {
        console.log('Opening company:', company);
        const {data, error} = await supabase.from('activity_log').insert([
            { type: 'viewCompanyDetails', contact: company.id, body: company.name }
        ]);
        if (error) {
            console.error('Error inserting new activity log:', error);
            return;
        }
        setActiveOrganization(company.id || null);
        return
    }

    if (userLoading) {
        return <p>Loading...</p>;
    }
    if (userError) {
        return <p>Error: </p>;
    }
    if (!user) {
        return router.push('/');
    }
    if (userDetails?.locations?.length === 0) {
        return (
            <div>
                <p>No organizations found. Add a location in your<ExternalLink href='/settings'>account settings</ExternalLink>.</p>
            </div>
        );
    } else if (favoriteCompanies.length === 0) {
        return (
            <div>
                <p>In companies listed on your feed, you can click "Add To Favorites" to see them here.</p>
            </div>
        );
    }
    return (
        <div className={styles.container}>
            <div className={styles.feed}>
                {favoriteCompanies.map((organization) => (
                    <CompanyCard 
                        className={activeOrganization === organization.id ? 'active' : ''}
                        company={organization} 
                        key={organization.id}/>
                ))}
            </div>
            <div className={styles.details}>
                {activeOrganization && (
                    <CompanyDetails company={activeOrganization} userId={user.id}/>
                )}
                </div>
        </div>
    );
}

export default Favorites;
