import React from "react";
import styles from "../styles/dsa.module.css";
import { useNavigate } from "react-router-dom";

const topics = [
  {
    name: "Sorting Algorithms",
    desc: "Visualize popular sorting techniques like Bubble, Merge, and Quick Sort.",
    route: "/sorting",
    icon: "🔄"
  },
  {
    name: "Searching Algorithms",
    desc: "Discover Binary Search, Linear Search, and more.",
    route: "/searching",
    icon: "🔍"
  },
  {
    name: "Trees",
    desc: "Explore BST, BT and tree traversals interactively.",
    route: "/trees",
    icon: "🌳"
  },
  {
    name: "Queues",
    desc: "Understand FIFO data structure, operations and visualizations.",
    route: "/queues",
    icon: "📥"
  },
  {
    name: "Linked Lists",
    desc: "Visualize insertion, deletion, and traversal in lists.",
    route: "/linkedlists",
    icon: "🔗"
  }
];

const DsaPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.dsaPage}>
      <section className={styles.dsaHero}>
        <div className={styles.dsaHeroContent}>
          <h1>DSA Visualizations</h1>
          <p>
            Interactive visual exploration of classic Data Structures and Algorithms.
            Master sorting, searching, trees, queues, and linked lists with user-friendly experiences.
          </p>
          <button className={styles.dsaCtaButton} onClick={() => window.scrollTo({ top: 700, left: 0, behavior: "smooth" })}>
            Explore Topics
          </button>
        </div>
        <div className={styles.dsaHeroImage}>
          <img src="https://assets.codepen.io/7773162/dsa-visual.svg" alt="DSA Visual" style={{width: "100%", maxWidth: "400px"}} />
        </div>
      </section>

      <section className={styles.dsaCardSection}>
        <h2 className={styles.dsaSectionTitle}>Topics</h2>
        <div className={styles.dsaTopicCards}>
          {topics.map(topic => (
            <div
              className={styles.dsaTopicCard}
              key={topic.name}
              tabIndex={0}
              onClick={() => navigate(topic.route)}
              onKeyPress={e => e.key === "Enter" && navigate(topic.route)}
            >
              <span className={styles.dsaCardIcon}>{topic.icon}</span>
              <h3 className={styles.dsaCardTitle}>{topic.name}</h3>
              <p className={styles.dsaCardDesc}>{topic.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DsaPage;