# 🌴 LeavePulse - Mini Leave Request Application

A modern, full-stack Leave Request and Management System built with **Node.js, Express, MongoDB (Mongoose)**, and **React (Vite)**.

---

## 🚀 Features

### 👤 Employee Portal
- **Apply for Leave**: Select leave type (`Casual` / `Sick`), start date, end date, and reason.
- **Real-time Leave Duration Calculator**: Automatically calculates working days and excludes weekend days (Saturdays & Sundays) in real time as dates are picked.
- **Leave History & Status**: Track state (`Pending`, `Approved`, `Rejected`) and view feedback comments from management.
- **Live Balance Counter**: Display remaining Casual (10 initial) and Sick (10 initial) leave balances.

### 🛡️ Manager Portal
- **Pending Approvals Queue**: View all pending employee leave requests with employee details and requested working days.
- **Approve or Reject**: One-click approval/rejection with optional manager comments.
- **Automatic Balance Deduction**: Deducts leave days from employee's balance atomically upon manager approval.
- **Employee Directory**: View all registered employees, their emails, and real-time leave balances.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, MongoDB / Mongoose, JWT (JSON Web Tokens), Bcrypt.js, CORS, Dotenv.
- **Frontend**: React 19, Vite, React Router DOM, Axios, Lucide Icons, Custom Modern CSS Design System.
- **Database**: MongoDB Atlas (with automatic local `MongoMemoryServer` fallback for offline / local execution).

---

## 🧠 Edge Cases Handling & Business Logic

### 1. 📅 A Leave Date Range Spanning a Weekend
- **Approach**: Non-working days (**Saturdays & Sundays**) are automatically excluded from leave deductions.
- **Calculation Rule**:
  - Example: A leave request from **Friday (Oct 09)** to **Monday (Oct 12)** spans 4 calendar days, but calculates as **2 working days** (Friday & Monday).
  - Example: Selecting **Saturday (Oct 10)** to **Sunday (Oct 11)** calculates **0 working days**. The application blocks submission with a clear error: `"Selected date range contains only weekends (0 working days)"`.

### 2. ⚠️ Overlapping Leave Requests
- **Approach**: Checks for existing `Pending` or `Approved` leave requests for the same employee where:
  $$\text{existing.startDate} \le \text{new.endDate} \quad \text{AND} \quad \text{existing.endDate} \ge \text{new.startDate}$$
- If an overlap is detected, the API rejects the request with `400 Bad Request` and displays the conflicting date range.

### 3. 💳 Applying for Leave with Insufficient Balance
- **Approach**: The requested working days are checked against the employee's available balance for that specific leave type (`Casual` or `Sick`).
- Validation occurs at two levels:
  1. **Employee Submission**: Immediate frontend warning & API validation blocking submission if `requestedDays > balance`.
  2. **Manager Approval**: Double-check in backend transaction when the manager approves. If balance is insufficient, approval is blocked.

---

## 🤖 AI Tools & Transparency Statement

### AI Tools Used
- **Google Antigravity / Claude Code AI**: Used for system architecture planning, backend controller design, date calculation algorithms, and Vite React frontend UI development.

### AI Mistake & Correction
- **Issue Identified**: The initial AI-generated code parsed date strings like `"2026-10-05"` using `new Date("2026-10-05")` followed by `.setHours(0, 0, 0, 0)`. In local timezones (e.g. UTC+5:30 IST), parsing `"2026-10-05"` created `2026-10-05 00:00:00 UTC`, which local `.setHours()` shifted back to `2026-10-04 18:30:00 local time`. This caused `.getDay()` to evaluate Monday as Sunday, miscalculating weekend days.
- **Correction Made**: Created a dedicated `parseLocalDate` helper that explicitly splits date strings into `[YYYY, MM, DD]` and constructs local midnight dates (`new Date(year, month - 1, day, 0, 0, 0)`). This eliminated timezone offsets and ensured exact weekend day calculations across all timezones.

---

## ⚙️ Assumptions Made

1. **Default Leave Allowance**: Every newly registered employee starts with **10 Casual leaves** and **10 Sick leaves**.
2. **Default Manager Account**: One default Manager account (`aman@gmail.com` / `12345678`) is auto-seeded on application startup.
3. **Approval Required for Deduction**: Leave balance is only deducted when a request transitions to `Approved`. Rejection does not alter leave balances.

---

## 💻 Instructions to Run the Project Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone & Set Up Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/leave_management
JWT_SECRET=your_jwt_secret_key_here
```

Start the backend server:
```bash
# Production / Standard start
npm start

# Development mode with nodemon
npm run dev
```
> **Note**: If MongoDB Atlas connection fails or IP is not whitelisted, the server automatically starts an in-memory MongoDB fallback and auto-seeds the manager account (`aman@gmail.com` / `12345678`).

### 2. Set Up & Run Frontend

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:3000`.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Manager** | `aman@gmail.com` | `12345678` | Full Manager Portal (Approvals & Employee Directory) |
| **Employee** | *Register any email* | *Your choice* | Employee Portal (Apply for leaves & track history) |

---

## 🌐 Deployment Links

- **GitHub Repository**: *(Add your GitHub repo URL here)*
- **Live Frontend (Vercel)**: *(Add your Vercel URL here)*
- **Live Backend (Render / Railway / Zeabur)**: *(Add your backend service URL here)*
