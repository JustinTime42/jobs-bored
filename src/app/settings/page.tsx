'use client'
import React, { useEffect, useState } from 'react';
import { useUserContext } from '../context/UserContext';
import { useRouter } from 'next/navigation';
import { getUserDetails, updateUserDetails } from '@/src/actions/user';
import LocationAutoComplete from './LocationAutoComplete';
import AsyncButton from '@/src/components/async_button/AsyncButton';
import { addLocation } from '@/src/actions/locations';
import Location from '@/src/components/location/Location';
import { DetailsResult, Suggestion } from 'use-places-autocomplete';
import { saveLocation } from '@/src/actions/locations';
import { supabase } from '@/src/utils/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

const UserAccount = () => {
    const { user, loading, error, fetchUser } = useUserContext();
    const [userDetails, setUserDetails] = useState<any>({});
    const [newLocation, setNewLocation] = useState({});
    const router = useRouter();

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        if (user) {
            getUserDetails(user.id).then((data) => {
                setUserDetails(data);
            });

            const channel = supabase
            .channel('public:users_locations')
            .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'users_locations' },
            (payload) => {
                console.log('Change received!', payload);
                getUserDetails(user.id).then((data) => {
                    setUserDetails(data);
                });
            }
            )
            .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('Subscribed to realtime updates on users_locations');
            }
            });

            // Cleanup subscription on unmount
            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [JSON.stringify(user)]);

    const handleAddLocation = async () => {
        if (!newLocation) {
            alert('Please select a valid location');
            return;
        }
        try {
            await addLocation(newLocation, user.id);
            // const updatedDetails = await updateUserDetails({
            //     ...userDetails,
            //     locations: [...userDetails.locations, locationId],
            // });
            // setUserDetails(updatedDetails);
            // setNewLocation({} as Suggestion);
        } catch (error) {
            throw error
        }
    };

    const handleRemovelocation = async (location: any) => {
        console.log('Remove location:', location);
        await supabase.from('users_locations').delete().eq('user_id', user.id).eq('location_id', location.location.id);
        // const updatedDetails = await updateUserDetails({
        //     ...userDetails,
        //     locations: userDetails.locations.filter((loc: string) => loc !== location),
        // });
        // setUserDetails(updatedDetails);
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
