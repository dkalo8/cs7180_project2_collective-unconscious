# The Minimalist Stack: Engineering "Collective Unconscious" for Async Collaboration

## Introduction: The Vision of Low-Pressure Creativity
In the modern digital landscape, online collaboration is usually synonymous with high-frequency noise. **Collective Unconscious** was born to reverse this trend. The goal: something like a "digital sandbox" where creative sparks grow into a unified narrative one turn at a time. The core philosophy is that internet products should, above all else, be *fun*. In a market saturated with utility apps, we built something for the soul, capturing the early 2000s "goofing off at work" vibe—clicking in without the burden of algorithms or ego.

## The Aesthetic Pivot: Embracing the "Retro" Unconscious
One of our most significant design decisions was the move toward a "Pure HTML" aesthetic. In an age where AI-generated designs lean toward the hyper-modern and polished, we felt that simpler, unadorned web pages had become rare and interesting. We drew inspiration from sites like *Drawafish*, *Spacehey*, and *Alice in Avocadoland*. 

We deliberately chose a style that looks intentionally "low-tech": a white background, black system-serif fonts, and a high-contrast color palette. We realized that today’s commercial, visually pleasing styles are everywhere. Fashion is cyclical, and by stripping away the "polish," we allow the content (the collective writing) to take center stage. This minimalist "vibe" isn't just a skin --it's a technical commitment to performance and accessibility, ensuring the platform feels as effortless as a physical notepad.

## The Foundation: A Technical Overview
Building a platform that prioritizes "zero-friction" required a robust but lightweight architecture:
- **Frontend**: React 18 powered by Vite and styled with **Tailwind CSS**. We used Tailwind to implement our "retro" design system efficiently, using utility classes to enforce strict spacing and typography without the overhead of heavy component libraries.
- **Backend**: Node.js and Express, providing a RESTful API.
- **Database**: PostgreSQL managed via Prisma ORM for type-safe data handling.
- **Documentation**: Fully automated Swagger/OpenAPI documentation.

While the "vibe" of the website is "early web", the engineering is strictly 2026, especially with the extense use of AI as an agentic assistant. The stack was chosen for its reliability and the speed at which we could move from prototype to production. However, the simplicity of the concept hid significant technical challenges in collaborative state management.

## Engineering the Writing Loop: The "Set-based OOR" Challenge
The heart of Collective Unconscious is the **Log**, a chain of **Turns**. Implementing a turn-based system asynchronously with a mix of persistent participants and "guest" markers is where the engineering complexity resides.

### The "Is Out of Rotation" (OOR) Flag
We wanted to allow new users to join a log and contribute a turn immediately, even if they weren't next in the pre-defined rotation. This led to the creation of the `isOutOfRotation` flag. 

In a standard "Structured" log, the rotation pointer (the `expectedJoinOrder`) advances sequentially. If Writer A just wrote, the pointer moves to Writer B. But if Writer C joins now, forcing them to wait would break the "frictionless" promise. We developed a logic where a user can submit an "entrance" turn. This turn contributes content and adds the user to the participant pool but **does not advance the rotation pointer**. 

### Set-based Pointer Management
A hurdle surfaced during testing: if multiple users joined "out of rotation" in a single round, the pointer would eventually land on someone who had already contributed content, potentially allowing them to write two turns in a row. 

The solution was a **Set-based OOR Skip**. In our `computeNextExpectedJoinOrder` utility, we now collect all writers who contributed any turn (traditional or OOR) since the last "in-rotation" turn into an `alreadyWroteIds` set. The system then cycles the pointer forward until it finds someone who *is not* in that set. This ensures the creative flow remains distributed and fair, an invisible piece of engineering that keeps the "unconscious" collective and balanced.

## The "Proxy Pivot": A Deployment Case Study
The greatest technical hurdle during our transition to production was **Cross-Origin Cookie Blocking**. We initially deployed the backend and frontend as two separate services on Render (e.g., `app.onrender.com` vs `api.onrender.com`). Browsers—specifically Mobile Safari—viewed our session cookies as "third-party" and blocked them by default. 

This broke sign-in persistence and anonymous session tracking, effectively killing the mobile "fragmented phone time" use case. A user couldn't stay logged in while switching between apps, which made the product non-viable.

### Moving to a Proxy Strategy
Instead of fighting browser security defaults, we pivoted to an architectural solution. We implemented a reverse proxy strategy where the frontend serves the API under its own path (`/api/*`). 

On the server side, we adjusted our authentication middleware to trust the proxy:
```javascript
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}
```
This allowed the browser to view the API calls as "first-party." The result was a much better authentication flow that worked across all devices, ensuring that your collective "spark" (creativity) was never lost due to a session timeout.

## Evolution of Auth: From Anonymous to Identity
We started with a "Zero-Friction" goal: let users write without an account. We achieved this using anonymous session tokens stored in the database. During Sprint 2, we introduced **Google OAuth via Passport.js**.

The technical triumph here was the **Retroactive Merger**. When an anonymous user finally decides to sign in with Google, they shouldn't lose their history. We implemented a "Bridge" logic in the `googleCallback`: the system looks for an existing `sessionToken` cookie and retroactively updates any `Writer` records in the database to link them to the new, permanent `User.id`. This turns anonymous contributions into a formal "Participation History" on their profile, rewarding the user for moving from a "guest" to a "permanent resident."

## AI Orchestration: A Multi-Modal Mastery
Crucial to our success was the use of three distinct AI modalities, each chosen for a specific phase of the development lifecycle. This "Agentic Orchestration" allowed us to maintain professional standards (TDD, high coverage, documentation) at a pace that usually requires a much larger team.

### Modality 1: Claude 4.6 Sonnet (Web)
We utilized the Claude Web interface during the **Product Definition and Sprint Planning** phases. Claude was our Primary Product Manager. We used it to:
- **Draft the PRD**: Claude helped us articulate the website's vibe and translate it into concrete functional requirements.
- **Sprint Management**: We used Claude to break down complex epics like "Asynchronous Turns" into manageable sub-tasks.
- **Strategic Pivots**: When we encountered the "Safari Cookie" issue, we used the high-level reasoning of the web interface to brainstorm architectural solutions (Proxy vs. Header-based auth) before writing a single line of code.

### Modality 2: Antigravity (IDE-native Agentic Agent)
For **Core Implementation and TDD**, we shifted to Antigravity, an agentic AI built directly into our IDE. Antigravity was our Lead Engineer. Its strength was its ability to read our entire filesystem and execute tools. We used it to:
- **Enforce Rigor**: We maintained a `.antigravityrules` file that enforced project-wide standards (e.g., "all routes must have Swagger docs").
- **Drive 88% Test Coverage**: Antigravity was tasked with writing unit and integration tests (Vitest/Supertest) for every new endpoint. It wouldn't just "suggest" tests; it would run them, see the failures, and fix the code in a tight feedback loop.
- **Infrastructure Setup**: Antigravity scaffolded our Prisma schema and managed the complex SQL migrations during the "Identity" pivot.

### Modality 3: GitHub Copilot (Inline Completion)
Our third modality was **GitHub Copilot**, used for **Micro-level Implementation and Standardization**. While Antigravity handled the "big picture" logic, Copilot provided:
- **Syntax Standardization**: Ensuring our Tailwind classes followed a consistent order.
- **Boilerplate Reduction**: Rapidly expanding standard Express controller structures once the first one was established by Antigravity.
- **Snippet Translation**: Helping us translate standard utility functions (like our alphanumeric access code generator) between languages for our localized UI.

## Conclusion: Quality Over Noise
Collective Unconscious is a proof of concept for a different type of social platform: one that is technically sophisticated but visually and experientially simple. By scaling our test coverage to over 88%, surviving a major architectural "Proxy Pivot," and successfully merging anonymous session logic with modern OAuth identity, we've built a persistent, secure, and documented engine for human creativity. 

Ultimately, the success of Collective Unconscious lies in this paradox: leveraging the most advanced AI tools of 2026 to recapture the unhurried, low-friction essence of the early web. It is a proof of concept that technical excellence doesn't have to mean complexity for its own sake. Instead, we’ve used that rigor to clear the path, removing every technical barrier until all that remains is the spark between two strangers sharing a page. As we look forward, we hope this project serves as a blueprint for a new wave of "slow tech"—software that works tirelessly behind the scenes so that its users can finally slow down, let go, and contribute their own unique piece to the collective story.

As our team envisions, fashion may be cyclical, but the human desire to create together is a constant. We'll see you in the Unconscious.