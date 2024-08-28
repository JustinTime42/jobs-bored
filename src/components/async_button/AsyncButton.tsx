import { Alert, CircularProgress } from "@mui/material";
import React, { useState } from "react";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

import styles from './AsyncButton.module.css';
interface Props {
  asyncAction: () => Promise<any>;
  label: string;
  style?: React.CSSProperties | undefined;
  size?: "sm" | "lg" | undefined;
}

const AsyncButton = ({
  asyncAction,
  label,
  style = undefined,
  size = undefined,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    asyncAction()
      .then(() => {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 1500);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        style={style}
        className={styles.button}
      >
        {label}
        {loading && (
          <CircularProgress color='secondary' size="20px" />
        )}
        {success && !loading && <CheckCircleIcon color='secondary' />}
      </button>
      {error && (
        <Alert severity="error" >
          {error}
          <button onClick={() => setError(null)}>
            <CloseIcon  />
          </button>
        </Alert>
      )}
    </>
  );
};

export default AsyncButton;
