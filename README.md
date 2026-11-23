# CampusConnect

CampusConnect is a university-focused student portal for academic information and campus communication.

## Features

- Admin and student authentication
- Dashboard with total students, notices, and upcoming events
- Student management and student profiles
- Semester-wise course enrollment and grade management
- Semester-wise GPA and overall CGPA calculation
- Notice board (admin: add, edit, delete; students: view)
- Event management (admin: add, edit, delete; students: view)
- Complaint box (students: submit and track; admin: review and update status)

## Technologies Used

- React
- Vite
- Tailwind CSS
- JavaScript
- Firebase Authentication
- Cloud Firestore

## Installation and Setup

```bash
git clone https://github.com/azmain-abrar/campus.git
cd connect
npm install
```

Create a `.env` file in the project root and add your Firebase configuration. Use `.env.example` as the template.

```bash
npm run dev
```

## Firebase Security

Publish the rules in `firestore.rules` from Firebase Console → Firestore Database → Rules. Set `users/{uid}.role` to `admin` only for trusted administrator accounts. Student accounts must be approved through `allowedEmails/{email}` and verify their email before accessing the portal.

The `.env` file contains local Firebase configuration and should not be uploaded to GitHub.

## Author

**Mohammod Azmain Abrar**

GitHub: [azmain-abrar](https://github.com/azmain-abrar)
