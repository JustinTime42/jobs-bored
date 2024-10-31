import { Person } from '@/src/definitions';
import styles from './PersonInfo.module.css';
import ExternalLink from '../Link/ExternalLink';
import { LinkedIn, Facebook, Twitter, GitHub } from '@mui/icons-material';
import EmailDownloadLink from '../email_link/EmailDownloadLink';

const PersonInfo = ({person}: {person:Person}) => {

    return (
        <div key={person.id} className={styles.person}>
            <div className="flex row items-center">
                <img className={styles.person_photo} src={person.photo_url} alt={person.name} />
                <div>
                <p>{person.name}</p>                        
                <p>{person.title && `${person.title}`}</p>
                <p>{person.headline && `${person.headline}`}</p>
                </div>

            </div>

            <div className="flex row items-center">
            <p>{person.city && person.city}{person.state && `, ${person.state}`} </p>
            <div className={styles.person_links}>
                {person.linkedin_url && <ExternalLink href={person.linkedin_url }><LinkedIn /></ExternalLink>}
                {person.facebook_url && <ExternalLink href={person.facebook_url}><Facebook /></ExternalLink>}
                {person.twitter_url && <ExternalLink href={person.twitter_url}><Twitter /></ExternalLink>}
                {person.github_url && <ExternalLink href={person.github_url}><GitHub /></ExternalLink>}
                <EmailDownloadLink email={person.email} id={person.id} />
            </div>
            </div>

        </div>
    )
}

export default PersonInfo;