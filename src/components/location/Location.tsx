import type { Location } from '@/src/definitions';
import styles from './Location.module.css';
import CloseIcon from '@mui/icons-material/Close';

type LocationProps = {
    location: Location;
    handleRemoveLocation: (location: Location) => void;
};

const Location = ({location, handleRemoveLocation}: LocationProps) => {
    return (
        <div className={styles.location}>
            <li>{location.formatted_address}</li>
            <button className={styles.removeButton} onClick={() => handleRemoveLocation(location)}><CloseIcon /></button>
        </div>
    );
}

export default Location;