# Technical Blog Post Guide: Collective Unconscious

This guide provides a structured 1500-word outline to help you draft your project's technical blog post. 

## 📝 Suggested Titles
- *The Minimalist Stack: Building an Async Collaborative Writing Engine*
- *From Anonymous Sparks to Moderated Works: The Evolution of Collective Unconscious*
- *Chaining Thoughts: Engineering an Async Turn-Based Platform with AI Orchestration*

---

## 🏗️ 1. Introduction: The Vision (150 Words)
- **The Hook**: Why "low-pressure" collaboration is the antidote to modern social media chaos.
- **The Concept**: Explain "Collective Unconscious" — a platform where a piece of writing grows one turn at a time, governed by color rather than ego.
- **The Deliverable**: Briefly mention the tech stack (React, Node, Prisma, PostgreSQL).

## 🧩 2. Engineering the Writing Loop (300 Words)
- **Technical Challenge**: Describe the "Turn-Queue" logic. It sounds simple but becomes complex with concurrent joins.
- **Deep Dive: Set-based OOR (Out-of-Rotation) Skip**:
    - Explain how you handled users joining mid-rotation (`isOutOfRotation` flag).
    - Reference the logic in `server/src/controllers/turns.js` that prevents consecutive turns from the same user.
- **The "Vibe" UI**: Why you chose a "Plain Style" (white background, system fonts). Discuss the decision to use **Text Color** as the only identity marker.

## 🔑 3. The Authentication Journey (300 Words)
- **Phase 1: Zero-Friction (Sprint 1)**: Using anonymous session tokens to let users write instantly without an account.
- **Phase 2: Persistent Identity (Sprint 2)**: Transitioning to JWT + Google OAuth via Passport.js.
- **Technical Insight**: Discussing bridge logic — how anonymous content was linked to formal accounts once a user signed in for the first time.

## 🚢 4. The "Proxy Pivot": A Deployment Case Study (300 Words)
- **The Problem**: One of the biggest technical hurdles. Browsers (especially Mobile Safari) blocking cross-origin cookies on Render subdomains (`.onrender.com` vs `-1.onrender.com`).
- **The Solution**: Implementing a reverse proxy strategy where the frontend serves the API under the same domain (`/api/*`).
- **Key Code**: Reference the `VITE_API_URL` logic in `client/src/config.js` and the `trust proxy` setting in `server/src/index.js`.

## 🤖 5. AI Mastery: Orchestrating Multiple Modalities (250 Words)
- **The Strategy**: How you used different AI tools for different phases:
    - **Claude (Web)**: High-level architectural planning and PRD drafting.
    - **Antigravity (IDE)**: Deep code implementation, TDD (88% coverage!), and CI/CD debugging.
- **The Result**: Discuss how this "Hybrid" approach allowed for professional-grade engineering (linting, testing, Swagger docs) at a rapid pace.

## 📊 6. Quality & Future Work (200 Words)
- **The "Evaluation Dashboard"**: Mention the 88%+ combined test coverage and security auditing.
- **Retrospectives**: Share a key lesson learned (e.g., the complexity of CORS in a distributed environment).
- **Future Roadmap**: Real-time notifications via WebSockets or themed log exports.

---

## 🛠️ Technical Keywords for SEO/Rubric
`Passport.js`, `JWT`, `Prisma ORM`, `PostgreSQL`, `Swagger/OpenAPI`, `Vitest/Jest`, `GitHub Actions CI/CD`, `Reverse Proxy`, `SameSite Cookies`.

## 📜 Files to Reference for Screenshots in Post:
- `server/src/index.js`: (The core API logic)
- `prisma/schema.prisma`: (The robust data model)
- `client/src/pages/LogDetailPage.jsx`: (The collaborative UI)
