'use client'
import React, { useEffect, useState } from 'react';
import { useUserContext } from '../context/UserContext';
import Input from '@/src/components/input/Input';
import { useRouter } from 'next/navigation';
import { getUserDetails, updateUserDetails } from '@/src/api/user';
import Button from '@/src/components/button/Button';
import { addLocation } from '@/src/api/locations';

const UserAccount = () => {
    const { user, loading, error, fetchUser } = useUserContext();
    const [userDetails, setUserDetails] = useState<any>({});
    const [ newLocation, setNewLocation ] = useState('');
    const [ organizations, setOrganizations ] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        if (user) {
            getUserDetails(user.id).then((data) => {
                setUserDetails(data);
            });
        }
    },[user]);

    const handleAddLocation = async() => {
        updateUserDetails({...userDetails, locations: [...userDetails.locations, newLocation]}).then((data) => {
            console.log('Location added', data);
            setUserDetails(data);
        });
        await addLocation(newLocation);
        
    }

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
            <h1>User Account</h1>
            <p>Username: {user?.user_metadata.preferred_username}</p>
            <p>Email: {user?.email}</p>
            {userDetails?.locations && userDetails.locations.map((location: string, i:number) => (
                <p key={i}>{location}</p>
            ))}
            <Input 
                type="text" 
                label="Add Location"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
            />
            <Button 
                onClick={handleAddLocation}
                text="Add Location"
            />
        </div>
    );
};

export default UserAccount;