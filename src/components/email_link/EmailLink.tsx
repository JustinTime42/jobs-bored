import { ContentCopy, Email } from '@mui/icons-material';
import styles from './EmailLink.module.css';
import CopyText from '../copy_text/CopyText';
const EmailLink = ({email}:{email:string}) => {
    return (
        <div className={styles.email}>            
            <a key={email} href={`mailto:${email}`}>
                <Email /> {email} 
            </a>
            <CopyText text={email} />
        </div>
    )
}
export default EmailLink;