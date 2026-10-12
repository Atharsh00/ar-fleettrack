# FleetTrack Pro - Multi-Entity Fleet Expense & Revenue Management System

A responsive, high-performance web application designed for independent truck owners and multi-entity fleet operators to manage vehicle expenses, client rental incomes, driver payouts, and trip-based earnings with automated accounting logic.

---

## 🌟 Instant Launch (Zero Installation Required)
You can test and run the entire interactive application immediately in your browser:
- Open [`index.html`](./index.html) directly in **Google Chrome**, **Microsoft Edge**, or **Firefox**.
- Multi-tenancy profile switching, revised 15% net salary calculations, 1% TDS deduction tracking, universal edit/delete, and `localStorage` persistence work right away out of the box!

---

## 🚀 Key Feature Updates & Architecture

### 1. Multi-Profile Management (Multi-Tenancy)
- **Global Profile Selector:** Top navigation bar entity selector allows switching between multiple ownership entities/sub-companies (e.g., *Apex Logistics India*, *Kiran Roadways Enterprise*).
- **Data Scoping:** All trucks, drivers, clients, trips, expenses, payouts, and rules are isolated per profile.
- **Profile Manager:** Add new profiles, rename, or delete existing profiles with cascading cleanup.

### 2. Clean UI & Currency Standardization
- **Exclusive INR (₹):** Standardized currency formatting across the entire app.
- **Header Cleanups:** Removed legacy reset and currency toggles for a clean production interface.
- **Truck Performance:** Removed truck status badges for clean tabular P&L viewing.

### 3. Revised Trip Entry & Accounting Flow
- **Multi-Drop Dynamic Routes:** Origin (`From`), Primary Destination (`To`), plus dynamic intermediate stops via the `Add Destination Drop (+)` button.
- **Broker Commission Amount:** Manual entry for broker/agent deduction.
- **Statutory 1% TDS Checkbox:** Boolean flag to withhold 1% under Section 194C.
- **Calculation Order:**
  1. $\text{Agreed Gross Rent}$ (Base contract)
  2. $\text{TDS Deduction (1\%)} = \text{Gross Rent} \times 1\%$ (if checked)
  3. $\text{Net Rent} = \text{Gross Rent} - \text{TDS Amount} - \text{Broker Commission}$
  4. $\text{Driver Salary} = 15\% \times \text{Net Rent}$ (calculated *after* TDS and commission)
  5. $\text{Company Balance Due} = \text{Gross Rent} - \text{Advance Received} - \text{TDS Amount}$

### 4. New Dedicated Tabs
- **TDS Deduction Ledger:** Dedicated tracking for 1% TDS withholdings with summary metrics and Form 26AS reconciliation table.
- **Universal Data Entry Ledger:** Master chronological log of all entries (Trips, Expenses, Driver Payouts, Settlements) with search, multi-faceted filtering, and in-place **Edit** and **Delete** actions on every row.
- **Rules & Configuration Center:** Configure default driver salary % and default TDS %, manage master entity dropdowns (rename/delete trucks, drivers, companies with cascading updates), and manage entity profiles.
- **Company & Driver Ledger Deep-Dives:** Click on any company or driver to view their complete transaction history and perform in-place edits and deletions.

---

## 🗄️ Database Schemas Included

- **Prisma Schema:** [`prisma/schema.prisma`](./prisma/schema.prisma) with `Profile`, `SystemRule`, multi-tenancy relations, and cascade actions.
- **ANSI SQL DDL:** [`prisma/schema.sql`](./prisma/schema.sql) compatible with PostgreSQL and SQLite.

---

## 💻 Running with Vite & Node.js (Optional)

When Node.js is installed on your machine:
```bash
npm install
npm run dev
```
