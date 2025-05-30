
The Mining Royalties Manager is a modern system for managing mining royalties, user access, compliance tracking, reporting, and analytics. It facilitates the administration of royalty payments, contract management, audit processes, and regulatory compliance for mining entities and minerals.

Key Components and Functionality
The database supports the following core functionalities, as outlined in the documents:

Royalty Records Management:
Tracks royalty payments for various mining entities (e.g., Kwalini Quarry, Mbabane Quarry, Ngwenya Mine) and minerals (e.g., Coal, Iron Ore, Gravel).
Stores data on:
Entity
Mineral type
Volume extracted (in cubic meters, m³)
Royalty tariff (E/m³, in Eswatini Lilangeni)
Total royalties
Date
Status
Allows filtering and exporting of royalty records for reporting.
User Management:
Manages user accounts with role-based access control (Admin, Editor, Viewer, Auditor).
Stores user details such as:
Username
Email
Role
Department (e.g., Finance, Operations, Compliance)
Account status (Active, Locked, Expired)
Last login
Failed login attempts
Account expiration date
Supports adding, editing, and deleting users (except admin accounts).
Compliance and Regulatory Management:
Ensures compliance with Eswatini mining laws, SADC regional protocols, and fiscal requirements.
Tracks compliance metrics, such as:
Mining licenses
Tax filings
Environmental permits
Royalty payment compliance
Manages regulatory submissions, including:
Monthly Royalty Returns
Quarterly Production Reports
Environmental Impact Assessments
Tax Returns
Provides alerts for upcoming deadlines and overdue reports.
Audit Dashboard:
Tracks discrepancies between declared and verified volumes of extracted minerals.
Logs audit activities, including timestamps, user actions, and IP addresses.
Supports filtering of audit logs by date, action type, and entity.
Reporting and Analytics:
Generates real-time analytics and KPI dashboards for stakeholders.
Provides reports such as:
Monthly Royalty Summary
Entity Performance Analysis
Compliance Status Report
Outstanding Payments Report
Supports customizable reports with selectable metrics (e.g., financial, production, compliance).
Allows scheduling of recurring reports (e.g., weekly or monthly) with specified formats (PDF, Excel, CSV).
Contract Management:
Manages royalty agreements for mining entities, including:
Entity
Royalty rate (E/m³)
Start date
Associated documents
Communication and Notifications:
Manages stakeholder communications, such as payment reminders, compliance notices, and general announcements.
Tracks notification history and statuses (Unread, Read).
Supports filtering by recipient and message type.
Tax and Fiscal Management:
Tracks tax structures and rates, including:
Mineral royalties (e.g., 3% for coal, 5% for iron ore, E15/m³ for quarry products)
Corporate income tax (27.5%)
Withholding tax (15% on dividends, 10% on interest and royalties)
VAT (15%)
Supports updates to tax rates and exporting tax schedules.
Data Storage
The application uses IndexedDB for local data storage in the browser, as noted in the test_app.html file.
Initial sample data includes:
3 royalty records
3 default users (Admin, Editor, Viewer)
Pre-configured entities and minerals
Key Features
Role-Based Access Control: Different roles (Admin, Editor, Viewer, Auditor) have specific permissions for accessing and modifying data.
Compliance Monitoring: Tracks compliance with local (Eswatini) and regional (SADC) regulations, including deadlines and alerts.
Analytics and Visualization: Uses Chart.js for dashboard charts to display revenue trends, production volumes, and compliance rates.
Export Capabilities: Supports exporting reports in multiple formats (PDF, Excel, CSV, HTML) using the jsPDF library.
Mobile-Friendly Design: Responsive CSS ensures usability on various devices, with mobile menu toggles and adaptive layouts.
