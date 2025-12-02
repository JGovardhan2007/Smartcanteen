
# 🍔 Smart Canteen Management System

![React](https://img.shields.io/badge/React-18-blue) ![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-orange) ![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue) ![AI](https://img.shields.io/badge/AI-Gemini%20%26%20Pollinations-purple)

A comprehensive **Full-Stack DBMS Project** designed to digitize school and college canteens. This application features a high-speed **Kiosk Mode** for students to place orders and a robust **Admin Dashboard** for inventory control, real-time order management, and AI-powered sales analysis.

---

## ✨ Features

### 👨‍🎓 Student Panel (Kiosk Mode)
*   **Fast Ordering:** Optimized flow for high-traffic environments.
*   **Smart Menu:** Filter by Category, toggle **Veg/Non-Veg**, and see "Bestseller" & "Spicy" badges.
*   **Real-time Cart:** Add items, adjust quantities, and calculate totals instantly.
*   **Token System:** Generates a unique 4-digit token number (#XXXX) for every order.
*   **Auto-Reset:** Automatically logs out after 10 seconds of inactivity post-order to prepare for the next student.

### 👨‍💼 Admin Dashboard
*   **Live Order Tracking:** View "Active Orders" with status (Pending → Preparing → Ready → Completed).
*   **Inventory Control:** Full CRUD (Create, Read, Update, Delete) capabilities.
    *   Toggle "Sold Out" / "In Stock" instantly.
    *   Edit prices, descriptions, and diet types.
*   **Order History:** Searchable database of all past orders with status filters.
*   **AI Integration:**
    *   **Sales Analysis:** Google Gemini AI analyzes daily sales data to provide actionable business insights.
    *   **Auto-Image Generation:** Adding a new dish? Pollinations AI automatically generates a realistic photo based on the food name.

---

## 🛠️ Tech Stack

*   **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide React (Icons).
*   **Backend:** Firebase (Google Cloud Platform).
    *   **Authentication:** Anonymous Auth (Students) & Email/Password (Admins).
    *   **Database:** Cloud Firestore (NoSQL Real-time DB).
*   **AI Services:**
    *   **Google Gemini API:** For generating sales reports and business intelligence.
    *   **Pollinations AI:** For dynamic food image generation.
*   **Visualization:** Recharts for sales graphs.

---

## 🗄️ DBMS & Database Structure

This project demonstrates core Database Management System concepts:

### Collections (Firestore)
1.  **`menu`**: Stores food items.
    *   *Fields:* `id`, `name`, `price`, `category`, `dietType`, `isAvailable`, `imageUrl`.
2.  **`orders`**: Stores transaction data.
    *   *Fields:* `studentId`, `tokenNumber`, `items` (Array), `totalAmount`, `status`, `timestamp`.
3.  **`users`** (Auth): Managed via Firebase Authentication.

---

## 🚀 Installation & Setup

### Prerequisites
*   Node.js installed.
*   A Google Firebase Account.

### Steps

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/smart-canteen.git
    cd smart-canteen
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Firebase Configuration**
    *   Go to [Firebase Console](https://console.firebase.google.com/).
    *   Create a project and enable **Firestore Database** (Start in Test Mode).
    *   Enable **Authentication** (Turn on *Anonymous* and *Email/Password* providers).
    *   Copy your web app config keys.

4.  **Configure Environment**
    *   Open `lib/firebase.ts`.
    *   Replace the `firebaseConfig` object with your specific keys.
    *   *(Optional)* Add your Gemini API Key in `services/geminiService.ts` if running locally (or set as environment variable).

5.  **Run the App**
    ```bash
    npm start
    ```

---

## 📝 License

This project is licensed under the MIT License.

---

*Built with ❤️ for the DBMS Course Project.*
