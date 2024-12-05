'use client';

import { useState, useEffect } from "react";
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AsyncButton from "../async_button/AsyncButton";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";

export type FiltersState = {
    userId: string | null;
    localities: string[] | null;
    page_size: number;
    previous_score: number | null;
    previous_id: string | null;
};

type FiltersProps = {
    userLocations: any[];
    filters: FiltersState;
    toggleFavorites: () => void;
    toggleLocality: (locality: string) => void;
    submitQuery: () => Promise<void>;
};

const Filters = ({userLocations, filters, toggleFavorites, toggleLocality, submitQuery}: FiltersProps) => {
    const [includeRemote, setIncludeRemote] = useState(false);
    const toggleRemote = () => {
        if (includeRemote) {
            userLocations.forEach(location => {
                if (!filters.localities?.includes(location.locality)) {
                    toggleLocality(location.locality)
                }
            })   
        } else {
            userLocations.forEach(location => {
                if (filters.localities?.includes(location.locality)) {
                    toggleLocality(location.locality)
                }
            }) 
        }
 
        setIncludeRemote(!includeRemote)

    }
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <h4>Filters</h4>
            </AccordionSummary>
            <AccordionDetails>
                <FormGroup>
                    <FormControlLabel
                        control={<Checkbox checked={!!filters.userId} onChange={toggleFavorites} />}
                        label="Favorites"
                    />
                    {userLocations?.map((location) => (
                        <FormControlLabel
                            key={location.locality}
                            control={
                                <Checkbox
                                    checked={!!filters.localities?.includes(location.locality)}
                                    onChange={() => toggleLocality(location.locality)}
                                />
                            }
                            label={location.locality}
                        />
                    ))}
                    <FormControlLabel
                        control={<Checkbox checked={!!includeRemote} onChange={() => toggleRemote()} />}
                        label="Include Remote"
                    />

                
                </FormGroup>
                <AsyncButton
                    asyncAction={submitQuery}
                    label="Submit"
                />
            </AccordionDetails>                        
        </Accordion>

    );
}
export default Filters;