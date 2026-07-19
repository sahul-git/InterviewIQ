# InterviewIQ

InterviewIQ is an AI-powered MERN stack web application that analyzes a candidate's resume, job description, and self-description to generate a comprehensive interview readiness report. It helps users understand their strengths, identify skill gaps, and prepare effectively for interviews.

## Features

- Upload Resume (PDF)
- Enter Job Description
- Enter Self Description
- AI-generated Interview Report
- Resume and Job Description Analysis
- Candidate Strengths and Weaknesses
- Technical Skills Assessment
- Suggested Improvements
- Overall Interview Readiness Score
- Responsive User Interface

---

## Tech Stack

### Frontend
- React.js
- Vite
- SCSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Multer
- Google Gemini API

---

## Project Structure

```
InterviewIQ/
│
├── Backend/
│   ├── src/
│   ├── server.js
│   ├── package.json
│  
│
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/sahul-git/InterviewIQ.git
cd InterviewIQ
```

---

## Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file inside the Backend folder.

Example:

```env
PORT=3000

MONGODB_URI=your_mongodb_connection_string

GEMINI_API_KEY=your_google_gemini_api_key
```

Start the backend:

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

The application will run at:

```
http://localhost:5173
```

---

## How It Works

1. Upload your Resume (PDF)
2. Enter the Job Description
3. Enter your Self Description
4. Click **Generate Report**
5. InterviewIQ analyzes all inputs using Google's Gemini AI
6. View your personalized interview readiness report

---

## AI Generated Report Includes

- Resume Analysis
- Skill Match Percentage
- Strengths
- Weaknesses
- Missing Skills
- Technical Evaluation
- Communication Assessment
- Suggested Improvements
- Overall Interview Readiness Score

---

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push to your branch.
5. Open a Pull Request.

---

## Author

**Sahul Kumar**

GitHub: https://github.com/sahul-git
