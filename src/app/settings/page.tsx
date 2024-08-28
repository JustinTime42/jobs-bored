// page.tsx
'use client'
import React, { useEffect, useState } from 'react';
import { useUserContext } from '../context/UserContext';
import { useRouter } from 'next/navigation';
import { getUserDetails, updateUserDetails } from '@/src/api/user';
import LocationAutoComplete from './LocationAutoComplete';
import AsyncButton from '@/src/components/async_button/AsyncButton';
import { addLocation } from '@/src/api/locations';
import Location from '@/src/components/location/Location';

const UserAccount = () => {
    const { user, loading, error, fetchUser } = useUserContext();
    const [userDetails, setUserDetails] = useState<any>({});
    const [newLocation, setNewLocation] = useState('');
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
    }, [JSON.stringify(user)]);

    const handleAddLocation = async () => {
        if (!newLocation) {
            alert('Please select a valid location');
            return;
        }
        try {
            const localPeople = await addLocation(newLocation);
            const person = localPeople.find((person: any) => person.city && person.state && person.country);
            const personLocation = `${person?.city} ${person?.state} ${person?.country}`;
            const updatedDetails = await updateUserDetails({
                ...userDetails,
                locations: [...userDetails.locations, personLocation],
            });
            setUserDetails(updatedDetails);
            setNewLocation('');
        } catch (error) {
            throw error
        }
    };

    const handleRemovelocation = async (location: string) => {
        const updatedDetails = await updateUserDetails({
            ...userDetails,
            locations: userDetails.locations.filter((loc: string) => loc !== location),
        });
        setUserDetails(updatedDetails);
    };

    if (loading) {
        return <p>Loading...</p>;
    }
    if (error) {
        return <p>Error: {error.message}</p>;
    }
    if (!user) {
        router.push('/');
        return null;
    }

    return (
        <div>
            <h1>User Account</h1>
            <p>Username: {user?.user_metadata.preferred_username}</p>
            <p>Email: {user?.email}</p>
            <div style={{padding: "8px", marginTop:"32px"}}>
                <p style={{margin:"4px"}}> Locations: </p>
                {userDetails?.locations && userDetails.locations.map((location: string, i: number) => (
                    <Location key={i} location={location} handleRemoveLocation={handleRemovelocation} />
                ))}
                <div style={{marginTop:"16px"}}>
                    <LocationAutoComplete onSelectLocation={(location) => setNewLocation(location)} />
                    <AsyncButton asyncAction={handleAddLocation} label="Add Location" />
                </div>

            </div>

        </div>
    );
};

export default UserAccount;
