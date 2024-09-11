import React from "react";
import { capitolizeLocation } from "@/src/utils/utils";
import Link from "next/link";
import styles from "./CompanyCard.module.css";
import WhatshotIcon from '@mui/icons-material/Whatshot';  

type CompanyCardProps = {
    company: {
        company_size: number;
        country: string;
        id: string;
        locality: string;
        name: string;
        region: string;
        score: number;
        website_url: string;
    }
};

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
    const { company_size, locality, name, region, score, id } = company;

    const capitalizedLocality = locality ? capitolizeLocation(locality): "";
    const capitalizedRegion = region ? capitolizeLocation(region): "";
    
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
        <div className={styles.card}>
            <Link href={`/dashboard/${id}`}>
                <h4>{name}</h4>                
                <p>{capitalizedLocality && `${capitalizedLocality},`} {capitalizedRegion}</p>
                <p>Size: {sizeMap[company_size]}</p>
                <Score />
            </Link>
        </div>
    );
};

export default CompanyCard;
