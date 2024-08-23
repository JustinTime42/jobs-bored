import React from 'react';
import styles from './Button.module.css';

type ButtonProps = {
    onClick: () => void;
    text: string;
    disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({ onClick, text, disabled}) => {
    return (
        <button onClick={onClick} className={styles.button} disabled={disabled} >
            {text}
        </button>
    );
};

export default Button;