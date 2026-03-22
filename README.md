# 📌 SipUp - Fresh Fruits, Fresh Vibes 🍉🍊🍍

A modern, mobile-first restaurant ordering application specialized in fresh fruit juices, shakes, and plates. 

## 📖 Description
SipUp provides a lightning-fast and seamless ordering experience for customers craving fresh fruit items. Overcoming the hassle of traditional phone orders or clunky menus, SipUp offers a vibrant, highly responsive interface for instant add-to-cart functionality without requiring a login. It’s perfect for local juice bars, cafes, or college campus eateries seeking a streamlined order-to-pickup pipeline.

## 🚀 Features
- **Lightning-fast Ordering:** Complete checkout in under 30 seconds.
- **No Login Required:** Frictionless shopping experience for customers.
- **Smart Cart & Checkout:** Real-time price calculation with persistent storage and smooth animations.
- **Order Restrictions:** Smart constraints via backend admin controls (and frontend hostel delivery cutoffs).
- **Admin Dashboard:** Fully protected dashboard to manage orders (New → Preparing → Ready → Completed) and track sales metrics.
- **Mobile-First Design:** Fully responsive and optimized to look and feel like a modern native app.
- **PWA Ready:** Installable web application for quick access.

## 🛠️ Tech Stack
- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Animations:** Framer Motion
- **Icons:** Lucide-React
- **Routing:** React Router DOM
- **Backend API:** Node.js with Express.js
- **Database:** MongoDB (via Mongoose ODM)

## 📸 Screenshots / Demo

<img width="1902" height="869" alt="Screenshot 2026-03-22 161810" src="https://github.com/user-attachments/assets/299bcef9-d61a-47c2-ad91-c724146264e5" />
<img width="1919" height="866" alt="Screenshot 2026-03-22 162302" src="https://github.com/user-attachments/assets/d1652c5d-5aa8-4d9f-9ba2-61d79a38adc4" />
<img width="1902" height="867" alt="Screenshot 2026-03-22 162208" src="https://github.com/user-attachments/assets/cc8ccf3e-9467-45b0-9d77-8f3ab7f1320a" />
<img width="1919" height="868" alt="Screenshot 2026-03-22 162242" src="https://github.com/user-attachments/assets/09197adf-6414-43f4-81c3-dd51cbdbbc95" />




- **Live Demo:** [Link to Live App](https://sip-up-one.vercel.app/)

## ⚙️ Installation / Setup
Follow these steps to run the project locally. A developer should be able to run this without any extra steps.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/SipUp.git
   cd SipUp
   ```

2. **Install Frontend Dependencies:**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Start the Development Servers:**
   - Open a terminal for the backend:
     ```bash
     npm run server
     # Alternatively: cd server && npm run dev
     ```
   - Open another terminal for the frontend:
     ```bash
     npm run dev
     ```

5. **Seed the Menu (Initial Setup):**
   - After starting the server, visit `http://localhost:5000/api/menu/seed` in your browser to populate the database once.
   - Access the main frontend app at `http://localhost:5173` (or the port specified by Vite).

## 🔑 Environment Variables
For the project to work, you must define environment variables.

**Frontend (`.env` in root folder)**
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend (`server/.env` in server folder)**
```env
PORT=5000
MONGODB_URI= # Replace with your own secure MongoDB URI
```

## 📂 Project Structure
```text
SipUp/
├── public/                 # Static assets
├── server/                 # Node.js + Express Backend
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   └── server.js           # Server entry point
├── src/                    # Frontend React App
│   ├── components/         # Reusable UI components (Hero, Cart, Menu, Footer)
│   ├── context/            # Global state (CartContext)
│   ├── pages/              # Main view components (Home, Admin, MyOrders)
│   └── utils/              # API helpers and utilities
├── .env                    # Environment variables
└── package.json            # Frontend dependencies & scripts
```

## 👥 User Roles
- **Customer:** Can browse menus, customize items, manage their cart, and checkout instantly without authentication. Can also track their own orders.
- **Admin:** Protected by login credentials. Can view active orders, update order statuses, toggle "ordering enabled" mode, and monitor historical sales.

## 📌 Usage Guide
- **For Customers:** Simply open the web page, click on any item to view details, optionally choose customizations, add it to your cart, and click checkout in the bottom-right floating cart button. Enter your name, phone, and delivery address to finalize the order.
- **For Admins:** Navigate to `/admin`.
  - Default Username: `admin`
  - Default Password: `sipup123`
  - From here, accept and progress orders through different stages to keep customers updated on delivery.

## 🧠 Future Enhancements
- **Payment Gateway Integration:** Implement Razorpay or Stripe for online payments.
- **Push Notifications:** Alert customers directly when their order is ready for pickup or delivery.
- **Advanced Analytics:** Data visualizations to chart popular items, user counts, and peak ordering times.
- **User Authentication:** Optional customer accounts for saving favorite orders or earning loyalty points.

## 🐛 Known Issues
- Currently, hostel delivery logic time restrictions are defined in the frontend component instead of global dynamic settings.
- The `MONGODB_URI` currently points to a shared development cluster. This must be updated to a secure production cluster for real-world deployments.

## 📄 License
This project is licensed under the [MIT License](LICENSE).

## 👤 Author / Contact
- **Name:** Prince Malaviya
- **Mail:** princemalaviya302@gmail.com
