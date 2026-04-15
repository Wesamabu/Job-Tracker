"""
Generates 3 fake demo PDF resumes for the seed user.
Uses PyMuPDF (already installed) — no extra dependencies needed.

Run from the backend/ directory:
    python generate_demo_resumes.py
"""

import os
import fitz  # PyMuPDF

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "app", "uploads")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def make_pdf(filename: str, lines: list[tuple[str, int, bool]]):
    """
    lines = list of (text, fontsize, is_bold)
    """
    doc = fitz.open()
    page = doc.new_page(width=612, height=792)  # US Letter
    y = 60

    for text, size, bold in lines:
        font = "helv" if not bold else "hebo"
        page.insert_text((50, y), text, fontsize=size, fontname=font, color=(0, 0, 0))
        y += size + 6
        if y > 740:
            page = doc.new_page(width=612, height=792)
            y = 60

    path = os.path.join(OUTPUT_DIR, filename)
    doc.save(path)
    doc.close()
    print(f"Created: {path}")


# ─────────────────────────────────────────────────────────────────────────────
# RESUME 1 — Software Engineer Resume
# ─────────────────────────────────────────────────────────────────────────────
make_pdf("demo_swe_resume.pdf", [
    ("Alex Johnson", 18, True),
    ("alex.johnson@gmail.com  |  linkedin.com/in/alexjohnson  |  github.com/alexjohnson", 9, False),
    ("Washington, DC  |  (202) 555-0182", 9, False),
    ("", 6, False),
    ("EDUCATION", 12, True),
    ("─────────────────────────────────────────────────────────────────────", 8, False),
    ("George Washington University — M.S. Computer Science  |  GPA: 3.8  |  May 2026", 10, False),
    ("Relevant Coursework: Algorithms, Distributed Systems, Machine Learning, Cloud Computing", 9, False),
    ("University of Maryland — B.S. Computer Science  |  GPA: 3.6  |  May 2024", 10, False),
    ("", 6, False),
    ("TECHNICAL SKILLS", 12, True),
    ("─────────────────────────────────────────────────────────────────────", 8, False),
    ("Languages:   Python, Java, C++, JavaScript, TypeScript, SQL", 9, False),
    ("Frameworks:  FastAPI, Spring Boot, React, Node.js, Express", 9, False),
    ("Cloud:       AWS (EC2, S3, Lambda), Google Cloud Platform, Docker, Kubernetes", 9, False),
    ("Databases:   PostgreSQL, MySQL, MongoDB, Redis", 9, False),
    ("Tools:       Git, CI/CD, Linux, REST APIs, Microservices, Agile/Scrum", 9, False),
    ("", 6, False),
    ("EXPERIENCE", 12, True),
    ("─────────────────────────────────────────────────────────────────────", 8, False),
    ("Software Engineering Intern — Google  |  Mountain View, CA  |  Jun–Aug 2025", 10, True),
    ("- Built a distributed data pipeline using Apache Kafka and Python, reducing latency by 35%", 9, False),
    ("- Developed REST APIs in Java/Spring Boot serving 2M+ daily requests", 9, False),
    ("- Wrote unit and integration tests achieving 92% code coverage", 9, False),
    ("- Collaborated with a cross-functional team using Agile/Scrum methodology", 9, False),
    ("", 4, False),
    ("Backend Developer Intern — Booz Allen Hamilton  |  McLean, VA  |  Jun–Aug 2024", 10, True),
    ("- Designed and implemented RESTful APIs using Python and FastAPI for a federal client", 9, False),
    ("- Optimized PostgreSQL queries, improving dashboard load time by 40%", 9, False),
    ("- Containerized services using Docker and deployed on AWS ECS", 9, False),
    ("- Automated deployment pipeline using GitHub Actions CI/CD", 9, False),
    ("", 6, False),
    ("PROJECTS", 12, True),
    ("─────────────────────────────────────────────────────────────────────", 8, False),
    ("Job Tracker Application  |  Python, FastAPI, SQLAlchemy, React, TypeScript", 10, True),
    ("- Full-stack app to track job applications with AI-powered career insights using Groq LLM", 9, False),
    ("- Integrated Vertex AI embeddings for resume-to-job-description alignment scoring", 9, False),
    ("- Deployed on Google Cloud with JWT authentication and SQLite/PostgreSQL backend", 9, False),
    ("", 4, False),
    ("Distributed Key-Value Store  |  C++, Raft Consensus Algorithm", 10, True),
    ("- Implemented a fault-tolerant distributed key-value store using Raft for leader election", 9, False),
    ("- Achieved 99.9% availability under network partition scenarios in simulation tests", 9, False),
    ("", 6, False),
    ("CERTIFICATIONS", 12, True),
    ("─────────────────────────────────────────────────────────────────────", 8, False),
    ("AWS Certified Developer – Associate  |  2025", 9, False),
    ("Google Cloud Associate Cloud Engineer  |  2024", 9, False),
])

# ─────────────────────────────────────────────────────────────────────────────
# RESUME 2 — Full Stack Developer Resume
# ─────────────────────────────────────────────────────────────────────────────
make_pdf("demo_fullstack_resume.pdf", [
    ("Alex Johnson", 18, True),
    ("alex.johnson@gmail.com  |  portfolio: alexj.dev  |  github.com/alexjohnson", 9, False),
    ("Washington, DC  |  (202) 555-0182", 9, False),
    ("", 6, False),
    ("SUMMARY", 12, True),
    ("─────────────────────────────────────────────────────────────────────", 8, False),
    ("Full-stack developer with 2+ years of experience building scalable web applications.", 9, False),
    ("Skilled in React, TypeScript, Node.js, and Python. Passionate about clean code,", 9, False),
    ("performance optimization, and delivering exceptional user experiences.", 9, False),
    ("", 6, False),
    ("EDUCATION", 12, True),
    ("─────────────────────────────────────────────────────────────────────", 8, False),
    ("George Washington University — M.S. Computer Science  |  GPA: 3.8  |  May 2026", 10, False),
    ("Focus: Software Engineering, Web Technologies, Human-Computer Interaction", 9, False),
    ("University of Maryland — B.S. Computer Science  |  GPA: 3.6  |  May 2024", 10, False),
    ("", 6, False),
    ("TECHNICAL SKILLS", 12, True),
    ("─────────────────────────────────────────────────────────────────────", 8, False),
    ("Frontend:    React, TypeScript, JavaScript, HTML5, CSS3, Chakra UI, Tailwind CSS", 9, False),
    ("Backend:     Node.js, Express, Python, FastAPI, REST APIs, GraphQL", 9, False),
    ("Databases:   PostgreSQL, MongoDB, Firebase, Redis, SQLAlchemy", 9, False),
    ("DevOps:      Docker, AWS, Vercel, Netlify, GitHub Actions, CI/CD pipelines", 9, False),
    ("Testing:     Jest, React Testing Library, Pytest, Cypress", 9, False),
    ("", 6, False),
    ("EXPERIENCE", 12, True),
    ("─────────────────────────────────────────────────────────────────────", 8, False),
    ("Full Stack Developer Intern — Stripe  |  Remote  |  Jun–Aug 2025", 10, True),
    ("- Built React components for Stripe's merchant dashboard used by 50,000+ businesses", 9, False),
    ("- Developed Node.js microservices for payment processing and webhook handling", 9, False),
    ("- Integrated Stripe Elements and payment APIs into 3 new checkout flows", 9, False),
    ("- Improved dashboard load performance by 28% through code splitting and lazy loading", 9, False),
    ("", 4, False),
    ("Frontend Developer Intern — Capital One  |  McLean, VA  |  Jun–Aug 2024", 10, True),
    ("- Developed responsive UI components in React and TypeScript for mobile banking app", 9, False),
    ("- Built GraphQL queries and mutations for real-time account data updates", 9, False),
    ("- Wrote Cypress end-to-end tests, increasing test coverage from 45% to 78%", 9, False),
    ("", 6, False),
    ("PROJECTS", 12, True),
    ("─────────────────────────────────────────────────────────────────────", 8, False),
    ("E-Commerce Platform  |  React, TypeScript, Node.js, MongoDB, Stripe API", 10, True),
    ("- Built full-stack marketplace with product listings, cart, checkout, and order tracking", 9, False),
    ("- Integrated Stripe payment infrastructure and handled webhooks for order fulfillment", 9, False),
    ("- Deployed on AWS with auto-scaling and achieved 99.8% uptime over 6 months", 9, False),
    ("", 4, False),
    ("Real-Time Chat Application  |  React, Socket.io, Node.js, MongoDB", 10, True),
    ("- Developed real-time messaging app supporting 500+ concurrent users", 9, False),
    ("- Implemented JWT authentication, message history, and typing indicators", 9, False),
])

# ─────────────────────────────────────────────────────────────────────────────
# RESUME 3 — General / Data Engineering Resume
# ─────────────────────────────────────────────────────────────────────────────
make_pdf("demo_general_resume.pdf", [
    ("Alex Johnson", 18, True),
    ("alex.johnson@gmail.com  |  linkedin.com/in/alexjohnson  |  Washington, DC", 9, False),
    ("", 6, False),
    ("EDUCATION", 12, True),
    ("─────────────────────────────────────────────────────────────────────", 8, False),
    ("George Washington University  |  M.S. Computer Science  |  GPA: 3.8  |  May 2026", 10, False),
    ("University of Maryland  |  B.S. Computer Science  |  GPA: 3.6  |  May 2024", 10, False),
    ("", 6, False),
    ("TECHNICAL SKILLS", 12, True),
    ("─────────────────────────────────────────────────────────────────────", 8, False),
    ("Programming:  Python, Java, JavaScript, SQL, Bash, R", 9, False),
    ("Data:         Pandas, NumPy, Scikit-learn, TensorFlow, Apache Spark, Hadoop", 9, False),
    ("Cloud:        AWS (S3, EC2, RDS, Lambda), Google Cloud Platform, Azure basics", 9, False),
    ("Databases:    PostgreSQL, MySQL, MongoDB, BigQuery, Snowflake", 9, False),
    ("Tools:        Git, Docker, Jupyter, Tableau, Power BI, Linux", 9, False),
    ("", 6, False),
    ("EXPERIENCE", 12, True),
    ("─────────────────────────────────────────────────────────────────────", 8, False),
    ("Data Engineering Intern — Deloitte  |  Washington, DC  |  Jun–Aug 2025", 10, True),
    ("- Built ETL pipelines using Python and Apache Spark processing 10GB+ daily data", 9, False),
    ("- Designed data warehouse schemas in Snowflake for federal analytics platform", 9, False),
    ("- Created Tableau dashboards for executive reporting, reducing manual reporting by 60%", 9, False),
    ("- Automated data quality checks using Python scripts integrated into CI/CD pipeline", 9, False),
    ("", 4, False),
    ("Software Developer Intern — Lockheed Martin  |  Bethesda, MD  |  Jun–Aug 2024", 10, True),
    ("- Developed Python scripts to automate test reporting, saving 10 hours/week", 9, False),
    ("- Built REST APIs in Java for internal logistics tracking application", 9, False),
    ("- Maintained MySQL databases and wrote complex queries for reporting dashboards", 9, False),
    ("", 6, False),
    ("PROJECTS", 12, True),
    ("─────────────────────────────────────────────────────────────────────", 8, False),
    ("ML Job Recommendation Engine  |  Python, Scikit-learn, FastAPI, PostgreSQL", 10, True),
    ("- Built a job recommendation system using NLP and cosine similarity matching", 9, False),
    ("- Trained classification model on 50,000 job postings achieving 87% accuracy", 9, False),
    ("- Deployed as REST API serving real-time recommendations to 200+ beta users", 9, False),
    ("", 4, False),
    ("COVID-19 Data Dashboard  |  Python, Pandas, Plotly, AWS", 10, True),
    ("- Aggregated and visualized public health data from 50 US states using Pandas", 9, False),
    ("- Built interactive Plotly dashboard deployed on AWS EC2 with 1,000+ monthly users", 9, False),
    ("", 6, False),
    ("LEADERSHIP & ACTIVITIES", 12, True),
    ("─────────────────────────────────────────────────────────────────────", 8, False),
    ("GWU Association for Computing Machinery (ACM) — Vice President  |  2025–2026", 9, False),
    ("GWU Hackathon — 1st Place, Best Use of AI  |  Spring 2025", 9, False),
    ("Teaching Assistant — Intro to Computer Science, GWU  |  Fall 2024", 9, False),
])

print("\nAll 3 demo resumes generated successfully.")
print("Run: python seed.py  to populate the database.")
