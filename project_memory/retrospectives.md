# Project Retrospectives

## Sprint 1 Retrospective (Core Writing Loop)

**Date:** February 28, 2026

### What went well?
- **Zero-friction onboarding**: The session-token based "account-free" flow worked perfectly and met the goal of letting users write immediately.
- **Vibe coding efficiency**: Using Antigravity for the core "Log" and "Turn" logic allowed us to iterate very quickly on the collaborative state management.
- **CI/CD setup**: Having the linting and testing pipeline active from Day 1 prevented integration headaches as the backend grew.

### What could have been better?
- **CSS complexity**: We initially struggled with Tailwind 4’s new isolation rules, which led to some "funky" layout issues in the first few builds.
- **Cross-origin cookies**: We underestimated the difficulty of handling session cookies across different Render subdomains, leading to a late-sprint pivot in how we handled `VITE_API_URL`.

### Actions for next sprint:
- **Centralize API config**: Ensure all frontend services use a single, reliable configuration for the backend URL.
- **Focus on testing**: Improve frontend component testing early in the sprint to avoid a bottleneck at the end.

---

## Sprint 2 Retrospective (Accounts & Moderation)

**Date:** March 12, 2026

### What went well?
- **Google OAuth Integration**: Moving from anonymous tokens to full identity was smooth thanks to Passport.js and robust Prisma models.
- **Admin Dashboard**: Creating a specialized path for moderators (`/moderation`) significantly improved the platform's long-term viability.
- **API Documentation**: Moving to `swagger-jsdoc` automated the docs, ensuring they stay in sync with the code.

### What could have been better?
- **Proxy/Domain confusion**: The redirect loop issue on Render (the `-1` vs standard subdomain) was a significant blocker that took several hours to debug.
- **Mobile Safari Edge Cases**: We encountered some cookie-blocking behavior on mobile browsers that forced us to switch to a proxy-based architecture late in the sprint.

### Actions for next sprint (Future):
- **Custom Domain**: Migrating to a single custom domain (e.g., `collective-unconscious.io`) would eliminate most proxy and subdomain complexities.
- **Real-time hooks**: Explore WebSockets for turn notifications instead of long-polling or manual refreshes.
