"use client";
import styles from './Index.module.css';
import Header from "../components/Header";
import { AccountCircle, Business, HowToReg, School, ArrowForward } from "@mui/icons-material";

export default function Index() {

  return (
    <div className={styles.container}>
      <Header />
      <section className={styles.hero}>
        <div className={styles.heroCard}>
          <h2>Be Your Own Recruiter</h2>
          <p>Tired of hitting <b>easy-apply</b>? Let our platform help you work <b>smarter</b> and find jobs where you are the <b>only</b> candidate.</p>
        </div>
        <div className={styles.heroshotContainer}>
          <img className={styles.heroImage} src="heroshot.png" alt="Frustrated at computer" />
        </div>
      </section>

      <div className={styles.benefits}>
        <h2>Save Time</h2>
        <h2>Find Jobs</h2>
        <h2>Get Hired</h2>
      </div>

      <div className={styles.features}>
        <div className={styles.feature}>
          <h3><AccountCircle /> Register</h3>
          <p>Register using your Github Account. Try it out for free!</p>
        </div>
        <div className={styles.feature}>
          <h3><Business /> Find Employers</h3>
          <p>We find companies in your area already interested in your skills.</p>
        </div>
        <div className={styles.feature}>
          <h3><HowToReg /> Show Your Value</h3>
          <p>We'll provide contact information for key decision makers in companies that match your profile.</p>
        </div>
      </div>

      <section className={styles.mentorship}>
        <h2><School /> Maximize Your Potential with Expert Guidance</h2>
        <p>We've partnered with         
            <a href="crushingdigital.com" className={styles.mentorLink}>
                Crushing Digital
            </a> 
            to provide you with the skills needed to truly stand out. Learn how to showcase your value effectively with practical tips directly tied to our system.</p>

      </section>

      <footer className={styles.footer}>
        <small>© 2024 Jobs Bored. All rights reserved.</small>
      </footer>
    </div>
  );
}
