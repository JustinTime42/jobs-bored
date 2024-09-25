'use client'
import React, { useEffect, useState } from 'react';
import { useUserContext } from '../context/UserContext';
import Input from '@/src/components/input/Input';
import { useRouter } from 'next/navigation';
import { getUserDetails } from '@/src/actions/user';
import Button from '@/src/components/button/Button';
import { addLocation } from '@/src/actions/locations';
import { getFavoriteCompanies, getLocalOrganizations } from '@/src/actions/organizations';
import Link from 'next/link';
import styles from './page.module.css';
import useLocalOrganizations from '../hooks/useLocalOrgs';
import ExternalLink from '@/src/components/Link/ExternalLink';
import { Organization } from '@/src/definitions';
import CompanyCard from '@/src/components/company_card/CompanyCard';

export type orgType = {
    details: Organization;
}[]
const Dashboard = () => {
    const { user, loading: userLoading, error: userError, fetchUser } = useUserContext();
    const [userDetails, setUserDetails] = useState<any>({});
    const { organizations, loading: orgLoading, error: orgError } = useLocalOrganizations(userDetails.locations);
    const [favoriteCompanies, setFavoriteCompanies] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        if (user) {
            getUserDetails(user.id).then((data) => {
                console.log(data)
                setUserDetails(data);
            });
            getFavoriteCompanies(user.id).then((data) => {
                setFavoriteCompanies(data);
            })

        }
    },[JSON.stringify(user)]);

    if (userLoading || orgLoading) {
        return <p>Loading...</p>;
    }
    if (userError || orgError) {
        return <p>Error: </p>;
    }
    if (!user) {
        return router.push('/');
    }
    if (userDetails.locations.length === 0) {
        return (
            <div>
                <h1>Dashboard</h1>
                <p>No organizations found. Add a location in your<ExternalLink href='/settings'>account settings</ExternalLink>.</p>
            </div>
        );
    }
    return (
        <div className={styles.container}>           
            <div className={styles.favorites}>
                <h2>Favorites</h2>
                {favoriteCompanies.length > 0 ? (
                favoriteCompanies.map((company) => (
                    <div key={company.details.id} className={styles.favoriteItem}>
                        <Link href={`/dashboard/${company.details.id}`}>{company.details.name} {company.details.company_size?.toString()}</Link>
                    </div>
                ))
                ) :
                <p>Add companies to your favorites to track them here.</p>
            }
            </div>

            <div className={styles.feed}>
                <h2>Companies Feed</h2>
                {organizations.map((organization) => (
                    <CompanyCard company={organization} key={organization.id}/>
                ))}
            </div>
        </div>

    );
};

export default Dashboard;