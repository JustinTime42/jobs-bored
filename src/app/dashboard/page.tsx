'use client'
import React, { useEffect, useState } from 'react';
import { useUserContext } from '../context/UserContext';
import { useRouter } from 'next/navigation';
import { getUserDetails } from '@/src/actions/user';
import { getFavoriteCompanies } from '@/src/actions/organizations';
import Link from 'next/link';
import styles from './page.module.css';
import useLocalOrganizations from '../hooks/useLocalOrgs';
import ExternalLink from '@/src/components/Link/ExternalLink';
import { Organization } from '@/src/definitions';
import CompanyCard from '@/src/components/company_card/CompanyCard';

export type orgType = {
    details: Organization;
}[]
const Dashboard = () => {

    return (
        <div className={styles.container}>           
    
        </div>

    );
};

export default Dashboard;