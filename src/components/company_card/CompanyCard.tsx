import React from "react";
import { capitolizeLocation } from "@/src/utils/utils";
import Link from "next/link";
import styles from "./CompanyCard.module.css";
import WhatshotIcon from '@mui/icons-material/Whatshot';  
import ExternalLink from "../Link/ExternalLink";
import { supabase } from "@/src/utils/supabase/client";

type CompanyCardProps = {
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
    }
};

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
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

    const handleOpenCompany = async () => {
        await supabase.from('activity_log').insert([
            { type: 'viewCompanyDetails', contact: company.id, body: company.name }
        ]);
        return
    }

    return (
        <div className={styles.card}>
            <Link onClick={handleOpenCompany}  href={`/dashboard/${id}`}>
                <h4>{name}</h4>  
            </Link>        
            <div className={styles.container}>
                <div>
                    <p>{locality && `${locality},`} {region}</p>
                    <p>Size: {sizeMap[size]}</p>
                    <Score />
                </div>
                <div>
                    <ExternalLink href={linkedin_url}>LinkedIn</ExternalLink>
                    <ExternalLink href={company.website_url}>Website</ExternalLink>
                </div>
                {/* <div className={styles.emails}>            
                    {company.emails?.map(email => <a key={email} href={`mailto:${email}`}>{email}</a>)}
                </div> */}
            </div>
        </div>
    );
};

export default CompanyCard;
