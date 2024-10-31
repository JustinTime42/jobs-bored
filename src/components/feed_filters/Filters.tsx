'use client';

import { useState } from "react";
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AsyncButton from "../async_button/AsyncButton";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";

export type FiltersState = {
    userId: string;
    localities: string[];
};

type FiltersProps = {
    userLocations: any[];
    filters: FiltersState;
    toggleFavorites: () => void;
    toggleLocality: (locality: string) => void;
    submitQuery: () => Promise<void>;
};

const Filters = ({userLocations, filters, toggleFavorites, toggleLocality, submitQuery}: FiltersProps) => {
    console.log(userLocations)
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