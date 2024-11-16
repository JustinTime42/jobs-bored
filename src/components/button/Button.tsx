import React from 'react';
import styles from './Button.module.css';

type ButtonProps = {
    onClick: () => void;
    text: string;
    disabled?: boolean;
    className?: string;
};

const Button: React.FC<ButtonProps> = ({ onClick, text, disabled, className}) => {
    return (
        <button onClick={onClick} className={className} disabled={disabled} >
            {text}
        </button>
    );
};

export default Button;