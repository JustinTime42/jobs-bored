'use client';
import React from "react";
import { capitolize } from "@/src/utils/utils";
import styles from "./CompanyCard.module.css";
import WhatshotIcon from '@mui/icons-material/Whatshot'; 
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LinkIcon from '@mui/icons-material/Link'; 
import ExternalLink from "../Link/ExternalLink";
import PeopleIcon from '@mui/icons-material/People';
import { Organization } from "@/src/definitions";
import { useMediaQuery } from 'react-responsive'
import { Facebook, FavoriteBorder, Twitter } from "@mui/icons-material";

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
        twitter_url: string;
        facebook_url: string;
        emails: string[];
        logo_url: string;
    },
    className?: string;
};

const CompanyCard: React.FC<CompanyCardProps> = ({ company, className }) => {
    const { size, locality, name, region, score, id, linkedin_url, twitter_url, facebook_url, logo_url } = company;
    const isMobile = useMediaQuery({ maxWidth: 1200 });
    const shortName = name.length > 25 ? name.slice(0, 20) + "..." : name;
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

    if (isMobile) {
        return (
            <div className={`${styles.card_wide} ${styles[`${className}`]}`}> 
            <img className={styles.company_logo_wide} src={logo_url} alt={company.name} />
                <h4>{name}</h4>
                
                    {/* <Score /> */}
                <div className={styles.links_wide}>
                    <p style={{marginRight:"1em"}}>{locality && `${capitolize(locality)},`} {capitolize(region)}</p>
                    <p><PeopleIcon /> {sizeMap[size]}</p>
                    <ExternalLink href={linkedin_url}><LinkedInIcon/></ExternalLink>
                    <ExternalLink href={company.website_url}><LinkIcon/></ExternalLink>
                    {twitter_url && <ExternalLink href={twitter_url}><Twitter /></ExternalLink>}
                    {facebook_url && <ExternalLink href={facebook_url}><Facebook /></ExternalLink>}
                    <FavoriteBorder />
    
    
                </div>
            </div>
        );
    }
    else {
        return (
            <div className={`${styles.card} ${styles[`${className}`]} w-[400px]`}> 
                <div>
                <h4>{shortName}</h4>
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
    }

};

export default CompanyCard;
