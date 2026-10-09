/**
 * Project data — single source of truth for the cards, the details dialog,
 * the hero chart and the filters. To add a project: append an object here and add a
 * matching card in index.html (copy any existing .project-card and change data-project).
 * groups: analytics | ml | web  (used by the filter chips)
 */
window.PROJECTS = [
  {
    title: "RAG Copilot – Hybrid Search & Reranking",
    badge: "AI & RAG",
    category: "AI/ML",
    github: "https://github.com/MuhammadMubeen04/RAG-Copilot",
    desc: "End-to-end Retrieval-Augmented Generation system that answers questions from PDF documents using hybrid search and reranking, with source citations.",
    highlights: [
      "Implemented hybrid retrieval (dense vectors + BM25) for better recall",
      "Added cross-encoder reranking to improve answer precision",
      "Built an interactive Streamlit interface with source citations and latency tracking",
      "Complete pipeline from document ingestion to accurate answer generation"
    ],
    tools: [
      "Python",
      "Streamlit",
      "ChromaDB",
      "sentence-transformers",
      "BM25",
      "Groq API"
    ],
    slug: "rag-copilot-hybrid-search-and-reranking",
    groups: [
      "ml"
    ]
  },
  {
    title: "Customer Churn Analysis & Prediction",
    badge: "ML & Analytics",
    category: "Analytics",
    github: "https://github.com/MuhammadMubeen04/Customer-Churn-Analysis-Prediction",
    desc: "Customer churn project combining business analytics with Machine Learning. Analyzed 3,500 customer records to identify churn drivers and built classification models to predict attrition.",
    highlights: [
      "Analyzed churn rate by contract, tenure, internet service, and support options",
      "Built and evaluated Logistic Regression and Random Forest models",
      "Identified key features driving customer attrition",
      "Created an interactive Power BI dashboard with retention recommendations"
    ],
    tools: [
      "SQL",
      "Python",
      "Scikit-learn",
      "Pandas",
      "Power BI"
    ],
    slug: "customer-churn-analysis-and-prediction",
    groups: [
      "analytics",
      "ml"
    ]
  },
  {
    title: "Sales Performance & Executive Dashboard",
    badge: "Data Analytics",
    category: "Analytics",
    github: "https://github.com/MuhammadMubeen04/Sales-Performance-Executive-Dashboard",
    desc: "End-to-end sales analytics on 5,000 transactions tracking revenue, profit, regional performance, product trends, and sales team effectiveness.",
    highlights: [
      "Designed executive KPIs (Total Sales, Profit, Profit Margin, YoY Growth)",
      "Analyzed regional, product, customer, and sales rep performance",
      "Built a multi-page interactive Power BI dashboard for decision-making",
      "Complete SQL to Python EDA to Power BI pipeline"
    ],
    tools: [
      "SQL",
      "Python",
      "Pandas",
      "Matplotlib",
      "Seaborn",
      "Power BI"
    ],
    slug: "sales-performance-and-executive-dashboard",
    groups: [
      "analytics"
    ]
  },
  {
    title: "E-Commerce Business Analytics",
    badge: "Data Analytics",
    category: "Analytics",
    github: "https://github.com/MuhammadMubeen04/ECommerce-Business-Analytics",
    desc: "E-commerce analytics on 5,500 orders evaluating revenue, profit, product performance, discount impact, return rates, ratings, and regional performance.",
    highlights: [
      "Designed KPIs for revenue, profit margin, return rate, and customer ratings",
      "Analyzed discount impact on profitability and return rates by category",
      "Identified top products, regional performance, and delivery insights",
      "Built a multi-page interactive Power BI dashboard"
    ],
    tools: [
      "SQL",
      "Python",
      "Pandas",
      "Seaborn",
      "Power BI"
    ],
    slug: "e-commerce-business-analytics",
    groups: [
      "analytics"
    ]
  },
  {
    title: "Financial Performance Dashboard",
    badge: "Data Analytics",
    category: "Finance",
    github: "https://github.com/MuhammadMubeen04/Financial-Performance-Dashboard",
    desc: "Financial analytics for revenue, expenses, profit, margins, and budget vs actual (2022-2025) with an executive Power BI reporting pipeline.",
    highlights: [
      "Designed KPIs for revenue, expenses, net profit, and profit margin",
      "Analyzed monthly P&L trends and budget vs actual variances",
      "Broke down expenses by category and department",
      "Built a multi-page interactive Power BI dashboard with recommendations"
    ],
    tools: [
      "SQL",
      "Python",
      "Pandas",
      "Seaborn",
      "Power BI"
    ],
    slug: "financial-performance-dashboard",
    groups: [
      "analytics"
    ]
  },
  {
    title: "Supply Chain & Inventory Analytics",
    badge: "Data Analytics",
    category: "Operations",
    github: "https://github.com/MuhammadMubeen04/Supply-Chain-Inventory-Analytics",
    desc: "Inventory health, stock-outs, warehouse performance, and supplier reliability across 120 SKUs and multi-city warehouses (Riyadh, Jeddah, Dammam).",
    highlights: [
      "Designed KPIs for inventory value, stock-out rate, and on-time delivery",
      "Analyzed stock status by category and warehouse",
      "Evaluated supplier lead time, fill rate, and order performance",
      "Built a multi-page Power BI dashboard with reorder and supplier recommendations"
    ],
    tools: [
      "SQL",
      "Python",
      "Pandas",
      "Seaborn",
      "Power BI"
    ],
    slug: "supply-chain-and-inventory-analytics",
    groups: [
      "analytics"
    ]
  },
  {
    title: "Tourism & Visitor Traffic Analytics",
    badge: "Data Analytics",
    category: "Analytics",
    github: "https://github.com/MuhammadMubeen04/Tourism-Visitor-Traffic-Analytics",
    desc: "Multi-year visitor traffic across major destinations covering seasonality, occupancy, trip purpose, and origin markets for planning decisions.",
    highlights: [
      "Tracked visitor volumes, estimated spend, and occupancy trends",
      "Identified peak months and high-traffic destinations",
      "Analyzed purpose and origin patterns for visitor profiling",
      "Built an interactive Power BI dashboard with operational recommendations"
    ],
    tools: [
      "SQL",
      "Python",
      "Pandas",
      "Seaborn",
      "Power BI"
    ],
    slug: "tourism-and-visitor-traffic-analytics",
    groups: [
      "analytics"
    ]
  },
  {
    title: "Customer Analytics & Segmentation",
    badge: "ML & Analytics",
    category: "Analytics",
    github: "https://github.com/MuhammadMubeen04/Customer-Analytics-Segmentation",
    desc: "RFM analysis and K-Means clustering on 800 customers into actionable groups: High-Value Champions, Loyal Frequent, Potential, and At-Risk.",
    highlights: [
      "Calculated RFM metrics (Recency, Frequency, Monetary)",
      "Applied K-Means clustering for customer segmentation",
      "Identified churn risk and created actionable customer groups",
      "Supported targeting and retention strategy with Power BI visuals"
    ],
    tools: [
      "SQL",
      "Python",
      "Scikit-learn",
      "Pandas",
      "Power BI"
    ],
    slug: "customer-analytics-and-segmentation",
    groups: [
      "analytics",
      "ml"
    ]
  },
  {
    title: "HR Analytics & Employee Attrition Dashboard",
    badge: "Data Analytics",
    category: "HR",
    github: "https://github.com/MuhammadMubeen04/HR-Analytics-Employee-Attrition",
    desc: "Analyzed 1,200 employee records for attrition drivers including overtime, satisfaction, tenure, and department with HR recommendations.",
    highlights: [
      "Calculated overall and department-wise attrition rates",
      "Analyzed key drivers such as OverTime, Job Satisfaction, and Tenure",
      "Built a multi-page Power BI dashboard with KPIs and driver analysis",
      "Delivered data-driven insights to support retention strategies"
    ],
    tools: [
      "SQL",
      "Python",
      "Pandas",
      "Seaborn",
      "Power BI"
    ],
    slug: "hr-analytics-and-employee-attrition-dashboard",
    groups: [
      "analytics"
    ]
  },
  {
    title: "Retail SQL Business Case Study",
    badge: "SQL Analytics",
    category: "SQL",
    github: "https://github.com/MuhammadMubeen04/Retail-SQL-Business-Case-Study",
    desc: "SQL-focused retail case study on a multi-store database. Solved 35 business questions using JOINs, CTEs, window functions, and advanced SQL.",
    highlights: [
      "Designed and queried a full retail schema with 7 related tables",
      "Answered 35 business questions from basics to advanced SQL",
      "Analyzed revenue, customers, stores, discounts, and return rates",
      "Added light Python KPI charts for portfolio presentation"
    ],
    tools: [
      "MySQL",
      "SQL",
      "Python",
      "Pandas",
      "Matplotlib"
    ],
    slug: "retail-sql-business-case-study",
    groups: [
      "analytics"
    ]
  },
  {
    title: "Gaming Sales & Player Behavior Analytics",
    badge: "Data Analytics",
    category: "Analytics",
    github: "https://github.com/MuhammadMubeen04/Gaming-Sales-Player-Behavior-Analytics",
    desc: "Analyzed 1,200 games (2012-2025) for sales trends, score patterns, platforms, genres, and top-performing titles and publishers.",
    highlights: [
      "Analyzed global sales by platform and genre",
      "Compared critic vs user scores and average playtime",
      "Identified top games and publishers by sales performance",
      "Built a modular analysis pipeline with visualizations and insights"
    ],
    tools: [
      "Python",
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Seaborn"
    ],
    slug: "gaming-sales-and-player-behavior-analytics",
    groups: [
      "analytics"
    ]
  },
  {
    title: "Gym Membership & Fitness Analytics",
    badge: "Data Analytics",
    category: "Analytics",
    github: "https://github.com/MuhammadMubeen04/Gym-Membership-Fitness-Analytics",
    desc: "Membership analytics on 800 members and 12,800+ check-ins covering attendance, class popularity, peak hours, and retention.",
    highlights: [
      "Analyzed membership plans, active rates, and member status",
      "Identified popular classes and peak gym hours",
      "Examined demographics and visit frequency by plan",
      "Delivered actionable insights on engagement and retention"
    ],
    tools: [
      "Python",
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Seaborn"
    ],
    slug: "gym-membership-and-fitness-analytics",
    groups: [
      "analytics"
    ]
  },
  {
    title: "Multi-Model LLM & RAG Assistant Application",
    badge: "AI & Web",
    category: "AI/ML",
    github: null,
    desc: "Interactive AI web app integrating multi-LLM APIs for real-time document analysis and NLP tasks with a Streamlit interface.",
    highlights: [
      "Integrated multiple LLM backends for flexible inference",
      "Supported document analysis and NLP workflows",
      "Built a clean interactive Streamlit user interface",
      "Focused on practical AI application patterns"
    ],
    tools: [
      "Python",
      "Streamlit",
      "LLM APIs",
      "Ollama",
      "Git"
    ],
    slug: "multi-model-llm-and-rag-assistant-application",
    groups: [
      "ml"
    ]
  },
  {
    title: "AI-Driven Predictive Sales & Customer Analytics",
    badge: "Machine Learning",
    category: "AI/ML",
    github: null,
    desc: "Machine learning workflow using Scikit-learn to forecast customer behavior and sales trends with preprocessing and evaluation.",
    highlights: [
      "Built predictive models for sales and customer behavior",
      "Performed feature preprocessing and model evaluation",
      "Generated insights to support forecasting decisions",
      "Documented end-to-end ML workflow"
    ],
    tools: [
      "Python",
      "Scikit-learn",
      "Pandas",
      "Matplotlib"
    ],
    slug: "ai-driven-predictive-sales-and-customer-analytics",
    groups: [
      "ml"
    ]
  },
  {
    title: "Enterprise Network & Security Infrastructure",
    badge: "Networking",
    category: "Security",
    github: null,
    desc: "Simulated multi-site corporate network with routing, Active Directory, DHCP, GPO, Static NAT, and role-based access control.",
    highlights: [
      "Designed multi-site enterprise network topology",
      "Configured Active Directory, DHCP, and Group Policy",
      "Implemented Static NAT and access controls",
      "Validated connectivity and security policies in lab environment"
    ],
    tools: [
      "Packet Tracer",
      "Windows Server",
      "AD DS",
      "GPO"
    ],
    slug: "enterprise-network-and-security-infrastructure",
    groups: [
      "web"
    ]
  },
  {
    title: "Secure Relational Banking & Transaction System",
    badge: "Full-Stack",
    category: "Web",
    github: null,
    desc: "Database-backed banking application with secure authentication, real-time transactions, and automated ledger reporting.",
    highlights: [
      "Implemented secure authentication and session handling",
      "Supported real-time transaction workflows",
      "Built relational schema for accounts and ledgers",
      "Generated automated reporting outputs"
    ],
    tools: [
      "PHP",
      "MySQL",
      "JavaScript",
      "Tailwind"
    ],
    slug: "secure-relational-banking-and-transaction-system",
    groups: [
      "web"
    ]
  },
  {
    title: "NextGen Gaming Content Showcase Platform",
    badge: "Web Dev",
    category: "Web",
    github: null,
    desc: "Responsive dynamic web platform with database-driven content management, catalog filtering, and modern UI/UX design.",
    highlights: [
      "Built responsive catalog and content pages",
      "Implemented database-driven content management",
      "Added filtering and showcase interactions",
      "Focused on clean modern UI/UX"
    ],
    tools: [
      "PHP",
      "MySQL",
      "JavaScript",
      "Bootstrap"
    ],
    slug: "nextgen-gaming-content-showcase-platform",
    groups: [
      "web"
    ]
  },
  {
    title: "Interactive Web-Based Assessment & Quiz System",
    badge: "Web Dev",
    category: "Web",
    github: null,
    desc: "Online assessment portal with dynamic question generation, real-time scoring, and automated user result tracking.",
    highlights: [
      "Dynamic question generation and quiz flow",
      "Real-time response scoring",
      "Automated user result tracking",
      "Database-backed assessment storage"
    ],
    tools: [
      "PHP",
      "JavaScript",
      "MySQL",
      "HTML/CSS"
    ],
    slug: "interactive-web-based-assessment-and-quiz-system",
    groups: [
      "web"
    ]
  }
];
