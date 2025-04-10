# Handwritten Code Extractor

A web application that extracts code from handwritten images, detects the programming language, and allows users to edit and execute the code online.

## Features

- Upload images of handwritten code
- Extract code using AI-powered OCR (Tesseract + OpenCV)
- Automatic programming language detection
- Syntax-highlighted code editor (Monaco Editor)
- Online code execution (Judge0 API)
- Dark mode support
- Mobile-responsive design

## Tech Stack

- **Frontend:**
  - React.js
  - Tailwind CSS
  - Monaco Editor
  - React Icons

- **Backend:**
  - FastAPI (Python)
  - Tesseract OCR
  - OpenCV
  - Judge0 API

## Prerequisites

1. Python 3.8 or higher
2. Node.js 14 or higher
3. Tesseract OCR installed on your system
4. Judge0 API key (get it from RapidAPI)

## Installation

### Backend Setup

1. Install Tesseract OCR:
   - Windows: Download and install from [Tesseract GitHub](https://github.com/UB-Mannheim/tesseract/wiki)
   - Linux: `sudo apt-get install tesseract-ocr`
   - macOS: `brew install tesseract`

2. Create and activate a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   venv\Scripts\activate     # Windows
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory:
   ```
   JUDGE0_API_KEY=your_judge0_api_key_here
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Click the upload button or drag and drop an image of handwritten code
2. The application will extract the code and detect its programming language
3. Edit the code in the Monaco editor if needed
4. Click "Run" to execute the code and see the output
5. Use the "Copy" button to copy the code to your clipboard

## API Endpoints

- `POST /extract-code/`: Extract code from an uploaded image
- `POST /detect-language/`: Detect programming language
- `POST /execute-code/`: Execute code using Judge0 API

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Acknowledgments

- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)
- [Judge0 API](https://rapidapi.com/judge0-official/api/judge0-ce)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Tailwind CSS](https://tailwindcss.com/) #   c o d e  
 #   c o d e  
 #   c o d e  
 #   c o d e  
 