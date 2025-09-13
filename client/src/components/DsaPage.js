import React from "react";
import "../styles/dsa.css";
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
    <div className="homepage">
      <section className="hero">
        <div className="hero-content">
          <h1>DSA Visualizations</h1>
          <p>
            Interactive visual exploration of classic Data Structures and Algorithms.
            Master sorting, searching, trees, queues, and linked lists with user-friendly experiences.
          </p>
          <button className="cta-button" onClick={() => window.scrollTo({ top: 700, left: 0, behavior: "smooth" })}>
            Explore Topics
          </button>
        </div>
        <div className="hero-image">
          {/* Use illustration or animation as per project requirements */}
          <img src="https://assets.codepen.io/7773162/dsa-visual.svg" alt="DSA Visual" style={{width: "100%", maxWidth: "400px"}} />
        </div>
      </section>

      <section className="card-section">
        <h2 className="section-title">Topics</h2>
        <div className="topic-cards">
          {topics.map(topic => (
            <div
              className="topic-card"
              key={topic.name}
              tabIndex={0}
              onClick={() => navigate(topic.route)}
              onKeyPress={e => e.key === "Enter" && navigate(topic.route)}
            >
              <span className="card-icon">{topic.icon}</span>
              <h3 className="card-title">{topic.name}</h3>
              <p className="card-desc">{topic.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DsaPage;
