from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pytesseract
import cv2
import numpy as np
from PIL import Image
import io
import os
from dotenv import load_dotenv
import requests
import json
from typing import Optional
import platform

# Load environment variables
load_dotenv()

# Configure Judge0 API
JUDGE0_API_KEY = os.getenv("JUDGE0_API_KEY")
JUDGE0_API_HOST = os.getenv("JUDGE0_API_HOST", "judge0-ce.p.rapidapi.com")
JUDGE0_API_URL = f"https://{JUDGE0_API_HOST}"

# Initialize FastAPI app
app = FastAPI(
    title="Handwritten Code Extractor API",
    description="API for extracting and executing handwritten code from images"
)

# Configure CORS with environment-based origins
origins = [
    "http://localhost:3000",  # Local development
    "https://hand-written-code.onrender.com",  # Production URL
    "http://localhost:8000",  # Local backend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Configure Tesseract path based on OS
if platform.system() == 'Windows':
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
else:
    # On Linux, assume tesseract is installed in the system path
    pytesseract.pytesseract.tesseract_cmd = 'tesseract'

class CodeRequest(BaseModel):
    code: str
    language: str

class LanguageRequest(BaseModel):
    code: str

def preprocess_image(image: np.ndarray) -> np.ndarray:
    """Preprocess the image for better OCR results."""
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply thresholding to get black and white image
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Remove noise
    denoised = cv2.fastNlMeansDenoising(binary)
    
    return denoised

@app.post("/extract-code/")
async def extract_code(file: UploadFile = File(...)):
    """Extract code from an uploaded image using OCR."""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="File must be an image"
            )

        # Read and preprocess the image
        contents = await file.read()
        if not contents:
            raise HTTPException(
                status_code=400,
                detail="Empty file"
            )

        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            raise HTTPException(
                status_code=400,
                detail="Invalid image format"
            )

        processed_image = preprocess_image(image)
        
        # Convert to PIL Image for Tesseract
        pil_image = Image.fromarray(processed_image)
        
        try:
            # Extract text using Tesseract
            text = pytesseract.image_to_string(pil_image)
            if not text.strip():
                raise HTTPException(
                    status_code=400,
                    detail="No text could be extracted from the image"
                )
            return {"text": text.strip()}
        except Exception as e:
            print(f"OCR Error: {str(e)}")  # Log the error
            raise HTTPException(
                status_code=500,
                detail=f"OCR processing failed: {str(e)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"General Error: {str(e)}")  # Log the error
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )

@app.post("/detect-language/")
async def detect_language(request: LanguageRequest):
    """Detect the programming language of the code."""
    try:
        # Simple language detection based on keywords and syntax
        code = request.code.lower()
        
        if "def " in code or "import " in code or "print(" in code:
            return {"language": "python"}
        elif "public class" in code or "System.out.println" in code:
            return {"language": "java"}
        elif "function" in code or "console.log" in code:
            return {"language": "javascript"}
        elif "#include" in code or "int main" in code:
            return {"language": "cpp"}
        else:
            return {"language": "plaintext"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/execute-code/")
async def execute_code(request: CodeRequest):
    """Execute code using Judge0 API."""
    if not JUDGE0_API_KEY:
        raise HTTPException(status_code=500, detail="Judge0 API key not configured")
    
    # Map our language names to Judge0 language IDs
    language_map = {
        "python": 71,    # Python (3.8.1)
        "javascript": 63,  # JavaScript (Node.js 12.14.0)
        "java": 62,       # Java (OpenJDK 13.0.1)
        "cpp": 54,        # C++ (GCC 9.2.0)
    }
    
    language_id = language_map.get(request.language.lower())
    if not language_id:
        raise HTTPException(status_code=400, detail="Unsupported language")
    
    try:
        # Submit code for execution
        headers = {
            "content-type": "application/json",
            "X-RapidAPI-Key": JUDGE0_API_KEY,
            "X-RapidAPI-Host": JUDGE0_API_HOST
        }
        
        submission = {
            "language_id": language_id,
            "source_code": request.code,
            "stdin": "",
            "wait": True  # Wait for the result
        }
        
        # Create submission and wait for result
        try:
            # First, check if the API is accessible
            health_check = requests.get(
                f"{JUDGE0_API_URL}/about",
                headers=headers,
                timeout=5
            )
            if health_check.status_code != 200:
                raise HTTPException(
                    status_code=503,
                    detail="Judge0 API is not available at the moment"
                )
            
            # Submit the code
            response = requests.post(
                f"{JUDGE0_API_URL}/submissions?wait=true",
                json=submission,
                headers=headers,
                timeout=30  # Set a timeout of 30 seconds
            )
            
            if response.status_code != 200:
                error_detail = response.json() if response.text else "No error details available"
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Judge0 API error: {error_detail}"
                )
            
            data = response.json()
            
            # Extract relevant information
            stdout = data.get("stdout", "")
            stderr = data.get("stderr", "")
            compile_output = data.get("compile_output", "")
            status = data.get("status", {})
            
            # Check for compilation errors
            if status.get("id") == 6:  # Compilation Error
                return {
                    "output": compile_output or "Compilation Error",
                    "status": "error",
                    "error_type": "compilation"
                }
            
            # Check for runtime errors
            if status.get("id") in [7, 8, 9, 10, 11, 12]:  # Runtime Errors
                return {
                    "output": stderr or stdout or "Runtime Error",
                    "status": "error",
                    "error_type": "runtime"
                }
            
            # Return successful output
            return {
                "output": stdout or "No output",
                "status": "success",
                "error": stderr if stderr else None
            }
            
        except requests.Timeout:
            raise HTTPException(
                status_code=504,
                detail="Code execution timed out"
            )
        except requests.RequestException as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error communicating with Judge0 API: {str(e)}"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
