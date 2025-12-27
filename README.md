# Website Trust Checker

A simple tool to assess the security risk of a website before visiting it.

## What this tool does
- Checks URLs against Google Safe Browsing
- Detects HTTPS usage
- Provides an easy-to-understand risk level
- Explains why a website is rated the way it is

## What this tool does NOT do
- It does not guarantee safety
- It does not scrape reviews
- It does not track users

## How it works
The tool combines:
- Google Safe Browsing threat checks
- Basic security signals (HTTPS, domain familiarity)

Results are probabilistic and meant to help users make informed decisions.

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Serverless Functions (Vercel)
- Security Data: Google Safe Browsing API

## Local Development
No build tools required.
Simply deploy using Vercel.

## Disclaimer
No automated system can guarantee a website is completely safe.
Always use personal judgment.
