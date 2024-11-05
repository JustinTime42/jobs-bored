import { useState } from 'react';
import { Tooltip, IconButton } from '@mui/material';
import { Email as EmailIcon, MailOutline as MailOutlineIcon } from '@mui/icons-material';
import { getPersonEmail } from '@/src/actions/apolloPeople';
import styles from './EmailDownloadLink.module.css';
import { supabase } from '@/src/utils/supabase/client';

const EmailDownloadLink = ({ email, id }: { email : string | null, id: string}) => {
    const [currentEmail, setCurrentEmail] = useState(email);
    const [copied, setCopied] = useState(false);

    const getEmail = async (id: string) => {
        return await getPersonEmail(id)
    }

    const handleClick = async () => {
        let email = '';
        try {
            if (navigator.clipboard) {
                if (currentEmail && currentEmail !== 'Email Unavailable') {
                    await navigator.clipboard.writeText(currentEmail).then(() => {
                        email = currentEmail;
                        setCopied(true);
                        console.log('Email copied to clipboard');
                    }).catch((error) => {
                        console.error('Failed to copy email:', error);
                    });
                    setTimeout(() => setCopied(false), 2000);
                    return;
                }
                // If email is null, fetch the email using the provided getEmail function
                if (!currentEmail) {
                    try {
                        const fetchedEmail = await getEmail(id);
                        setCurrentEmail(fetchedEmail);
                        email = fetchedEmail;
                        // Automatically copy the fetched email to clipboard
                        navigator.clipboard.writeText(fetchedEmail).then(() => {
                            setCopied(true);
                            console.log('Email copied to clipboard');
                        }).catch((error) => {
                            console.error('Failed to copy email:', error);
                        });
                        setTimeout(() => setCopied(false), 2000);
                    } catch (error) {
                    console.error('Failed to fetch email:', error);
                    }
                }
                await supabase.from('activity_log').insert([
                    { type: 'copyEmail', contact: id, body: email }
                ]);
            } 
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <IconButton 
            className={styles.iconButton}
            onClick={handleClick} 
            title={currentEmail === 'Email Unavailable' ? 'Email Unavailable' : copied ? 'Copied!' : 'Copy email to clipboard'}
            >
            {currentEmail === 'Email Unavailable' ? (
                <MailOutlineIcon />
                ) : (
                <EmailIcon />
            )}
        </IconButton>
    );
};

export default EmailDownloadLink;