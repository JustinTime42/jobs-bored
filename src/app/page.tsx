"use client";
import { useUserContext } from "./context/UserContext";
import { useEffect } from "react";
import styles from './Index.module.css';
import BarChartIcon from '@mui/icons-material/BarChart';
export default function Index() {

  return (
    <div>
        <section className={styles.hero}>
            <div className={styles.heroCard}>
                <h1 className={styles.headline}>A better way to find your next tech job!</h1>
                <p>Tired of hitting <b>easy-apply</b>? Let our platform help you find jobs where you are the <b>only</b> candidate. </p>

            </div>
            <div className={styles.heroshotContainer}>
                <img className={styles.heroImage} src="heroshot.png" alt="Snow Plow" />
            </div>
        </section>
        <div className={styles.benefits}>
            <h2>Save Time</h2>
            <h2>Find Jobs</h2>
            <h2>Get Hired</h2>
        </div>
        <div className={styles.hook}>
            <h2>Don't Waste Time</h2>
            <p>Stop spending hours per week scrolling companies and job postings on the big job boards. We'll help you work <b>smarter</b>.</p>     
        </div>
        <div className={styles.features}>
            <div className={styles.feature}>
                <h3><BarChartIcon />Placeholder Feature</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </p>
            </div>
            <div className={styles.feature}>
                <h3><BarChartIcon />Placeholder Feature</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </p>
            </div>
            <div className={styles.feature}>
                <h3><BarChartIcon />Placeholder Feature</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </p>
            </div>
            <div className={styles.feature}>
                <h3><BarChartIcon />Placeholder Feature</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </p>
            </div>
            <div className={styles.feature}>
                <h3><BarChartIcon />Placeholder Feature</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </p>
            </div>
            <div className={styles.feature}>
                <h3><BarChartIcon />Placeholder Feature</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </p>
            </div>


        </div>
    </div>
  );
}

