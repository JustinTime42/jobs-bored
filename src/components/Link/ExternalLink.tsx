import React from 'react';
import Link from 'next/link';
import styles from './Link.module.css';
import { createClient } from '@/src/utils/supabase/client';

interface LinkProps {
    href: string;
    className?: string;
    children: React.ReactNode;
}

const ExternalLink: React.FC<LinkProps> = ({ href, className, children }) => {
    const supabase = createClient();

    const handleOpenLink = async () => {
        await supabase.from('activity_log').insert([
            { type: 'openExternalLink', contact: href, body: href }
        ]);
        return
    }

    return (
        <a onClick={handleOpenLink} target="_blank" className={styles.link + (className ? ' ' + className : '')} href={href}>
            {children}
        </a>
    );
};

export default ExternalLink;