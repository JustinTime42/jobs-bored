import React from "react";
import { capitolize } from "@/src/utils/utils";
import styles from "./CompanyCard.module.css";
import WhatshotIcon from '@mui/icons-material/Whatshot'; 
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LinkIcon from '@mui/icons-material/Link'; 
import ExternalLink from "../Link/ExternalLink";
import PeopleIcon from '@mui/icons-material/People';
import { Organization } from "@/src/definitions";

export type CompanyCardProps = {
    company: {
        size: number;
        country: string;
        id: string;
        locality: string;
        name: string;
        region: string;
        score: number;
        website_url: string;
        linkedin_url: string;
        emails: string[];
    },
    viewDetails:(company:Partial<Organization>) => void,
    className?: string;
};

const CompanyCard: React.FC<CompanyCardProps> = ({ company, viewDetails, className }) => {
    const { size, locality, name, region, score, id, linkedin_url } = company;
    
    const sizeMap: { [key: number]: string } = {
        0: '1-10',
        1: '11-50',
        2: '51-200',
        3: '201-500',
        4: '501-1000',
        5: '1001-5000',
        6: '5001-10000',
        7: '10001+'
    };

    const Score = () => {
        const scoreArray = [];
        for (let i = 0; i < score; i++) {
            scoreArray.push(<WhatshotIcon key={i}/>) 
        }
        return (
            <div>
                {scoreArray}
            </div>
        )
    }

    return (
        <div onClick={() => viewDetails(company)} className={`${styles.card} ${styles[`${className}`]} w-[400px] xl:w-[500px]`}> 
            <div>
            <h4>{name}</h4>
                <p>{locality && `${capitolize(locality)},`} {capitolize(region)}</p>
                
                {/* <Score /> */}
            </div>
            <div className={styles.links}>
                <p><PeopleIcon style={{marginBottom:"8px"}}/> {sizeMap[size]}</p>
                <div>
                    <ExternalLink href={linkedin_url}><LinkedInIcon/></ExternalLink>
                    <ExternalLink href={company.website_url}><LinkIcon/></ExternalLink>
                </div>


            </div>
        </div>
    );
};

export default CompanyCard;
