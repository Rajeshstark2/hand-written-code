#!/bin/bash

# Exit on error
set -e

echo "Starting build process..."

# Install system dependencies
echo "Installing system dependencies..."
apt-get update
apt-get install -y tesseract-ocr
apt-get install -y libtesseract-dev
apt-get install -y tesseract-ocr-eng

# Verify Tesseract installation
echo "Verifying Tesseract installation..."
tesseract --version

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Build completed successfully!" 