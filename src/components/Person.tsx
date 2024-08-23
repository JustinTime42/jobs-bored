import { Person as PersonType } from '@/src/definitions';
import styles from 'Person.module.css';
import ExternalLink from './Link/ExternalLink';

const Person = ({ person }: { person: PersonType }) => {
    return (
        <div className={styles.person}>
            <div className={styles.person_photo}>
                <img src={person.photo_url} alt={person.name} />
            </div>
            <p>{person.name}</p>
            <p>{person.title}</p>
            {person.linkedin_url && <ExternalLink href={person.linkedin_url }>LinkedIn</ExternalLink>}
            {person.facebook_url && <ExternalLink href={person.facebook_url}>Facebook</ExternalLink>}
            {person.twitter_url && <ExternalLink href={person.twitter_url}>Twitter</ExternalLink>}
            {person.github_url && <ExternalLink href={person.github_url}>GitHub</ExternalLink>}
            <p>{person.city && person.city}{person.state && `, ${person.state}`} </p>
        </div>
    );
}
export default Person;
