import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CodeEditor from './components/CodeEditor';
import FileUpload from './components/FileUpload';
import { FiCopy, FiPlay, FiCode, FiUpload, FiCpu, FiCheckCircle, FiAward, FiGithub, FiMenu, FiX, FiCoffee, FiHeart, FiBookOpen } from 'react-icons/fi';

function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Animation on mount
  useEffect(() => {
    document.querySelector('.hero-content').classList.add('animate-fade-in');
    const features = document.querySelectorAll('.feature-card');
    features.forEach((feature, index) => {
      setTimeout(() => {
        feature.classList.add('animate-entrance');
      }, index * 200);
    });
  }, []);

  const handleImageUpload = async (file) => {
    setLoading(true);
    setError(null);
    setShowSuccess(false);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/extract-code/', formData);
      setCode(response.data.text);
      
      // Detect language with animation
      const langResponse = await axios.post('http://localhost:8000/detect-language/', {
        code: response.data.text
      });
      setLanguage(langResponse.data.language);
      
      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error:', error);
      setError('Error processing image: ' + (error.response?.data?.detail || error.message));
      document.querySelector('.error-message')?.classList.add('error-shake');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to run');
      return;
    }

    setLoading(true);
    setError(null);
    setOutput('');

    try {
      const response = await axios.post('http://localhost:8000/execute-code/', {
        code,
        language
      });

      if (response.data.status === 'error') {
        if (response.data.error_type === 'compilation') {
          setError('Compilation Error: ' + response.data.output);
        } else if (response.data.error_type === 'runtime') {
          setError('Runtime Error: ' + response.data.output);
        } else {
          setError('Error: ' + response.data.output);
        }
      } else {
        setOutput(response.data.output);
        if (response.data.error) {
          setError('Warning: ' + response.data.error);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error executing code: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      // Optional: Show a temporary success message
      const tempError = error;
      setError('Code copied to clipboard!');
      setTimeout(() => setError(tempError), 2000);
    } catch (err) {
      setError('Failed to copy code to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 relative overflow-hidden flex flex-col">
      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex justify-end p-4">
          <button onClick={() => setIsMenuOpen(false)} className="text-white">
            <FiX size={24} />
          </button>
        </div>
        <nav className="flex flex-col items-center space-y-6 p-8">
          <a href="#features" className="text-white text-lg hover:text-purple-300 transition-colors">Features</a>
          <a href="#docs" className="text-white text-lg hover:text-purple-300 transition-colors">Documentation</a>
          <a href="https://github.com" className="text-white text-lg hover:text-purple-300 transition-colors">GitHub</a>
        </nav>
      </div>

      {/* Header */}
      <header className="relative z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              <FiCode size={32} className="text-white animate-pulse-glow" />
              <span className="text-white font-bold text-xl md:text-2xl">HandCode</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-white hover:text-purple-300 transition-colors">Features</a>
              <a href="#docs" className="text-white hover:text-purple-300 transition-colors">Documentation</a>
              <a href="https://github.com" className="flex items-center space-x-2 text-white hover:text-purple-300 transition-colors">
                <FiGithub size={20} />
                <span>GitHub</span>
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden text-white hover:text-purple-300 transition-colors"
            >
              <FiMenu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-indigo-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-12 hero-content">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white hover-glow mb-4 animate-fade-in">
              Transform Handwritten Code
            </h1>
            <p className="text-lg md:text-xl text-purple-100 mb-8 animate-fade-in max-w-2xl mx-auto" style={{ animationDelay: '0.3s' }}>
              Convert your handwritten code into executable programs instantly with AI-powered recognition
            </p>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="feature-card bg-white/10 backdrop-blur-sm rounded-xl p-6 hover-lift">
                <div className="flex items-center justify-center mb-4">
                  <FiUpload size={24} className="text-purple-300 feature-icon" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Upload Image</h3>
                <p className="text-purple-200 text-sm">Upload a clear image of your handwritten code</p>
              </div>
              <div className="feature-card bg-white/10 backdrop-blur-sm rounded-xl p-6 hover-lift">
                <div className="flex items-center justify-center mb-4">
                  <FiCpu size={24} className="text-purple-300 feature-icon" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Auto Detection</h3>
                <p className="text-purple-200 text-sm">Advanced AI detects programming language</p>
              </div>
              <div className="feature-card bg-white/10 backdrop-blur-sm rounded-xl p-6 hover-lift">
                <div className="flex items-center justify-center mb-4">
                  <FiCheckCircle size={24} className="text-purple-300 feature-icon" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Instant Execution</h3>
                <p className="text-purple-200 text-sm">Run and test your code immediately</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
            <FileUpload onFileSelect={handleImageUpload} />
              
              {loading && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-300 border-t-transparent shadow-lg"></div>
                </div>
              )}

              {showSuccess && (
                <div className="success-check bg-green-500/10 backdrop-blur-sm border-l-4 border-green-500 p-4 rounded-lg animate-fade-in">
                  <p className="text-green-200">Successfully processed image!</p>
                </div>
              )}

              {error && (
                <div className="error-message bg-red-500/10 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-red-200">{error}</p>
                </div>
              )}
              
              {code && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden hover-lift">
                    <div className="flex items-center justify-between px-6 py-3 bg-gray-800/50">
                      <span className="text-sm font-medium text-purple-200 flex items-center">
                        <FiAward className="mr-2" />
                        Detected Language: <span className="text-white ml-2">{language}</span>
                      </span>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleCopyCode}
                          className="action-button px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center space-x-2"
                          title="Copy code"
                        >
                          <FiCopy size={18} />
                          <span>Copy</span>
                        </button>
                        <button
                          onClick={handleRunCode}
                          className="action-button px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center space-x-2"
                          title="Run code"
                          disabled={loading}
                        >
                          <FiPlay size={18} />
                          <span>Run</span>
                        </button>
                      </div>
                    </div>
                    
                    <CodeEditor
                      code={code}
                      language={language}
                      onChange={(value) => setCode(value)}
                    />
                  </div>
                  
                  {output && (
                    <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 animate-slide-in hover-lift">
                      <h2 className="text-purple-200 text-sm font-medium mb-3 flex items-center">
                        <FiCheckCircle className="mr-2" /> Output:
                      </h2>
                      <pre className="text-white font-mono text-sm overflow-x-auto whitespace-pre-wrap bg-black/20 p-4 rounded-lg">
                        {output}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-30 border-t border-white/10">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg flex items-center space-x-2">
                <FiBookOpen />
                <span>Documentation</span>
              </h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-purple-200 hover:text-white transition-colors">Getting Started</a></li>
                <li><a href="#" className="text-purple-200 hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="text-purple-200 hover:text-white transition-colors">Examples</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg flex items-center space-x-2">
                <FiCoffee />
                <span>Resources</span>
              </h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-purple-200 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-purple-200 hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="text-purple-200 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg flex items-center space-x-2">
                <FiHeart />
                <span>Connect</span>
              </h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-purple-200 hover:text-white transition-colors">GitHub</a></li>
                <li><a href="#" className="text-purple-200 hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="text-purple-200 hover:text-white transition-colors">Discord</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-purple-200">
              © 2025 Made with stark cloudie <FiHeart className="inline-block text-red-500 animate-pulse" /> cosmo tech developers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;