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

    const handleOpenLink = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); 
        
        // Open the link first
        window.open(href, '_blank', 'noopener,noreferrer');
        
        // Then log the activity asynchronously
        try {
            await supabase.from('activity_log').insert([
                { type: 'openExternalLink', contact: href, body: href }
            ]);
        } catch (error) {
            console.error('Failed to log activity:', error);
        }
    }

    return (
        <a 
            onClick={handleOpenLink} 
            className={styles.link + (className ? ' ' + className : '')} 
            href={href}
            role="link"
            tabIndex={0}
            onKeyPress={(e) => {
                if (e.key === 'Enter') {
                    handleOpenLink(e as unknown as React.MouseEvent);
                }
            }}
        >
            {children}
        </a>
    );
};

export default ExternalLink;