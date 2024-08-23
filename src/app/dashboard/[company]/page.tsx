'use server'
import { getCompanyDetails } from "@/src/api/organizations";
import ExternalLink from "@/src/components/Link/ExternalLink";
import { Organization } from "@/src/definitions";
import styles from './CompanyPage.module.css';
import { getPeopleInOrganization } from "@/src/api/people";
const CompanyPage = async({ params }: { params: {company: string}}) => {
    const companyDetails = await getCompanyDetails(params.company)
    const people = await getPeopleInOrganization(params.company)
    return (
        <>
        <div className={styles.company}>            
            <div>
                <h3>{companyDetails.name}</h3>
                {companyDetails.website_url && <ExternalLink href={companyDetails.website_url}>Website</ExternalLink>}
                {companyDetails.linkedin_url && <ExternalLink href={companyDetails.linkedin_url}>LinkedIn</ExternalLink>}
                {companyDetails.twitter_url && <ExternalLink href={companyDetails.twitter_url}>Twitter</ExternalLink>}
                {companyDetails.facebook_url && <ExternalLink href={companyDetails.facebook_url}>Facebook</ExternalLink>}
            </div>
            <div>
                {companyDetails.phone && <p>{companyDetails.phone}</p>}
                {companyDetails.emails && <div>{companyDetails.emails.map(email => <a href={`mailto:${email}`}>{email}</a>)}</div>}
            </div>
            <img className={styles.company_logo} src={companyDetails.logo_url} alt={companyDetails.name} />

        </div>
        <div>
            {people.map(person => (
                <div className={styles.person}>
                    <img className={styles.person_photo} src={person.photo_url} alt={person.name} />
                    <div>
                        <p>{person.name}</p>
                        <p>{person.title}</p>
                        <p>{person.city && person.city}{person.state && `, ${person.state}`} </p>
                    </div>
                    {person.linkedin_url && <ExternalLink href={person.linkedin_url }>LinkedIn</ExternalLink>}
                    {person.facebook_url && <ExternalLink href={person.facebook_url}>Facebook</ExternalLink>}
                    {person.twitter_url && <ExternalLink href={person.twitter_url}>Twitter</ExternalLink>}
                    {person.github_url && <ExternalLink href={person.github_url}>GitHub</ExternalLink>}
                    
                </div>
            ))}
        </div>
    </>
    );
};

export default CompanyPage;