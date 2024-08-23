import styles from './Input.module.css';
interface InputProps {
    label: string;
    type: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    placeholder?: string;
}

const Input = ({ label, type, value, onChange, disabled, placeholder }:InputProps) => {
    return (
        <label className={styles.label}>
            {label}
            <input
                className={styles.input}
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
            />
        </label>
    );
}

export default Input;