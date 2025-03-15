# Attendance Management System

This is an **Attendance Management System** built using **Next.js**, **TypeScript**, and **Supabase**. The system is designed with enhanced security where direct signup is not allowed; only admins can manually add users. Users can submit screenshots for check-in, check-out, and their work progress with descriptions. Admins can efficiently track and filter attendance records.

## Features

✅ Admin-only user registration for added security.  
✅ Users can submit screenshots for:
- Check-in
- Check-out
- Work progress with descriptions  
✅ Admin panel for viewing and filtering records based on:
- Employee name
- Date of work  
✅ Uses **Supabase** for database management and secure API integration.

## Tech Stack

- **Next.js** (Framework)
- **TypeScript** (Strongly typed codebase)
- **Supabase** (Database & Auth)
- **Tailwind CSS** (Styling)

## Folder Structure

```
.
├── app
│   ├── admin              # Admin-specific pages
│   ├── dashboard          # Dashboard UI components
│   ├── globals.css        # Global styling
│   ├── layout.tsx         # Layout structure
│   └── page.tsx           # Main page logic
│
├── components             # Reusable UI components
├── hooks                  # Custom React hooks
├── lib                    # Utility functions
├── supabase               # Supabase integration logic
├── .env                   # Environment variables
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── .gitignore             # Files to exclude from Git
```

## Environment Variables
Create a `.env` file in the root directory and add the following:

```
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
```

## Setup Instructions

1. **Clone the repository:**
```bash
git clone <repository_url>
cd <project_name>
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
```

3. **Add environment variables:**
Ensure your `.env` file contains the required Supabase keys.

4. **Run the development server:**
```bash
npm run dev
# or
yarn dev
```

5. **Access the application:**
```
http://localhost:3000
```

## Admin Panel
- Admins can filter records by **Employee Name** and **Date**.  
- Screenshots and descriptions are available for detailed insights into employee activities.

## Future Improvements
🔹 Implement email notifications for successful check-in/out.  
🔹 Add role-based access controls for better security.  
🔹 Improve UI for a more intuitive experience.

## Contribution Guidelines
Contributions are welcome! If you'd like to improve the project, please fork the repository and submit a pull request. Ensure you follow best practices for Next.js and TypeScript.

## License
This project is licensed under the **MIT License**.

---

If you face any issues, feel free to raise an issue in the repository. 🚀
