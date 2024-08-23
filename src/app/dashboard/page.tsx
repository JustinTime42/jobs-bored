'use client'
import React, { useEffect, useState } from 'react';
import { useUserContext } from '../context/UserContext';
import Input from '@/src/components/input/Input';
import { useRouter } from 'next/navigation';
import { getUserDetails } from '@/src/api/user';
import Button from '@/src/components/button/Button';
import { addLocation } from '@/src/api/locations';
import { getLocalOrganizations } from '@/src/api/organizations';
import Link from 'next/link';
import styles from './page.module.css';

const Dashboard = () => {
    const { user, loading, error, fetchUser } = useUserContext();
    const [userDetails, setUserDetails] = useState<any>({});
    const [ organizations, setOrganizations ] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        if (user) {
            getUserDetails(user.id).then((data) => {
                setUserDetails(data);
                data.locations
            });
        }
    },[user]);

    useEffect(() => {
        if (userDetails?.locations) {
            const locations = [...userDetails.locations];
            getLocalOrganizations(locations).then((data) => {
                setOrganizations(data);
                console.log(data)
            });
        }
    }, [JSON.stringify(userDetails.locations)]);

    if (loading) {
        return <p>Loading...</p>;
    }
    if (error) {
        return <p>Error: {error.message}</p>;
    }
    if (!user) {
        return router.push('/');
    }
    return (
        <div>
            {organizations.map((organization) => (
                <div className={styles.org} key={organization.id}>
                    <Link href={`/dashboard/${organization.id}`}>{organization.name}</Link>
                </div>
            ))}

        </div>
    );
};

export default Dashboard;