import type { Location } from '@/src/definitions';
import styles from './Location.module.css';
import CloseIcon from '@mui/icons-material/Close';

type LocationProps = {
    location: Location;
    handleRemoveLocation: (location: Location) => void;
};

const Location = ({location, handleRemoveLocation}: LocationProps) => {
    // Use localized_formatted_address if available, otherwise fall back to formatted_address
    const displayAddress = location.localized_formatted_address || location.formatted_address;
    
    return (
        <div className={styles.location}>
            <li>{displayAddress}</li>
            <button className={styles.removeButton} onClick={() => handleRemoveLocation(location)}><CloseIcon /></button>
        </div>
    );
}

export default Location;