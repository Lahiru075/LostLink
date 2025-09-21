# LostLink - The Smart Lost & Found Network

![LostLink Hero Image](https://i.imgur.com/your-hero-image-url.png) <!-- Optional: Add a nice hero image/banner here -->

## 1. Project Description

**LostLink** is a modern, full-stack web application designed to create a community-powered network for lost and found items. The core purpose of this project is to leverage technology to efficiently connect individuals who have lost personal belongings with those who have found them.

The system features a "Smart Matching Algorithm" that intelligently compares newly reported items against the existing database. It calculates a "Match Score" based on multiple factors, including **item category, textual keywords (title/description), geographical location (latitude/longitude), and visual similarity using Perceptual Hashing (pHash) for images.** This automated process helps users quickly identify potential matches and facilitates a secure communication channel to arrange the recovery of their items.

The application is built with a clear separation between the **User Side** (for public reporting and management) and a powerful **Admin Side** (for platform moderation and oversight).

---

## 2. Key Features & Screenshots

Here is a showcase of the application's key features.

### **1. Professional Landing Page**
A clean, modern, and detailed homepage designed to build user trust and clearly explain the value of the LostLink network. It guides new users smoothly into the sign-up process.

![Homepage Screenshot](<img width="422" height="862" alt="image" src="https://github.com/user-attachments/assets/f22b0b06-c7ea-4581-9e24-482d7ecc9572" />)

---

### **2. Secure Authentication**
Beautifully designed, separate pages for user **Sign Up** and **Sign In**, ensuring a secure and user-friendly authentication experience. The UI is consistent with the overall brand identity.

![Login Page Screenshot]([YOUR_LOGIN_PAGE_SCREENSHOT_URL])

---

### **3. Intuitive User Dashboard**
Once logged in, users are greeted with a personalized dashboard. It provides an at-a-glance overview of their activity, quick access to reporting functions, and a summary of their statistics.

![User Dashboard Screenshot]([YOUR_USER_DASHBOARD_SCREENSHOT_URL])

---

### **4. Smart Item Reporting**
A comprehensive modal form allows users to report lost or found items with all necessary details, including title, category, description, date, and an image upload (powered by ImgBB). It also features an intelligent location picker with autocomplete suggestions (powered by LocationIQ).

![Report Item Modal Screenshot]([YOUR_REPORT_ITEM_MODAL_SCREENSHOT_URL])

---

### **5. Dynamic Item & Match Management**
Users can manage their reported items and view potential matches on dedicated pages. These pages feature live search, dynamic filtering by category/status, and pagination for easy navigation through a large number of reports.

![My Lost Items Page Screenshot]([YOUR_MY_ITEMS_PAGE_SCREENSHOT_URL])

![Matches Page Screenshot]([YOUR_MATCHES_PAGE_SCREENSHOT_URL])

---

### **6. Powerful Admin Dashboard**
A separate, secure dashboard for administrators to monitor and manage the entire platform. It includes statistical widgets and tables to manage all users, items, and categories.

![Admin Dashboard Screenshot]([YOUR_ADMIN_DASHBOARD_SCREENSHOT_URL])

---

## 3. Setup and Installation Instructions

To run this project locally, you will need Java (JDK 17+), Maven, Node.js (for frontend dependencies if any), and a MySQL server.

### Backend Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/lostlink.git
    cd lostlink/BackEnd
    ```

2.  **Configure the Database:**
    *   Open your MySQL client (e.g., MySQL Workbench).
    *   Create a new database named `lostlink_db`.
    *   Open the `src/main/resources/application.properties` file.
    *   Update the `spring.datasource.url`, `spring.datasource.username`, and `spring.datasource.password` properties to match your local MySQL configuration.

3.  **Add API Keys:**
    *   In `application.properties`, add your secret API key for the ImgBB service:
        ```properties
        imgbb.api.key=YOUR_IMGBB_API_KEY
        ```

4.  **Build and Run the Application:**
    *   Navigate to the backend project's root directory in your terminal.
    *   Run the application using the Maven wrapper:
        ```bash
        ./mvnw spring-boot:run
        ```
    *   The backend server will start on `http://localhost:8080`.

### Frontend Setup

1.  **Navigate to the Frontend Directory:**
    *   The frontend is built with plain HTML, CSS, and JavaScript (with jQuery). No complex build step is required.

2.  **Open the HTML Files:**
    *   Open the `index.html` (Homepage), `login.html`, `signup.html`, or other user-facing HTML files directly in your web browser.
    *   For the best experience and to avoid CORS issues during development, it is recommended to use a lightweight server. If you have VS Code, you can use the **"Live Server"** extension.

3.  **Update API Keys (if necessary):**
    *   Open the relevant JavaScript files (e.g., `lostitempage.js`).
    *   Find the placeholder for the **LocationIQ API Key** and replace it with your own key:
        ```javascript
        const apiKey = 'YOUR_LOCATIONIQ_API_KEY';
        ```

---

## 4. Demo Video

You can find a complete demonstration of the project's features and workflow in the video linked below.

**[Watch the LostLink Project Demo on YouTube](<Your YouTube Link Here>)**
