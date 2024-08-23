import { Alert, CircularProgress } from "@mui/material";
import React, { useState } from "react";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
        }, 1300);
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
          <CircularProgress size="20px" />
        )}
        {success && !loading && <CheckCircleIcon />}
      </button>
      {error && (
        <Alert severity="error" >
          {error}
        </Alert>
      )}
    </>
  );
};

export default AsyncButton;
