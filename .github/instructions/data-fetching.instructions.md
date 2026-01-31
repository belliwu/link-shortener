---
name: data-Fetching-Instructions
description: Read this file to understand how to implement data fetching in the project.
applyTo: **/*.ts, **/*.tsx
---

# Data fetching guidelines:

The document outlines best practices and guidelines for data fetching in our Next.js application. Adhering to these guidelines will ensure consistency, performance, and maintainability across the codebase.

## 1. Use Server Components for Data Fetching

- In Next.js, ALWAYS use Server Components for data fetching, NEVER use Client Components for data fetching.

## 2. Data Fetching Methods

- ALWAYS use the helper function in /data directory to fetch data.NEVER fetch data directly in components.

- All helper functions in /data directory should be use Drizzle ORM for database interactions.
