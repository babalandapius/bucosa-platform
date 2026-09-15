# BUCoSA Platform (Monorepo)

The official open-source platform for the **Busitema University Computing Students' Association (BUCoSA)**. Built to automate student membership registration, issue dynamic QR-verified PDF membership cards, publish executive rosters, share academic resources, and stream live campus updates.

---

## 🛠️ Tech Stack

- **Frontend:** React.js (Vite), React Router DOM, Axios, Lucide Icons, CSS Modules
- **Backend:** Node.js, Express.js (MVC Architecture)
- **Database:** MySQL (Native Connection Pool)
- **Document & Media Services:** PDFKit, QRCode, Multer
- **Security:** JSON Web Tokens (JWT), Bcrypt.js, Helmet, CORS, Express Rate Limit

---

## 📁 Repository Structure

```text
bucosa-platform/
├── backend/                  # Express.js RESTful API
│   ├── config/               # Database pool connection & auto-migrations
│   ├── controllers/          # Authentication & user management logic
│   ├── middleware/           # Auth guards, rate limiters & error handlers
│   ├── routes/               # API endpoint definitions
│   ├── utils/                # Vector PDF membership card generator
│   ├── uploads/              # Statically served brand assets & student PDFs
│   └── .env.example          # Backend environment template
├── frontend/                 # React.js SPA Client
│   ├── src/
│   │   ├── components/       # Reusable UI elements (Navbar, Cards, Modals)
│   │   ├── pages/            # Page layouts (Signup, Login, Dashboard)
│   │   ├── services/         # Axios API connection layer
│   │   └── context/          # Global Auth state management
│   ├── public/               # Static web assets & favicon
│   └── .env.example          # Frontend environment template
├── CONTRIBUTING.md           # Guidelines for external contributors
└── README.md                 # Project setup and API documentation