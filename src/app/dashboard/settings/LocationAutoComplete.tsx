import Input from '@/src/components/input/Input';
import React, { useEffect } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng, Suggestion, getDetails, DetailsResult } from 'use-places-autocomplete';
import styles from './LocationAutoComplete.module.css';
import { LocationAutoCompleteProps } from '@/src/definitions';

const LocationAutoComplete: React.FC<LocationAutoCompleteProps> = ({ onSelectLocation, shouldClearInput }) => {

    const { ready, value, suggestions: { status, data }, setValue, clearSuggestions } = usePlacesAutocomplete({
        requestOptions: {
            types: ['(cities)'],
        },
    });

    useEffect(() => {
        if (shouldClearInput) {
            clearSuggestions();
            setValue('', false);
        }
    }, [shouldClearInput]);
    
    const handleSelect = async (suggestion: Suggestion) => {
        // First get details in user's locale for display
        const localizedDetails: google.maps.places.PlaceResult | string = await getDetails({
            placeId: suggestion.place_id,
            fields: ['address_components', 'formatted_address', 'name', 'adr_address', 'place_id']
        });

        // Then get the same details but in English for database storage
        const englishDetails: google.maps.places.PlaceResult | string = await getDetails({
            placeId: suggestion.place_id,
            fields: ['address_components', 'formatted_address', 'name', 'adr_address', 'place_id'],
            language: 'en' // Force English language results
        });

        clearSuggestions();
        
        console.log("Localized Details", localizedDetails);
        console.log("English Details", englishDetails);
        
        try {
            if (typeof localizedDetails === 'string' || typeof englishDetails === 'string') {
                console.error('Error fetching place details:', 
                    typeof localizedDetails === 'string' ? localizedDetails : englishDetails);
            } else {
                // Pass both localized and English details to parent
                onSelectLocation({
                    // For display to user - use localized version
                    address_components: localizedDetails.address_components,
                    formatted_address: localizedDetails.formatted_address,
                    // For database storage - use English version
                    english_address_components: englishDetails.address_components,
                    english_formatted_address: englishDetails.formatted_address,
                });
                // Display the localized version in the input
                setValue(localizedDetails.formatted_address || '', false);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            {ready &&
                <Input
                    label="Add Location"
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Search Cities..."
                />
            }

            <div className="autocomplete-dropdown-container">
                {status === 'OK' && data.map((suggestion) => (
                    <div
                        className={styles.suggestion}
                        key={suggestion.place_id}
                        onClick={() => handleSelect(suggestion)}
                    >
                        {suggestion.description}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LocationAutoComplete;
