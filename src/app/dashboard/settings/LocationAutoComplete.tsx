import Input from '@/src/components/input/Input';
import React from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng, Suggestion, getDetails, DetailsResult } from 'use-places-autocomplete';
import styles from './LocationAutoComplete.module.css';
import { LocationAutoCompleteProps } from '@/src/definitions';

const LocationAutoComplete: React.FC<LocationAutoCompleteProps> = ({ onSelectLocation }) => {
    const { ready, value, suggestions: { status, data }, setValue, clearSuggestions } = usePlacesAutocomplete({
        requestOptions: {
            types: ['(cities)'],
        },
    });

    const handleSelect = async (suggestion: Suggestion) => {
        const details: google.maps.places.PlaceResult | string = await getDetails({
            placeId: suggestion.place_id,
            fields: ['address_components', 'formatted_address', 'name','adr_address', 'place_id']
          });

        clearSuggestions();
        
          console.log("Details", details);
        try {
            if (typeof details === 'string') {
                console.error('Error fetching place details:', details);
              } else {
                onSelectLocation({
                    address_components: details.address_components,
                    formatted_address: details.formatted_address,
                });
                setValue(details.formatted_address || '', false);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <Input
                label="Add Location"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={!ready}
                placeholder="Search Cities..."
            />
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
