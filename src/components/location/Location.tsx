import styles from './Location.module.css';
import CloseIcon from '@mui/icons-material/Close';

type LocationProps = {
    location: string;
    handleRemoveLocation: (location: string) => void;
};
const Location = ({location, handleRemoveLocation}: LocationProps) => {
    const locationArray = location.split(' ');
    const locality = locationArray[0].charAt(0).toUpperCase() + locationArray[0].slice(1);
    const region = (locationArray[1].length < 4) ?
        locationArray[1].toUpperCase() :  
        locationArray[1].charAt(0).toUpperCase() + locationArray[1].slice(1);
    const country = locationArray[2] && ((locationArray[2].length < 4) ?
        locationArray[2].toUpperCase() :  
        locationArray[2].charAt(0).toUpperCase() + locationArray[2].slice(1));
    return (
        <div className={styles.location}>
            <li>{`${locality} ${region} ${country || ''}`}</li>
            <button className={styles.removeButton} onClick={() => handleRemoveLocation(location)}><CloseIcon /></button>
        </div>
    );
}

export default Location;