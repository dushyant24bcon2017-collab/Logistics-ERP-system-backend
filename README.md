<img width="5248" height="875" alt="Untitled-2026-06-27-1915" src="https://github.com/user-attachments/assets/bd3a7c5b-f85b-4cea-b8ae-83af5568129c" />
Tech Stack
Frontend: React, Tailwind CSS, Shadcn UI
Backend: Node.js, Express.js
Database & ORM: PostgreSQL, Prisma ORM
Authentication: JWT 

Architecture & Core Features
Multi-Tenant Database Design: Architected the schema from the ground up for multi-tenancy, mapping all critical fields with a tenantId to ensure strict data isolation across different accounts.
Role-Based Access Control (RBAC): Implemented custom TypeScript types for incoming requests and built robust middleware to extract roles from JWTs, restricting API access based on user permissions.
Secure API Endpoints: Developed optimized routes for /products, /orders, /customer, and /analytics to handle complex logistical data.
Global State Management: Utilized the useContext hook to efficiently manage and share global application state (like user authentication and tenant data) 
Modular Frontend: Utilized custom React hooks for maximum code reusability and React Router for seamless state management and protected route handling.
Interactive UI: Leveraged Shadcn UI and Tailwind CSS to build clean, responsive data tables and dashboards.

 I learned a lot of things with this project faced many hurdels while designing the schema , writing middelware ,handling transaction queries, managing tables in frontend but all of it was worth it. 
