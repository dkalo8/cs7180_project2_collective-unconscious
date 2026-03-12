# The Minimalist Stack: Engineering "Collective Unconscious" for Async Collaboration

## Introduction: The Vision of Low-Pressure Creativity
In the modern digital landscape, online collaboration is often synonymized with high-frequency noise. Group chats move too fast to sustain a creative thread, and traditional social media often rewards performative "takes" over genuine, serendipitous creation. **Collective Unconscious** was born from a desire to reverse this trend. 

The goal was to build an asynchronous, turn-based collaborative chain-writing platform that feels intentional yet effortless. By stripping away the ego and focusing on a shared piece of work where identity is marked only by text color, we created a "digital sandbox" where creative sparks—ranging from deep haikus to office-humor observations—can grow into a unified narrative. This post explores the technical journey of building this minimalist, professionally-engineered stack using AI orchestration.

## 🧱 The Foundation: A Technical Overview
Building a platform that prioritizes "zero-friction" required a robust but lightweight architecture:
- **Frontend**: React 18 powered by Vite and styled with Tailwind CSS (Vanilla CSS approach for custom components).
- **Backend**: Node.js and Express, providing a RESTful API.
- **Database**: PostgreSQL managed via Prisma ORM for type-safe data handling.
- **Documentation**: Fully automated Swagger/OpenAPI documentation.

The stack was chosen for its reliability and the speed at which we could move from prototype to production. However, as with any "simple" concept, the complexity lay in the edge cases.

## 🧩 Engineering the Writing Loop: The "Set-based OOR" Challenge
The heart of Collective Unconscious is the **Log**. A log is a chain of **Turns**. Implementing a turn-based system in a real-time environment is straightforward; implementing it asynchronously with a mix of persistent participants and "guest" walkers is where it gets interesting.

### The "Is Out of Rotation" (OOR) Flag
We wanted to allow new users to join a log and contribute a turn immediately, even if they weren't next in the pre-defined rotation. This led to the creation of the `isOutOfRotation` flag. 

In a standard "Structured" log, the rotation pointer (the `expectedJoinOrder`) advances sequentially. If Writer A just wrote, the pointer moves to Writer B. But what if Writer C joins the log for the first time? If we forced them to wait until everyone else had written, the "frictionless" promise of the app would be broken. 

We developed a logic where a user can submit an "entrance" turn. This turn contributes content and adds the user to the participant pool but **does not advance the rotation pointer**. 

### Set-based Pointer Management
A significant bug surfaced during testing: if multiple users joined "out of rotation" in a single round, the pointer would eventually land on someone who had already contributed content, potentially allowing them to write two turns in a row—a direct violation of our core "one turn at a time" rule.

The solution was a **Set-based OOR Skip**. In our `computeNextExpectedJoinOrder` utility, we now collect all writers who contributed any turn (traditional or OOR) since the last "in-rotation" turn into an `alreadyWroteIds` set. The system then cycles the pointer forward until it finds someone who *is not* in that set. This ensures the creative flow remains distributed and fair, regardless of how many new participants jump in mid-round.

## 🚢 The "Proxy Pivot": A Deployment Case Study
Deployment is often where "works on my machine" goes to die. For Collective Unconscious, the challenge was **Cross-Origin Cookie Blocking**.

We initially deployed the backend and frontend as two separate services on Render. Because they existed on different subdomains (e.g., `app.onrender.com` vs `api.onrender.com`), browsers—particularly Mobile Safari—viewed our session cookies as "third-party" and blocked them for security. This broke sign-in persistence and anonymous session tracking, the very core of our frictionless experience.

### Moving to a Proxy Strategy
Instead of fighting browser security defaults, we pivoted to an architectural solution. We configured the frontend (a static site) to serve the API under its own path via a reverse proxy. 

On the server side, we had to adjust our authentication middleware to trust the proxy:
```javascript
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}
```
Combined with setting `SameSite: 'lax'` on our JWT and session cookies, this allowed the browser to view the API calls as "first-party." The result was a rock-solid authentication flow that worked across all devices, from desktop Chrome to mobile iPhone.

## 🔑 Evolution of Auth: From Anonymous to Identity
We started Sprint 1 with a "Zero-Friction" goal: let users write without an account. We achieved this using anonymous session tokens stored in the database. During Sprint 2, we introduced **Google OAuth via Passport.js**.

The technical triumph here was the migration path. When an anonymous user—who might have already contributed to three logs—decides to finally register with Google, the platform needs to "claim" those previous turns. We implemented a background merge logic that looks for existing session tokens associated with the user's browser and updates the `Writer` records in PostgreSQL to point to the new, permanent `User` ID. This ensures the user's history is preserved, rewarding their transition from casual guest to registered community member.

## 🦾 AI Mastery and Professional Rigor
One of the unique aspects of this project was the use of **AI Modalities** to enforce high engineering standards. We didn't just use AI to "generate code"; we used it to orchestrate a professional development lifecycle.

- **Claude (Web)** acted as our Product Manager, defining the PRD and challenging our architectural assumptions.
- **Antigravity (IDE)** was our Lead Engineer. It didn't just write functions; it enforced a **88% test coverage** milestone using Jest, Vitest, and Supertest. It configured our GitHub Actions CI/CD pipeline to ensure that no code could reach production if it broke the build or lowered our quality standards.

The presence of a live, auto-updating **Swagger Documentation** page at `/api-docs/` is a testament to this rigor. Every endpoint is documented, typed, and testable directly from the browser, ensuring the "Collective Unconscious API" is ready for public integration.

## 📊 Conclusion: Quality over Noise
Collective Unconscious is a proof of concept for a different type of social platform: one that is technically sophisticated under the hood but remains visually and experientially simple for the user. 

By scaling our test coverage to over 88%, surviving a major architectural "Proxy Pivot," and successfully merging anonymous session logic with modern OAuth identity, we've built more than just a writing app. We've built a persistent, secure, and documented engine for human creativity. 

The piece of text you add today—rendered in your unique hex color—becomes a permanent part of the collective whole. And that, in the end, is the entire point.
