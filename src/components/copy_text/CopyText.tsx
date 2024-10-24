// CopyText.tsx
import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import styles from './CopyText.module.css';

interface CopyTextProps {
  text: string;
}

const CopyText: React.FC<CopyTextProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyClick = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
      } else {
        console.error('Clipboard API not supported');
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={styles.copyTextContainer}>
      <IconButton
        className={styles.iconButton}
        onClick={handleCopyClick}
        title={copied ? 'Copied!' : 'Copy to clipboard'}
        aria-label="copy to clipboard"
      >
        <ContentCopyIcon className={styles.copyIcon} />
      </IconButton>
    </div>
  );
};

export default CopyText;
