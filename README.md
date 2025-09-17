# LostLink - The Smart Lost & Found Network


## 1. Project Description

**LostLink** is a modern, full-stack web application designed to create a community-powered network for lost and found items. The core purpose of this project is to leverage technology to efficiently connect individuals who have lost personal belongings with those who have found them.

The system features a "Smart Matching Algorithm" that intelligently compares newly reported items against the existing database. It calculates a "Match Score" based on multiple factors, including **item category, textual keywords (title/description), geographical location (latitude/longitude), and visual similarity using Perceptual Hashing (pHash) for images.** This automated process helps users quickly identify potential matches and facilitates a secure communication channel to arrange the recovery of their items.

The application is built with a clear separation between the **User Side** (for public reporting and management) and a powerful **Admin Side** (for platform moderation and oversight).

---

## 2. Key Features & Screenshots

### User-Side Functionality

| Feature | Description | Screenshot |
| :--- | :--- | :--- |
| **Professional Homepage** | A clean, modern landing page that explains the platform's value and guides new users to sign up. |*[Your Screenshot of the User Dashboard Here]* |
| **Secure Authentication** | Separate, beautifully designed pages for user Sign Up and Sign In. | **[Your Screenshot of the User Dashboard Here]** |
| **User Dashboard** | A central hub for users to get an overview of their activity, including stats on reported items and recent notifications. | *[Your Screenshot of the User Dashboard Here]* |
| **Item Reporting** | An intuitive modal form to report lost or found items, featuring an interactive location picker (powered by LocationIQ) and image upload functionality. | *[Your Screenshot of the "Report Item" Modal Here]* |
| **Item Management** | A card-based view for users to manage their own reported items, complete with live search, filtering (by category/status), and pagination. | *[Your Screenshot of the "My Lost Items" Page Here]* |
| **Smart Matches Page** | A unified interface with tabs for "Lost Item Matches" and "Found Item Matches," showing potential matches with a similarity score. | *[Your Screenshot of the "Matches" Page Here]* |
| **Secure Contact Flow** | A multi-step process to send, receive, accept, and decline contact requests, ensuring user privacy is maintained until consent is given. | *[Your Screenshot of an Accepted Match Card Here]* |

### Admin-Side Functionality

| Feature | Description | Screenshot |
| :--- | :--- | :--- |
| **Admin Dashboard** | A data-centric dashboard providing a high-level overview of the platform's statistics, such as total users and items. | *[Your Screenshot of the Admin Dashboard Here]* |
| **User & Content Management**| Tables to view and manage all users and all item reports across the platform, with options to suspend users or delete inappropriate posts. | *[Your Screenshot of the Admin "User Management" or "Item Management" Table Here]* |

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
