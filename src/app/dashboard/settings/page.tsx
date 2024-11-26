'use client'
import React, { useEffect, useState } from 'react';
import { useUserContext } from '../../context/UserContext';
import { useRouter } from 'next/navigation';
import LocationAutoComplete from './LocationAutoComplete';
import AsyncButton from '@/src/components/async_button/AsyncButton';
import { addLocation } from '@/src/actions/locations';
import Location from '@/src/components/location/Location';
import { DetailsResult, Suggestion } from 'use-places-autocomplete';
import { saveLocation } from '@/src/actions/locations';
import { supabase } from '@/src/utils/supabase/client';
import { loadStripe } from '@stripe/stripe-js';
import styles from './page.module.css';
import Button from '@/src/components/button/Button';
import { handleNewSubscription, handlePortalSession } from '@/src/actions/stripe';


const UserAccount = () => {
    const { user, loading, error, fetchUser } = useUserContext();
    const [newLocation, setNewLocation] = useState<any>({});
    const router = useRouter();

    useEffect(() => {   
        console.log('User:', user);
        if (user) {
            const channel = supabase
            .channel('public:users_locations')
            .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'users_locations' },
            (payload) => {
                fetchUser();
            }
            )
            .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('Subscribed to realtime updates on users_locations');
            }
            });

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [JSON.stringify(user)]);

    const handleAddLocation = async () => {
        console.log(newLocation)
        const locality = newLocation.address_components?.find((component: any) => component.types.includes('locality'))?.long_name;
        if (!locality) {
            alert('Invalid: You must select a valid city from the dropdown');
            return;
        }
        try {
            await addLocation(newLocation, user.id);
            console.log(newLocation)
            // setUserDetails({
            //     ...userDetails,
            //     locations: [...userDetails.locations, newLocation],
            // });
            setNewLocation({} as Suggestion);
        } catch (error) {
            throw error
        }
    };

    const handleRemovelocation = async (location: any) => {
        await supabase.from('users_locations')
            .delete()
            .eq('user_id', user.id)
            .eq('location_id', location.id);
        // console.log(userDetails.locations)
        // setUserDetails({
        //     ...userDetails,
        //     locations: userDetails.locations.filter((l: any) => l.id !== location.id),
        // });
    };   

    const handleSubscribe = async () => {
        const sessionId = await handleNewSubscription(user.stripe_customer_id);
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);
    
        if (stripe && sessionId) {
            await stripe.redirectToCheckout({ sessionId });
        } else {
            console.error('Stripe initialization failed');
        }
    };

    const getSubStatus = () => {
        if (user.subscription_status === 'active') {
            return 'Active';
        } else if (
            user.subscription_status === 'trial' &&
            new Date(user.trial_ends_at) < new Date()
        ) {
            return 'Expired'
        } else if (user.subscription_status === 'trial') {
            return 'Free Trial';
        } else return user.subscription_status;
    };

    
      const handleManageSubscription = async () => {    
        const url = await handlePortalSession(user.stripe_customer_id);
        if (url) {
            window.location.href = url; 
        }        
      };

    if (loading) {
        return <p style={{marginTop: "1em"}}>Loading...</p>;
    }
    if (error) {
        return <p>Error: {error.message}</p>;
    }
    if (!user) {
        router.push('/');
        return null;
    }

    return (
        <div className={styles.container}>
        <h1 className={styles.title}>Account Management</h1>

        <div className={styles.info}>
            <p><strong>Username:</strong> {user.user_name || 'N/A'}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Subscription Status:</strong> {getSubStatus()}</p>
        </div>

        <div className={styles.buttons}>
            {user.subscription_status !== 'active' && (
            <Button className={styles.button} onClick={handleSubscribe} text="Subscribe Now"/>            
            )}
            {user.subscription_status === 'active' && (
                <Button className={styles.button} onClick={handleManageSubscription} text="Manage Subscription" />
            )}
        </div>

        <div className={styles.locations}>
            <p style={{margin:"4px"}}> Locations: </p>
            {user?.locations && user.locations.map((location: string, i: number) => (
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
