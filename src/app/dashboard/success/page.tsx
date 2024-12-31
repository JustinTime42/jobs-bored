import Link from 'next/link';
import styles from './page.module.css';

const SuccessPage = () => {
  return (
    <div className={styles.container}>
      <h2>Subscription Successful!</h2>
      <p className={styles.message}>
        Thank you for subscribing! You can now enjoy all premium features.
      </p>
      <div className={styles.links}>
        <Link href="/dashboard/settings" className={styles.link}>
          Go to Account Settings
        </Link>
        <Link href="/dashboard/feed" className={styles.link}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default SuccessPage;
