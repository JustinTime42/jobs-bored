import React from 'react';
import styles from './Button.module.css';

type ButtonProps = {
    onClick: () => void;
    text: string;
};

const Button: React.FC<ButtonProps> = ({ onClick, text }) => {
    return (
        <button onClick={onClick} className={styles.button}>
            {text}
        </button>
    );
};

export default Button;