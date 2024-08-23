// LocationAutoComplete.tsx
import Input from '@/src/components/input/Input';
import React from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import styles from './LocationAutoComplete.module.css';

interface LocationAutoCompleteProps {
    onSelectLocation: (location: string) => void;
}

const LocationAutoComplete: React.FC<LocationAutoCompleteProps> = ({ onSelectLocation }) => {
    const { ready, value, suggestions: { status, data }, setValue, clearSuggestions } = usePlacesAutocomplete({
        requestOptions: {
            types: ['(cities)'], // Restrict to cities
        },
    });

    const handleSelect = async (address: string) => {
        console.log(address)
        setValue(address, false);
        clearSuggestions();

        try {
            onSelectLocation(address);
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
                        onClick={() => handleSelect(suggestion.description)}
                    >
                        {suggestion.description}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LocationAutoComplete;
