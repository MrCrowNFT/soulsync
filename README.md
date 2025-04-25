# Soulsync

<p align="center">
  <img src="frontend/public/mental-health-icon.svg" alt="SoulSync Logo" width="100" />
</p>

**Soulsync** is a mental health and wellness AI-powered app designed to give users a supportive conversational companion available 24/7. Built with a Node.js + Express backend and a React + TypeScript frontend, it integrates sentiment analysis, NLP, and OpenAI's API to provide warm, emotionally intelligent responses.

---

## Description

Soulsync offers a unique chat experience that combines real-time sentiment analysis and memory-based context retrieval to generate thoughtful, personalized responses. The app also includes a **mood tracker** that helps users reflect on their emotional wellbeing over time (daily, weekly, monthly).

> "Everyone deserves someone to talk to—especially during hard times. Soulsync is your always-available, emotionally aware companion."

### Tech Stack

- **Backend:** Node.js, Express, MongoDB
- **Frontend:** React (Vite) with TypeScript, TailwindCSS
- **AI Integration:** OpenAI API (GPT), Compromise NLP, Sentiment Analysis
- **Hosting:** Render (backend), Vercel (frontend)

---

## Quick Start

1. **Clone the repository:**

```bash
git clone https://github.com/MrCrowNFT/soulsync
cd soulsync
```

2. **Install dependencies:**

```bash
cd backend && npm install
cd ../frontend && npm install
```

3. **Set up environment variables:**
   Create `.env` files in both `/backend` and `/frontend`. See `.env.example` for required variables.

4. **Start development servers:**

```bash
# From root directory
cd backend && npm run dev
cd ../frontend && npm run dev
```

---

## Usage

- Sign up and start chatting.
- The AI companion uses past conversations and inferred personality to tailor responses.
- Track mood trends with the integrated mood journal.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## TODO

- [ ] Write technical documentation
- [ ] Add unit + integration testing with Jest
- [ ] Dockerize backend and frontend
- [ ] Add CI/CD pipelines (GitHub Actions or similar)
- [ ] Add the footer links
- [ ] Add More tests
- [ ] Logout button

---

## Future Updates

- File uploads (cloud storage support)
- AI-powered user assessments
- RAG (Retrieval-Augmented Generation) for more informed responses
- Panic mode: If user presses an alert button, chat sends a specialized prompt to LLM for immediate support response

---

## 📷 Demo / Screenshots

_Coming soon: Add AI-generated homepage illustrations and demo walkthrough video links here._

---

## 📄 License

MIT
