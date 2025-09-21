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

<img width="422" height="862" alt="image" src="https://github.com/user-attachments/assets/030da55b-9607-47c5-8397-6661acd2484e" />


---

### **2. Secure Authentication**
Beautifully designed, separate pages for user **Sign Up** and **Sign In**, ensuring a secure and user-friendly authentication experience. The UI is consistent with the overall brand identity.

<img width="1439" height="849" alt="image" src="https://github.com/user-attachments/assets/fedfafb6-cb0e-47cb-9409-727d21f2a642" />


---

### **3. Intuitive User Dashboard**
Once logged in, users are greeted with a personalized dashboard. It provides an at-a-glance overview of their activity, quick access to reporting functions, and a summary of their statistics.

<img width="1901" height="910" alt="image" src="https://github.com/user-attachments/assets/d434588c-e927-4fe4-89d1-98dec4e23083" />


---

### **4. Smart Item Reporting**
A comprehensive modal form allows users to report lost or found items with all necessary details, including title, category, description, date, and an image upload (powered by ImgBB). It also features an intelligent location picker with autocomplete suggestions (powered by LocationIQ).

<img width="435" height="783" alt="image" src="https://github.com/user-attachments/assets/7b998b4e-eb51-46bb-92d1-1d644734bcbe" />


---

### **5. Dynamic Item & Match Management**
Users can manage their reported items and view potential matches on dedicated pages. These pages feature live search, dynamic filtering by category/status, and pagination for easy navigation through a large number of reports.

<img width="1919" height="912" alt="image" src="https://github.com/user-attachments/assets/42339ea2-0408-40ce-bf76-c6f01c9b8eb8" />


<img width="1898" height="909" alt="image" src="https://github.com/user-attachments/assets/ac97ecdf-ad51-4b8a-9a97-3efc8aa4ba0a" />


---

### **6. Powerful Admin Dashboard**
A separate, secure dashboard for administrators to monitor and manage the entire platform. It includes statistical widgets and tables to manage all users, items, and categories.

<img width="1901" height="905" alt="image" src="https://github.com/user-attachments/assets/21f1c7f7-3157-43d1-b78b-2bbd2bb171d7" />


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
