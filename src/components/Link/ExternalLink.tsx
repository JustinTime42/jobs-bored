import React from 'react';
import Link from 'next/link';
import styles from './Link.module.css';

interface LinkProps {
    href: string;
    className?: string;
    children: React.ReactNode;
}

const ExternalLink: React.FC<LinkProps> = ({ href, className, children }) => {
    return (
        <a target="_blank" className={styles.link + (className ? ' ' + className : '')} href={href}>
            {children}
        </a>
    );
};

export default ExternalLink;