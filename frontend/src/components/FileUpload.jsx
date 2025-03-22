import React, { useState, useRef } from 'react';
import { FiUpload } from 'react-icons/fi';

const FileUpload = ({ onFileSelect, maxSize = 10, acceptedFileTypes = ['.png', '.jpg', '.jpeg', '.webp'] }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndUpload(files[0]);
    }
  };

  const validateAndUpload = (file) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size should not exceed ${maxSize}MB`);
      return;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(fileExtension)) {
      alert(`Accepted file types are: ${acceptedFileTypes.join(', ')}`);
      return;
    }

    onFileSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndUpload(files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 ${
          isDragging
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 bg-gray-50'
        } transition-colors duration-200 ease-in-out`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileInput}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 rounded-full bg-purple-100">
            <FiUpload size={32} color="#8B5CF6" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">
              Drop your files here,{' '}
              <span className="text-purple-500 hover:underline cursor-pointer">
                or click to browse
              </span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supported files: {acceptedFileTypes.join(', ')}
            </p>
            <p className="text-sm text-gray-500">
              Maximum size: {maxSize}MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload; 