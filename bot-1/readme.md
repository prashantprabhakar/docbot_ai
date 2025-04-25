# 🧠 Wikipedia Q&A CLI Chatbot (with Ollama + Streaming)

A lightweight CLI chatbot that answers questions based on the content of any Wikipedia page using **Ollama** and **local LLMs** like Mistral or LLaMA. We can provide a URL and bot can answer questions from content based on the URL. It passes the website content as context to LLM

---

## 🚀 Features

- ✅ Scrapes and summarizes content from any Wikipedia page.
- 💬 Asks questions in a conversational loop.
- 🔁 Streams answers in real-time.
- ⚡ Fast and runs locally (no OpenAI API key needed).

---

## 📦 Requirements

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Ollama](https://ollama.com/) installed and running

---

## 🧠 Setup Ollama

1. **Install Ollama:**

   - macOS:  
     ```sh
     brew install ollama
     ```

   - Windows / Linux:  
     Download from https://ollama.com

 2. **Pull a local model:**
    ```sh
    ollama pull mistral
    ```

3. **Start Ollama (if not auto-running):**

   ```sh
   ollama run mistral
   ```
   

    
## Setup project

1. **Install depedendencies**
   ```sh
    npm install
    ```
 
 2. **Run the bot**
    ```sh
    node index.js <any wiki url> // e.g,: node index.js  https://en.wikipedia.org/wiki/Nikola_Tesla
    ```
 3. **Ask questions and enjoy**