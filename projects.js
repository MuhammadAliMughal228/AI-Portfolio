/* =========================================================================
   PROJECTS — edit this file to add, remove or reorder projects.
   - cat:    one or more of  agents | llm | commerce | data | ml
   - shot:   optional screenshot path (e.g. "assets/shots/agentwiz.webp").
             If the file is missing the card falls back to generated art.
   - visual: each card's product mockup is drawn in mockups.js, keyed by the project id.
             A new project needs a matching entry there (or it shows only the backdrop).
   - accent: card accent colour
   ========================================================================= */
window.PROJECTS = [
  {
    id: "agentwiz",
    title: "AgentWiz",
    tagline: "A multi-agent operating system for business",
    cat: ["agents"],
    featured: true,
    accent: "#7cf4c8",
    shot: "assets/shots/agentwiz.webp",
    links: [{ label: "Live app", url: "https://agentwiz.thefabulousshow.com/" }],
    summary:
      "Specialised AI agents for lead generation, sales, HR and finance, plus an AI chat for each one, all managed from one admin console.",
    problem:
      "Teams were switching between separate tools for prospecting, hiring, finance and support, and none of them shared context.",
    built: [
      "A multi-agent setup: an orchestrator sends each request to the right specialist agent (Lead-Gen, Sales, HR, Finance or Chat).",
      "Lead-generation agents that find, enrich and qualify prospects, then pass them to the sales pipeline.",
      "HR and finance agents that handle screening, reporting and routine back-office questions.",
      "A conversational AI chat that remembers context across modules.",
      "An admin screen for users, roles, agent settings and activity.",
    ],
    impact: ["5+ cooperating agents", "One console for sales, HR and finance", "Shared memory across modules"],
    stack: ["Multi-agent", "LLMs", "Python", "Node.js", "Vector DB", "REST APIs"],
  },
  {
    id: "modellab",
    title: "Ballogy Model Lab",
    tagline: "Benchmarks production AI against 80+ LLMs",
    cat: ["llm", "data"],
    featured: true,
    accent: "#8b9bff",
    shot: "assets/shots/modellab.webp",
    links: [{ label: "Live app", url: "https://modellab.ballogy.com/" }],
    summary:
      "An evaluation platform that runs Ballogy's production AI and 80+ other LLMs on the same agent prompts and live data. Multiple LLM judges then score the answers.",
    problem:
      "Choosing a model or changing a prompt was guesswork, and there was no repeatable, unbiased way to compare models on real product traffic.",
    built: [
      "Runs the same agent prompt and live data through 80+ models via OpenRouter.",
      "Answers are anonymised and shuffled, then scored by several LLM judges plus automated checks and human feedback.",
      "Win/tie/loss reports that guide model and prompt decisions.",
      "Role-based access, audit logging, caching and request de-duplication.",
      "Dockerised CI/CD with Bitbucket Pipelines.",
    ],
    impact: ["80+ LLMs compared", "Blind multi-judge scoring", "Model choices backed by data"],
    stack: ["Node.js", "Python", "PostgreSQL", "OpenRouter", "Pinecone", "Docker", "Bitbucket Pipelines"],
  },
  {
    id: "camphq",
    title: "Ballogy Camp HQ: Player Recommendation Agent",
    tagline: "Personalised training plans from each player's stats",
    cat: ["agents", "ml"],
    featured: true,
    accent: "#ffb86b",
    shot: "assets/shots/camphq.webp",
    links: [
      { label: "Camp HQ", url: "https://www.ballogy.com/camp-hq" },
      { label: "Ballogy.com", url: "https://www.ballogy.com/" },
    ],
    summary:
      "An AI agent that reads a player's performance data and recommends drills, focus areas and next steps. It sits next to an AI coach assistant for staff.",
    problem:
      "Coaches running camps couldn't look closely at every athlete, so most players got generic training advice.",
    built: [
      "A player-data layer that pulls each athlete's stats and trends from a single, unified data model.",
      "A recommendation agent that turns those stats into specific drill and training suggestions.",
      "An AI coach assistant that answers team-level questions over chosen time windows, such as the last 30 days.",
      "Retrieval through Pinecone, kept up to date by a custom PostgreSQL sync worker.",
    ],
    impact: ["Advice tailored to each player", "Coach Q&A over live team data", "Recommendations grounded in real stats"],
    stack: ["Agentic AI", "Python", "Pinecone", "PostgreSQL", "LLMs", "Recommendation systems"],
  },
  {
    id: "trichter",
    title: "Magisch Maastricht: AI Ticket Shop",
    tagline: "AI bundles, suggestions and dynamic pricing for a Christmas market",
    cat: ["commerce"],
    featured: true,
    accent: "#ff7a9c",
    shot: "assets/shots/trichter.webp",
    links: [
      { label: "Webshop", url: "https://shop.trichter.nl/nl" },
      { label: "Event site", url: "https://www.magischmaastrichtvrijthof.nl/home-en" },
    ],
    summary:
      "AI features for the webshop of Magisch Maastricht Vrijthof, a month-long winter event with an ice rink, Ferris wheel, carousel, street curling and food and drink packages.",
    problem:
      "With dozens of tickets, packages and food add-ons, visitors struggled to choose, and fixed prices left revenue unused at peak times.",
    built: [
      "AI bundle generation that combines attractions with food and drinks into packages visitors want.",
      "AI suggestions based on the cart, such as gloves with a skate rental or a drinks package with the Ferris wheel.",
      "Dynamic pricing that responds to demand, the day of the week and the time of the season.",
      "A custom bundle builder so visitors can put together their own package.",
    ],
    impact: ["Bigger average orders", "Prices adjust to demand", "Faster checkout decisions"],
    stack: ["Recommendation AI", "Dynamic pricing", "Python", "E-commerce", "LLMs"],
  },
  {
    id: "insight",
    title: "Ballogy Insight Hub",
    tagline: "Executive analytics dashboard",
    cat: ["data"],
    accent: "#5ad1ff",
    shot: "assets/shots/insight.webp",
    links: [{ label: "Live dashboard", url: "https://ballogy-insight-hub.lovable.app/executive" }],
    summary:
      "The executive dashboard for Ballogy. I lead its backend: Python and SQL pipelines that calculate KPIs from production data and serve them through REST APIs to a React frontend.",
    problem: "Leadership needed one reliable view of growth and engagement across several data sources.",
    built: [
      "SQL queries and Python scripts that fetch and calculate metrics from production databases.",
      "REST endpoints that a React frontend reads from.",
      "A data dictionary and standard schemas so every metric has one definition.",
    ],
    impact: ["One source of truth", "KPIs ready for executives", "Metric definitions in one place"],
    stack: ["Python", "SQL", "PostgreSQL", "REST APIs", "React"],
  },
  {
    id: "pinecone",
    title: "PostgreSQL → Pinecone Sync",
    tagline: "Keeps vector search current with no CDC vendor",
    cat: ["llm", "data"],
    accent: "#b18cff",
    links: [],
    summary:
      "A Python worker that takes snapshots of PostgreSQL and syncs the changes into Pinecone with de-duplication. It replaces paid tools such as Estuary.",
    problem: "RAG answers depend on fresh vectors, but third-party CDC tools added cost and another moving part.",
    built: [
      "Snapshot-based change detection with no logical replication or external CDC tool.",
      "Idempotent upserts and de-duplication inside Pinecone.",
      "Runs as a containerised worker.",
    ],
    impact: ["No third-party tool costs", "Fresh retrieval for the AI coach", "No duplicate vectors"],
    stack: ["Python", "PostgreSQL", "Pinecone", "Docker"],
  },
  {
    id: "yinn",
    title: "Yinn.ca: AI Carbon Calculator",
    tagline: "XGBoost carbon emission estimates",
    cat: ["ml"],
    accent: "#6be58a",
    shot: "assets/shots/yinn.webp",
    links: [{ label: "Yinn.ca", url: "https://yinn.ca/" }],
    summary: "An AI carbon emission calculator built with XGBoost and integrated into the Yinn.ca platform.",
    problem: "Users wanted a quick, credible estimate of their emissions without filling in long forms.",
    built: [
      "An XGBoost regression model trained on emission factors.",
      "An API integration into the Yinn.ca product.",
      "Deployed on DigitalOcean, with Git-based releases.",
    ],
    impact: ["Instant estimates", "Runs in production on Yinn.ca"],
    stack: ["XGBoost", "Python", "FastAPI", "DigitalOcean"],
  },
  {
    id: "finhealer",
    title: "FinHealer",
    tagline: "AI for financial health and forecasting",
    cat: ["ml"],
    accent: "#ffd166",
    shot: "assets/shots/finhealer.webp",
    links: [{ label: "finhealer.com", url: "https://finhealer.com/" }],
    summary:
      "Financial intelligence work: an ensemble time-series forecaster for transaction prediction, plus a natural-language agent for querying financial data.",
    problem: "Teams needed accurate cash-flow forecasts and a way to ask questions about their numbers without writing SQL.",
    built: [
      "An ensemble of LSTM, Prophet, XGBoost and LightGBM models.",
      "A LangChain agent for plain-language questions over tabular financial data.",
      "API endpoints for real-time predictions.",
    ],
    impact: ["96.7% forecast accuracy", "60% faster analysis"],
    stack: ["LSTM", "Prophet", "XGBoost", "LightGBM", "LangChain", "FastAPI"],
  },
  {
    id: "travel",
    title: "Travel Cost Prediction",
    tagline: "Real-time trip pricing for 500+ users a month",
    cat: ["ml"],
    accent: "#4fd1c5",
    links: [],
    summary:
      "Vehicle travel cost prediction using a Random Forest model (R² 0.86–0.87), with Google Places for live distances and FastAPI with PostgreSQL behind it.",
    problem: "Quoting trip prices by hand was slow and inconsistent.",
    built: [
      "EDA, feature engineering and model training.",
      "Google Places API integration for real-time distances.",
      "FastAPI endpoints embedded in the client's website, plus a React/Django booking app on Railway.",
    ],
    impact: ["R² ≈ 0.87", "500+ monthly users"],
    stack: ["Random Forest", "FastAPI", "Django", "React", "PostgreSQL", "Railway"],
  },
  {
    id: "rag",
    title: "Llama 3.2 RAG & Translation",
    tagline: "Retrieval-augmented generation and multilingual output",
    cat: ["llm"],
    accent: "#f78fb3",
    links: [],
    summary:
      "A RAG system built on Llama 3.2 that made retrieval and generation 40% more efficient, plus a low-latency multi-language translation model.",
    problem: "Answers needed to be grounded in internal documents and available in several languages.",
    built: ["Chunking, embedding and retrieval pipeline", "Llama 3.2 generation grounded in retrieved context", "Multi-language translation with low latency"],
    impact: ["40% more efficient", "Multilingual"],
    stack: ["Llama 3.2", "RAG", "Hugging Face", "Python"],
  },
];
