# VA!Q: Your Personal AI Health Assistant

VA!Q is an intelligent, simplified platform for personal health management, designed to empower users to take control of their health journey. It leverages cutting-edge generative AI to provide preliminary health insights, manage medical data, and connect users with specialists.

## Core Features

- **Smart Triage**: An AI-powered symptom checker that analyzes text, images, and medical reports to provide instant triage recommendations, including severity, suggested actions, and potential conditions. It also features a special **Ayurveda Mode** for alternative insights.
- **AI Report Reader**: Securely upload medical reports (PDFs or images), and our AI will extract and summarize the key findings, making complex documents easy to understand.
- **Appointment Booking**: Seamlessly schedule appointments with specialists. The system can pre-select a doctor based on triage results, simplifying the process.
- **Your Data & Activity**: A secure, centralized dashboard for users to view their past triage results, report analyses, quiz scores, and upcoming appointments. Data can be exported to CSV or PDF.
- **Health Tips & Quizzes**: Access a curated library of health tips and test your knowledge with interactive quizzes on various health topics.
- **Multi-Language Support**: The user interface and AI-generated content are available in English, Hindi, and Kannada.
- **Authentication**: Secure user registration and login using Firebase Authentication (email and password).

## Technology Stack

- **Frontend**: **Next.js (App Router)** & **React** with **TypeScript**.
- **Styling**: **Tailwind CSS** with **ShadCN UI** for a modern, accessible, and aesthetically pleasing component library.
- **Backend & Database**: **Firebase**
  - **Firebase Authentication** for user management.
  - **Firestore** as a scalable NoSQL database for all user data.
- **Generative AI**:
  - **Google's Genkit** as the framework for creating and managing AI flows.
  - **Google's Gemini Models** (including Gemini 2.5 Flash) for powering all intelligent features like triage, report analysis, and text-to-speech.
- **Deployment**: **Firebase App Hosting** for continuous deployment and scalable, secure hosting.

---

## How to Replicate and Set Up the Project

Follow these steps to set up the project from scratch in a new Firebase account.

### Step 1: Set Up Your Firebase Project

1.  **Create a Firebase Project**:
    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Click **"Add project"** and follow the on-screen instructions to create a new project. Give it a memorable name (e.g., `vaiq-clone`).

2.  **Enable Firebase Services**:
    - In your new project's dashboard, go to the **Build** section in the left-hand menu.
    - **Authentication**: Click on **Authentication**, then click **"Get started"**. Select **"Email/Password"** from the list of providers, enable it, and click **Save**.
    - **Firestore Database**: Click on **Firestore Database**, then click **"Create database"**.
      - Start in **production mode**.
      - Choose a Firestore location (e.g., `us-central`).
      - Click **"Enable"**.

3.  **Register Your Web App**:
    - Go to your Project Overview and click the web icon (`</>`) to add a new web app.
    - Give your app a nickname (e.g., "VA!Q Web").
    - **Do NOT** check the box for Firebase Hosting at this stage.
    - Click **"Register app"**.
    - Firebase will generate a configuration object. This is what you'll need for your environment variables.

### Step 2: Configure Environment Variables

1.  **Get Firebase Config**:
    - After registering your app, Firebase will display the `firebaseConfig` object. It looks like this:
      ```javascript
      const firebaseConfig = {
        apiKey: "AIza...",
        authDomain: "your-project-id.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project-id.appspot.com",
        messagingSenderId: "...",
        appId: "1:..."
      };
      ```

2.  **Create `.env` File**:
    - In the root directory of your project, create a new file named `.env`.
    - Copy the values from your `firebaseConfig` object into this file, adding the `NEXT_PUBLIC_` prefix to each key. This makes them accessible in the browser.

    Your `.env` file should look like this:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
    NEXT_PUBLIC_FIREBASE_APP_ID="1:..."
    ```

3.  **Get Gemini API Key**:
    - Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
    - Create an API key.
    - Add this key to your `.env` file:
    ```env
    GEMINI_API_KEY="your-gemini-api-key"
    ```

### Step 3: Set Up Firestore Security Rules

1.  **Open Security Rules**:
    - In the Firebase Console, go to **Firestore Database** -> **Rules** tab.

2.  **Copy and Paste Rules**:
    - Copy the entire content of the `firestore.rules` file from this project.
    - Paste it into the editor in the Firebase Console, completely replacing the default rules.
    - Click **"Publish"**.

### Step 4: Run the Application Locally

1.  **Install Dependencies**:
    - Open your terminal, navigate to the project's root directory, and run:
      ```bash
      npm install
      ```

2.  **Start the Development Servers**:
    - This project requires two development servers to run concurrently: one for the Next.js frontend and one for the Genkit AI flows.
    - **Terminal 1: Start the Next.js App**:
      ```bash
      npm run dev
      ```
      This will typically start your web app on `http://localhost:3000`.

    - **Terminal 2: Start the Genkit Server**:
      ```bash
      npm run genkit:dev
      ```
      This will start the Genkit development server, allowing your frontend to communicate with the AI models.

3.  **Access the Application**:
    - Open your browser and navigate to `http://localhost:3000` (or whatever port Next.js is running on).
    - You should now be able to use the application, create an account, and interact with all the AI-powered features.

That's it! You have successfully replicated the VA!Q project in your own Firebase account.