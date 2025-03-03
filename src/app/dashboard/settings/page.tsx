'use client'
import React, { useEffect, useState } from 'react';
import { useUserContext } from '../../context/UserContext';
import { useRouter } from 'next/navigation';
import LocationAutoComplete from './LocationAutoComplete';
import AsyncButton from '@/src/components/async_button/AsyncButton';
import { addLocation, populateOrganizations } from '@/src/actions/locations';
import Location from '@/src/components/location/Location';
import { DetailsResult, Suggestion } from 'use-places-autocomplete';
import useLoadScript from '../../hooks/useLoadScript';
import { loadStripe } from '@stripe/stripe-js';
import styles from './page.module.css';
import Button from '@/src/components/button/Button';
import { handleNewSubscription, handlePortalSession } from '@/src/actions/stripe';
import { createClient } from '@/src/utils/supabase/client';
import { toggleJuniorStatus } from '@/src/actions/user';
import type { Location as LocationType }  from '@/src/definitions';
import InfoIcon from '@mui/icons-material/Info';

const UserAccount = () => {
    const { user, loading, error, isInitialized, fetchUser } = useUserContext();
    const [newLocation, setNewLocation] = useState<any>({});
    const [newLocationLoading, setNewLocationLoading] = useState(false);
    const [isJuniorLoading, setIsJuniorLoading] = useState(false);
    const [showJuniorTooltip, setShowJuniorTooltip] = useState(false);
    const router = useRouter();
    const scriptLoaded = useLoadScript(`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_PLACES_KEY}&libraries=places`);
    const supabase = createClient();
    useEffect(() => {
        if (!user) return;
        
        const channel = supabase
          .channel('public:users_locations')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'users_locations' },
            async (payload) => {
              await fetchUser();
              setNewLocationLoading(false);
            }
          )
          .subscribe();
      
        return () => {
          supabase.removeChannel(channel);
        };
    }, [user?.id]);

    const handleAddLocation = async () => {
        setNewLocationLoading(true);
        console.log(newLocation)
        // Check for locality in the localized version for display validation
        const locality = newLocation.address_components?.find((component: any) => component.types.includes('locality'))?.long_name;
        if (!locality) {
            alert('Invalid: You must select a valid city from the dropdown');
            setNewLocationLoading(false);
            return;
        }
        
        // Use the localized formatted_address for duplicate check in the UI
        if (user && user.locations && user.locations.some((i:LocationType)=>i.formatted_address === newLocation.formatted_address)) {
            alert('Location already exists');
            setNewLocationLoading(false);
            return;
        }
        
        try {
            // Create a location object that includes both localized and English data
            const locationData = {
                // For display to the user
                address_components: newLocation.address_components,
                formatted_address: newLocation.english_formatted_address, // Use English for database storage
                // For localized display
                localized_formatted_address: newLocation.formatted_address // Store localized version
            };
            
            const result = await addLocation(locationData, user?.id); 
            console.log('result', result) 
        } catch (error) {
            console.error('Error adding location', error);
            throw error
        } finally {
            setNewLocation({} as Suggestion);
        }
    };

    const handleRemovelocation = async (location: any) => {
        await supabase.from('users_locations')
            .delete()
            .eq('user_id', user.id)
            .eq('location_id', location.id);
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
        console.log('user', user)
        const url = await handlePortalSession(user.stripe_customer_id);
        console.log('url', url)
        if (url) {
            window.location.href = url; 
        }        
      };

    const handleJuniorToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!user) return;
        
        setIsJuniorLoading(true);
        try {
            await toggleJuniorStatus(user.id, e.target.checked);
            await fetchUser();
        } catch (error) {
            console.error('Error updating junior status:', error);
        } finally {
            setIsJuniorLoading(false);
        }
    };

    if (loading) {
        return <p style={{marginTop: "2em"}}>Loading...</p>;
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
        <div className={styles.container}>
            <h1 className={styles.title}>Account Management</h1>
            {/* <AsyncButton asyncAction={populateOrganizations} label="Populate Organizations" /> */}
            <div className={styles.info}>
                <p><strong>Username:</strong> {user.user_name || user.user_metadata?.preferred_username || user.user_metadata?.user_name || 'User'}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Subscription Status:</strong> {getSubStatus()}</p>
                {
                    user.subscription_status === 'trial' && <p><strong>Trial Ends:</strong> {new Date(user.trial_ends_at).toLocaleDateString()}</p>
                }
            </div>

            <div className={styles.buttons}>
                {user.subscription_status !== 'active' && (
                <Button className={styles.button} onClick={handleSubscribe} text="Subscribe Now"/>            
                )}
                {user.subscription_status === 'active' && (
                    <Button className={styles.button} onClick={handleManageSubscription} text="Manage Subscription" />
                )}
            </div>

            <div className={styles.juniorSection}>
                <div className={styles.juniorHeader}>
                    <div className={styles.juniorTitle}>
                        Junior Developer Mode
                        <span 
                            className={styles.infoIcon} 
                            onMouseEnter={() => setShowJuniorTooltip(true)}
                            onMouseLeave={() => setShowJuniorTooltip(false)}
                        >
                            <InfoIcon />
                            {showJuniorTooltip && (
                                <div className={styles.tooltip}>
                                    Enabling this will prioritize companies that hire junior developers in your feed.
                                </div>
                            )}
                        </span>
                    </div>
                    <div className={styles.toggleContainer}>
                        <label className={styles.toggleSwitch}>
                            <input 
                                type="checkbox" 
                                checked={user?.is_junior || false}
                                onChange={handleJuniorToggle}
                                disabled={isJuniorLoading}
                            />
                            <span className={styles.slider}></span>
                        </label>
                        <span className={styles.toggleLabel}>
                            {isJuniorLoading ? 'Updating...' : (user?.is_junior ? 'Enabled' : 'Disabled')}
                        </span>
                    </div>
                </div>
                <p className={styles.juniorDescription}>
                    Target companies that <b>do</b> hire junior developers.
                </p>
            </div>

            <div className={styles.locations}>
                <p style={{margin:"4px"}}> Locations: </p>
                {user?.locations?.length === 0 && <div className={styles.begin}>To begin, enter your city below.</div>}
                {user?.locations && user.locations.map((location: LocationType, i: number) => (
                    <Location key={i} location={location} handleRemoveLocation={handleRemovelocation} />
                ))}
                {newLocationLoading && <p>Processing new location...</p>}
                <div style={{marginTop:"16px"}}>
                        { !scriptLoaded ? <p>Loading...</p> :
                        <LocationAutoComplete onSelectLocation={(location) => setNewLocation(location)} shouldClearInput={newLocationLoading} />
                        }
                    <AsyncButton asyncAction={handleAddLocation} label="Add Location" />
                </div>
            </div>
        </div>
        <div className={styles.videoContainer}>
                <video className={styles.video} width="100%" src="https://xt8tecpsdo3psbjx.public.blob.vercel-storage.com/tutorial-xAKWu7jLxj4vHKDlPpCVVEVYzZmsDg" controls/>
            </div>
        </div>

    );
};

export default UserAccount;
