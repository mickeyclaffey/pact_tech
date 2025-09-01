# EHR Resource Viewer

A modern web application for viewing, monitoring, and managing Electronic Health Record (EHR) resources. Built with Next.js, TanStack Table, and shadcn/ui components.

---

## Features
- View a sortable, filterable table of EHR resources
- When a time column is selected for sorting, absolute time will be displayed for that column as well
- Add or remove columns you would like to see
- Search by keyword matching in a specific column
- Export current rows and columns as CSV
- Renders as soon as enough rows for one page are fetched
- Click a resource to view detailed metadata and history
- Filters, selected columns, page sizes, etc. are not saved anywhere on refresh
- Note: all logic is client-side due to small size of sample data I created, I would implement server-side pagination and querying if dataset were to become large

---

## Getting Started

### 1. Clone the Repository
```sh
git clone https://github.com/your-username/your-repo.git
cd pact_tech/ehr-resource-viewer
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Set Up Environment Variables
- Create a .env.local file in the ehr-resource-viewer directory.
- **I will send over `.env.local` file with API keys via email.**

### 4. Run the Development Server
```sh
npm run dev
```
- Open [http://localhost:3000](http://localhost:3000) in your browser.

---
