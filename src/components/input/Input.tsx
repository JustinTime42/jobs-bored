import styles from './Input.module.css';
interface InputProps {
    label: string;
    type: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = ({ label, type, value, onChange }:InputProps) => {
    return (
        <label className={styles.label}>
            {label}
            <input
                className={styles.input}
                type={type}
                value={value}
                onChange={onChange}
            />
        </label>
    );
}

export default Input;