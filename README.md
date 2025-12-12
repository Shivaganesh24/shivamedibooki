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
- **Generative AI**: A custom Python pipeline integrating **MobileNetV2** for advanced image analysis and **BioBERT** for deep understanding of medical text.
- **Deployment**: **Firebase App Hosting** for continuous deployment and scalable, secure hosting.
