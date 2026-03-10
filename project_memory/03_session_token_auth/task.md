# Task Breakdown: Session-Token Auth

## Setup
- [x] Create tests for token generation and validation middleware
- [x] Write failing tests (TDD)

## Authentication Middleware
- [x] Implement `sessionMiddleware` to check for existing session token
- [x] Generate unique session token (UUID) if none exists
- [x] Set HTTP-only, SameSite, Secure cookie with 30-day maxAge
- [x] Implement `requireAuth` to strictly validate UUID format
- [x] Implement `requireWriter` middleware for log-specific routes
- [x] Inside `requireWriter`, ONLY resolve or create `Writer` record in database using token and logId
- [x] Attach `Writer` object to req for downstream use

## Protected Routes & Tests
- [x] Create tests for token generation & cookie config (`HttpOnly`, `Max-Age`, etc)
- [x] Create tests for token expiry and renewal
- [x] Create tests for `requireAuth` (validates UUID format)
- [x] Create tests for `requireWriter` (DB creation, resolving existing)
- [x] Verify test suite passes

## Verification
- [x] Verify unit tests pass
- [x] Verify no lint errors
