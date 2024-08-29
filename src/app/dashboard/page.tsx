'use client'
import React, { useEffect, useState } from 'react';
import { useUserContext } from '../context/UserContext';
import Input from '@/src/components/input/Input';
import { useRouter } from 'next/navigation';
import { getUserDetails } from '@/src/api/user';
import Button from '@/src/components/button/Button';
import { addLocation } from '@/src/api/locations';
import { getFavoriteCompanies, getLocalOrganizations } from '@/src/api/organizations';
import Link from 'next/link';
import styles from './page.module.css';
import useLocalOrganizations from '../hooks/useLocalOrgs';
import ExternalLink from '@/src/components/Link/ExternalLink';
import { Organization } from '@/src/definitions';

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
                setUserDetails(data);
            });
            getFavoriteCompanies(user.id).then((data) => {
                console.log(data)
                setFavoriteCompanies(data);
            })

        }
    },[JSON.stringify(user)]);

    if (userLoading || orgLoading) {
        return <p>Loading...</p>;
    }
    if (userError || orgError) {
        return <p>Error: {userError.message || orgError.message}</p>;
    }
    if (!user) {
        return router.push('/');
    }
    if (userDetails.locations.length === 0) {
        return (
            <div>
                <h1 className='font-inter'>Dashboard</h1>
                <p>No organizations found. Add a location in your<ExternalLink href='/settings'>account settings</ExternalLink>.</p>
            </div>
        );
    }
    return (
        <div className={styles.container}>
            <div>                
                <div>
                    <h2>Favorites</h2>
                    {favoriteCompanies.length > 0 ? (
                    favoriteCompanies.map((company) => (
                        <div key={company.details.id}>
                            <Link href={`/dashboard/${company.details.id}`}>{company.details.name}</Link>
                        </div>
                    ))
                    ) :
                    <p>Add companies to your favorites to track them here.</p>
                }
                </div>
        
            </div>

            <div>
                {organizations.map((organization) => (
                    <div className={styles.org} key={organization.id}>
                        <Link href={`/dashboard/${organization.id}`}>{organization.name}</Link>
                    </div>
                ))}
            </div>
        </div>

    );
};

export default Dashboard;