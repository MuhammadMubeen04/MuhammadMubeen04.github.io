(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Theme */
  var themeToggle = document.getElementById('themeToggle');
  function getPreferredTheme() {
    var stored = localStorage.getItem('portfolio-theme');
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
  }
  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f4f6fb' : '#070b14');
  }
  setTheme(getPreferredTheme());
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* Solid scroll progress (single color) */
  var progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);
  function updateProgress() {
    var doc = document.documentElement;
    var scrollTop = doc.scrollTop || document.body.scrollTop;
    var height = doc.scrollHeight - doc.clientHeight;
    progress.style.width = (height > 0 ? (scrollTop / height) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* Mobile menu */
  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', mobileMenu.classList.contains('open'));
    });
    document.querySelectorAll('.mobile-link').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Navbar */
  var navbar = document.getElementById('navbar');
  function handleNavbarScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 16);
  }
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  /* Active section */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-link');
  function setActiveNav() {
    var current = '';
    var scrollY = window.scrollY;
    sections.forEach(function (section) {
      if (scrollY >= section.offsetTop - 120) current = section.getAttribute('id');
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', setActiveNav, { passive: true });
  setActiveNav();

  /* Stagger */
  function applyStagger(selector) {
    document.querySelectorAll(selector).forEach(function (el, i) {
      el.classList.add('d' + ((i % 10) + 1));
    });
  }
  applyStagger('.projects-grid .project-card');

  /* Project cards: show immediately (no reveal lag on scroll) */
  document.querySelectorAll('.project-card').forEach(function (el) {
    el.classList.add('visible');
    el.classList.remove('reveal');
  });

  applyStagger('.skills-grid .skill-card');
  applyStagger('.timeline-items .timeline-item');
  applyStagger('.edu-list .edu-card');
  document.querySelectorAll('.section-header').forEach(function (el) {
    el.classList.add('reveal');
  });

  /* Reveal */
  var revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: '80px 0px 80px 0px' });
    revealElements.forEach(function (el) { io.observe(el); });
  } else {
    function revealOnScroll() {
      var h = window.innerHeight;
      revealElements.forEach(function (el) {
        if (el.getBoundingClientRect().top < h - 60) el.classList.add('visible');
      });
    }
    window.addEventListener('scroll', revealOnScroll, { passive: true });
    revealOnScroll();
  }

  /* Pointer spotlight + light tilt on cards */
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var cards = document.querySelectorAll('.skill-card, .exp-card, .edu-card, .facts-card');
  cards.forEach(function (card) {
    card.classList.add('tilt-card');
    card.addEventListener('pointermove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
      if (reduceMotion || !canHover) return;
      var rx = ((y / rect.height) - 0.5) * -6;
      var ry = ((x / rect.width) - 0.5) * 6;
      card.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-6px) scale(1.015)';
    });
    card.addEventListener('pointerleave', function () {
      card.style.transform = '';
    });
  });

  /* Ripple */
  document.querySelectorAll('.btn, .theme-toggle, .nav-cta').forEach(function (btn) {
    btn.classList.add('ripple');
    btn.addEventListener('click', function (e) {
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 1.2;
      var span = document.createElement('span');
      span.className = 'ripple-effect';
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - rect.left - size / 2) + 'px';
      span.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(span);
      setTimeout(function () { span.remove(); }, 600);
    });
  });

  /* About paragraphs + timeline line */
  var aboutText = document.querySelector('.about-text');
  if (aboutText && 'IntersectionObserver' in window) {
    var aboutIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          aboutIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    aboutIo.observe(aboutText);
  }
  var timeline = document.querySelector('.timeline');
  if (timeline && 'IntersectionObserver' in window) {
    var tlIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          tlIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    tlIo.observe(timeline);
  }

  /* Footer in view */
  var footer = document.querySelector('.footer');
  if (footer && 'IntersectionObserver' in window) {
    var footIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          footIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    footIo.observe(footer);
  }

  /* Pause background orbs while scrolling — smoother on mobile + laptop */
  var orbTimer = null;
  var bg = document.querySelector('.liquid-bg');
  var scrollTicking = false;
  function onScrollPerf() {
    if (!bg) return;
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(function () {
        bg.classList.add('is-scrolling');
        document.body.classList.add('is-scrolling');
        scrollTicking = false;
      });
    }
    clearTimeout(orbTimer);
    orbTimer = setTimeout(function () {
      bg.classList.remove('is-scrolling');
        document.body.classList.remove('is-scrolling');
    }, 220);
  }
  window.addEventListener('scroll', onScrollPerf, { passive: true });
  window.addEventListener('touchmove', onScrollPerf, { passive: true });

  /* Smooth anchors */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* Project cards visible immediately */
  document.querySelectorAll('.project-card').forEach(function (el) {
    el.classList.add('visible');
    el.classList.remove('reveal');
  });

  window.PROJECTS = [
  {
    "title": "RAG Copilot – Hybrid Search & Reranking",
    "badge": "AI & RAG",
    "category": "AI/ML",
    "github": "https://github.com/MuhammadMubeen04/RAG-Copilot",
    "desc": "End-to-end Retrieval-Augmented Generation system that answers questions from PDF documents using hybrid search and reranking, with source citations.",
    "highlights": [
      "Implemented hybrid retrieval (dense vectors + BM25) for better recall",
      "Added cross-encoder reranking to improve answer precision",
      "Built an interactive Streamlit interface with source citations and latency tracking",
      "Complete pipeline from document ingestion to accurate answer generation"
    ],
    "tools": [
      "Python",
      "Streamlit",
      "ChromaDB",
      "sentence-transformers",
      "BM25",
      "Groq API"
    ]
  },
  {
    "title": "Customer Churn Analysis & Prediction",
    "badge": "ML & Analytics",
    "category": "Analytics",
    "github": "https://github.com/MuhammadMubeen04/Customer-Churn-Analysis-Prediction",
    "desc": "Customer churn project combining business analytics with Machine Learning. Analyzed 3,500 customer records to identify churn drivers and built classification models to predict attrition.",
    "highlights": [
      "Analyzed churn rate by contract, tenure, internet service, and support options",
      "Built and evaluated Logistic Regression and Random Forest models",
      "Identified key features driving customer attrition",
      "Created an interactive Power BI dashboard with retention recommendations"
    ],
    "tools": [
      "SQL",
      "Python",
      "Scikit-learn",
      "Pandas",
      "Power BI"
    ]
  },
  {
    "title": "Sales Performance & Executive Dashboard",
    "badge": "Data Analytics",
    "category": "Analytics",
    "github": "https://github.com/MuhammadMubeen04/Sales-Performance-Executive-Dashboard",
    "desc": "End-to-end sales analytics on 5,000 transactions tracking revenue, profit, regional performance, product trends, and sales team effectiveness.",
    "highlights": [
      "Designed executive KPIs (Total Sales, Profit, Profit Margin, YoY Growth)",
      "Analyzed regional, product, customer, and sales rep performance",
      "Built a multi-page interactive Power BI dashboard for decision-making",
      "Complete SQL to Python EDA to Power BI pipeline"
    ],
    "tools": [
      "SQL",
      "Python",
      "Pandas",
      "Matplotlib",
      "Seaborn",
      "Power BI"
    ]
  },
  {
    "title": "E-Commerce Business Analytics",
    "badge": "Data Analytics",
    "category": "Analytics",
    "github": "https://github.com/MuhammadMubeen04/ECommerce-Business-Analytics",
    "desc": "E-commerce analytics on 5,500 orders evaluating revenue, profit, product performance, discount impact, return rates, ratings, and regional performance.",
    "highlights": [
      "Designed KPIs for revenue, profit margin, return rate, and customer ratings",
      "Analyzed discount impact on profitability and return rates by category",
      "Identified top products, regional performance, and delivery insights",
      "Built a multi-page interactive Power BI dashboard"
    ],
    "tools": [
      "SQL",
      "Python",
      "Pandas",
      "Seaborn",
      "Power BI"
    ]
  },
  {
    "title": "Financial Performance Dashboard",
    "badge": "Data Analytics",
    "category": "Finance",
    "github": "https://github.com/MuhammadMubeen04/Financial-Performance-Dashboard",
    "desc": "Financial analytics for revenue, expenses, profit, margins, and budget vs actual (2022-2025) with an executive Power BI reporting pipeline.",
    "highlights": [
      "Designed KPIs for revenue, expenses, net profit, and profit margin",
      "Analyzed monthly P&L trends and budget vs actual variances",
      "Broke down expenses by category and department",
      "Built a multi-page interactive Power BI dashboard with recommendations"
    ],
    "tools": [
      "SQL",
      "Python",
      "Pandas",
      "Seaborn",
      "Power BI"
    ]
  },
  {
    "title": "Supply Chain & Inventory Analytics",
    "badge": "Data Analytics",
    "category": "Operations",
    "github": "https://github.com/MuhammadMubeen04/Supply-Chain-Inventory-Analytics",
    "desc": "Inventory health, stock-outs, warehouse performance, and supplier reliability across 120 SKUs and multi-city warehouses (Riyadh, Jeddah, Dammam).",
    "highlights": [
      "Designed KPIs for inventory value, stock-out rate, and on-time delivery",
      "Analyzed stock status by category and warehouse",
      "Evaluated supplier lead time, fill rate, and order performance",
      "Built a multi-page Power BI dashboard with reorder and supplier recommendations"
    ],
    "tools": [
      "SQL",
      "Python",
      "Pandas",
      "Seaborn",
      "Power BI"
    ]
  },
  {
    "title": "Tourism & Visitor Traffic Analytics",
    "badge": "Data Analytics",
    "category": "Analytics",
    "github": "https://github.com/MuhammadMubeen04/Tourism-Visitor-Traffic-Analytics",
    "desc": "Multi-year visitor traffic across major destinations covering seasonality, occupancy, trip purpose, and origin markets for planning decisions.",
    "highlights": [
      "Tracked visitor volumes, estimated spend, and occupancy trends",
      "Identified peak months and high-traffic destinations",
      "Analyzed purpose and origin patterns for visitor profiling",
      "Built an interactive Power BI dashboard with operational recommendations"
    ],
    "tools": [
      "SQL",
      "Python",
      "Pandas",
      "Seaborn",
      "Power BI"
    ]
  },
  {
    "title": "Customer Analytics & Segmentation",
    "badge": "ML & Analytics",
    "category": "Analytics",
    "github": "https://github.com/MuhammadMubeen04/Customer-Analytics-Segmentation",
    "desc": "RFM analysis and K-Means clustering on 800 customers into actionable groups: High-Value Champions, Loyal Frequent, Potential, and At-Risk.",
    "highlights": [
      "Calculated RFM metrics (Recency, Frequency, Monetary)",
      "Applied K-Means clustering for customer segmentation",
      "Identified churn risk and created actionable customer groups",
      "Supported targeting and retention strategy with Power BI visuals"
    ],
    "tools": [
      "SQL",
      "Python",
      "Scikit-learn",
      "Pandas",
      "Power BI"
    ]
  },
  {
    "title": "HR Analytics & Employee Attrition Dashboard",
    "badge": "Data Analytics",
    "category": "HR",
    "github": "https://github.com/MuhammadMubeen04/HR-Analytics-Employee-Attrition",
    "desc": "Analyzed 1,200 employee records for attrition drivers including overtime, satisfaction, tenure, and department with HR recommendations.",
    "highlights": [
      "Calculated overall and department-wise attrition rates",
      "Analyzed key drivers such as OverTime, Job Satisfaction, and Tenure",
      "Built a multi-page Power BI dashboard with KPIs and driver analysis",
      "Delivered data-driven insights to support retention strategies"
    ],
    "tools": [
      "SQL",
      "Python",
      "Pandas",
      "Seaborn",
      "Power BI"
    ]
  },
  {
    "title": "Retail SQL Business Case Study",
    "badge": "SQL Analytics",
    "category": "SQL",
    "github": "https://github.com/MuhammadMubeen04/Retail-SQL-Business-Case-Study",
    "desc": "SQL-focused retail case study on a multi-store database. Solved 35 business questions using JOINs, CTEs, window functions, and advanced SQL.",
    "highlights": [
      "Designed and queried a full retail schema with 7 related tables",
      "Answered 35 business questions from basics to advanced SQL",
      "Analyzed revenue, customers, stores, discounts, and return rates",
      "Added light Python KPI charts for portfolio presentation"
    ],
    "tools": [
      "MySQL",
      "SQL",
      "Python",
      "Pandas",
      "Matplotlib"
    ]
  },
  {
    "title": "Gaming Sales & Player Behavior Analytics",
    "badge": "Data Analytics",
    "category": "Analytics",
    "github": "https://github.com/MuhammadMubeen04/Gaming-Sales-Player-Behavior-Analytics",
    "desc": "Analyzed 1,200 games (2012-2025) for sales trends, score patterns, platforms, genres, and top-performing titles and publishers.",
    "highlights": [
      "Analyzed global sales by platform and genre",
      "Compared critic vs user scores and average playtime",
      "Identified top games and publishers by sales performance",
      "Built a modular analysis pipeline with visualizations and insights"
    ],
    "tools": [
      "Python",
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Seaborn"
    ]
  },
  {
    "title": "Gym Membership & Fitness Analytics",
    "badge": "Data Analytics",
    "category": "Analytics",
    "github": "https://github.com/MuhammadMubeen04/Gym-Membership-Fitness-Analytics",
    "desc": "Membership analytics on 800 members and 12,800+ check-ins covering attendance, class popularity, peak hours, and retention.",
    "highlights": [
      "Analyzed membership plans, active rates, and member status",
      "Identified popular classes and peak gym hours",
      "Examined demographics and visit frequency by plan",
      "Delivered actionable insights on engagement and retention"
    ],
    "tools": [
      "Python",
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Seaborn"
    ]
  },
  {
    "title": "Multi-Model LLM & RAG Assistant Application",
    "badge": "AI & Web",
    "category": "AI/ML",
    "github": null,
    "desc": "Interactive AI web app integrating multi-LLM APIs for real-time document analysis and NLP tasks with a Streamlit interface.",
    "highlights": [
      "Integrated multiple LLM backends for flexible inference",
      "Supported document analysis and NLP workflows",
      "Built a clean interactive Streamlit user interface",
      "Focused on practical AI application patterns"
    ],
    "tools": [
      "Python",
      "Streamlit",
      "LLM APIs",
      "Ollama",
      "Git"
    ]
  },
  {
    "title": "AI-Driven Predictive Sales & Customer Analytics",
    "badge": "Machine Learning",
    "category": "AI/ML",
    "github": null,
    "desc": "Machine learning workflow using Scikit-learn to forecast customer behavior and sales trends with preprocessing and evaluation.",
    "highlights": [
      "Built predictive models for sales and customer behavior",
      "Performed feature preprocessing and model evaluation",
      "Generated insights to support forecasting decisions",
      "Documented end-to-end ML workflow"
    ],
    "tools": [
      "Python",
      "Scikit-learn",
      "Pandas",
      "Matplotlib"
    ]
  },
  {
    "title": "Enterprise Network & Security Infrastructure",
    "badge": "Networking",
    "category": "Security",
    "github": null,
    "desc": "Simulated multi-site corporate network with routing, Active Directory, DHCP, GPO, Static NAT, and role-based access control.",
    "highlights": [
      "Designed multi-site enterprise network topology",
      "Configured Active Directory, DHCP, and Group Policy",
      "Implemented Static NAT and access controls",
      "Validated connectivity and security policies in lab environment"
    ],
    "tools": [
      "Packet Tracer",
      "Windows Server",
      "AD DS",
      "GPO"
    ]
  },
  {
    "title": "Secure Relational Banking & Transaction System",
    "badge": "Full-Stack",
    "category": "Web",
    "github": null,
    "desc": "Database-backed banking application with secure authentication, real-time transactions, and automated ledger reporting.",
    "highlights": [
      "Implemented secure authentication and session handling",
      "Supported real-time transaction workflows",
      "Built relational schema for accounts and ledgers",
      "Generated automated reporting outputs"
    ],
    "tools": [
      "PHP",
      "MySQL",
      "JavaScript",
      "Tailwind"
    ]
  },
  {
    "title": "NextGen Gaming Content Showcase Platform",
    "badge": "Web Dev",
    "category": "Web",
    "github": null,
    "desc": "Responsive dynamic web platform with database-driven content management, catalog filtering, and modern UI/UX design.",
    "highlights": [
      "Built responsive catalog and content pages",
      "Implemented database-driven content management",
      "Added filtering and showcase interactions",
      "Focused on clean modern UI/UX"
    ],
    "tools": [
      "PHP",
      "MySQL",
      "JavaScript",
      "Bootstrap"
    ]
  },
  {
    "title": "Interactive Web-Based Assessment & Quiz System",
    "badge": "Web Dev",
    "category": "Web",
    "github": null,
    "desc": "Online assessment portal with dynamic question generation, real-time scoring, and automated user result tracking.",
    "highlights": [
      "Dynamic question generation and quiz flow",
      "Real-time response scoring",
      "Automated user result tracking",
      "Database-backed assessment storage"
    ],
    "tools": [
      "PHP",
      "JavaScript",
      "MySQL",
      "HTML/CSS"
    ]
  }
];


  /* Project modal handled by inline script in index.html */

})();
