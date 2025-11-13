"use client";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/FirebaseProvider";

import {
  Upload,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Download,
  Share2,
  Zap,
  Info,
} from "lucide-react";

export default function ResumeAnalyzer() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [usageInfo, setUsageInfo] = useState(null);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  // Get user ID for localStorage key
  const getUsageKey = () => {
    return user ? `resumeAnalyzerUsage_${user.uid}` : null;
  };

  // Initialize or reset usage info
  const initializeUsageInfo = () => {
    const usageKey = getUsageKey();
    if (!usageKey) return null;

    const now = new Date().toISOString();
    const initialUsage = {
      used: 0,
      limit: 1,
      remaining: 1,
      hasReachedLimit: false,
      lastReset: now,
      nextReset: new Date(new Date(now).getTime() + 24 * 60 * 60 * 1000).toISOString()
    };

    localStorage.setItem(usageKey, JSON.stringify(initialUsage));
    return initialUsage;
  };

  // Check if 24 hours have passed since last reset
  const checkIfResetNeeded = (usageData) => {
    const now = new Date();
    const lastReset = new Date(usageData.lastReset);
    const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);
    
    return hoursSinceReset >= 24;
  };

  // Get current usage info from localStorage
  const getCurrentUsageInfo = () => {
    const usageKey = getUsageKey();
    if (!usageKey) return null;

    const storedUsage = localStorage.getItem(usageKey);
    
    if (!storedUsage) {
      return initializeUsageInfo();
    }

    let usageData = JSON.parse(storedUsage);
    
    // Check if we need to reset
    if (checkIfResetNeeded(usageData)) {
      return initializeUsageInfo();
    }

    return usageData;
  };

  // Update usage info in localStorage
  const updateUsageInfo = (increment = false) => {
    const usageKey = getUsageKey();
    if (!usageKey) return null;

    let usageData = getCurrentUsageInfo();
    if (!usageData) {
      usageData = initializeUsageInfo();
    }

    if (increment) {
      usageData.used += 1;
      usageData.remaining = Math.max(0, usageData.limit - usageData.used);
      usageData.hasReachedLimit = usageData.used >= usageData.limit;
    }

    localStorage.setItem(usageKey, JSON.stringify(usageData));
    setUsageInfo(usageData);
    return usageData;
  };

  // Fetch usage info when component mounts or user changes
  useEffect(() => {
    if (user) {
      const usageData = getCurrentUsageInfo();
      setUsageInfo(usageData);
    }
  }, [user]);

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !analysisData) return;

    const opt = {
      margin: 0.5,
      filename: `Resume_Analysis_Report_${new Date().toLocaleDateString('en-US').replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#000000' },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf().set(opt).from(reportRef.current).save();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (uploadedFile) => {
    // Check usage limit first
    if (usageInfo && usageInfo.hasReachedLimit) {
      const nextReset = new Date(usageInfo.nextReset);
      const hoursUntilReset = Math.ceil((nextReset - new Date()) / (1000 * 60 * 60));
      setError(`You've reached your daily limit of 1 resume analysis. You can analyze another in ${hoursUntilReset} hours.`);
      return;
    }

    setFile(uploadedFile);
    setAnalyzing(true);
    setProgress(0);
    setAnalysisData(null); // Reset previous data
    setAnalyzed(false);
    setError(null);

    let progressInterval = null;

    try {
      console.log("📤 Starting file upload:", uploadedFile.name);

      const formData = new FormData();
      formData.append("file", uploadedFile);

      progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      console.log("🌐 Fetching /api/analyze...");
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (progressInterval) clearInterval(progressInterval);

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const data = await response.json();
      console.log("📦 Full response data:", data);

      if (!data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      const resultData = data.result;
      console.log("✅ Analysis result:", resultData);

      // Update usage info after successful analysis
      updateUsageInfo(true); // increment = true

      setProgress(100);
      setAnalysisData(resultData); // ✅ FIXED: Store the data
      
      setTimeout(() => {
        setAnalyzing(false);
        setAnalyzed(true);
        console.log("✅ UI updated with data:", resultData);
      }, 300);

    } catch (error) {
      console.error("❌ Error analyzing resume:", error);
      if (progressInterval) clearInterval(progressInterval);
      setAnalyzing(false);
      setAnalysisData(null);
      setError(`Error: ${error.message}`);
      setFile(null);
    }
  };

  const CircularProgress = ({ value, size = 180 }) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1a1a1a"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#00ff88"
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-white">{value}</span>
          <span className="text-sm text-gray-400">/ 100</span>
        </div>
      </div>
    );
  };

  const ScoreCard = ({ title, score, icon: Icon }) => {
    const getColor = (score) => {
      if (score >= 85) return "#00ff88";
      if (score >= 70) return "#ffaa00";
      return "#ff4444";
    };

    return (
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6 rounded-xl border border-[#2a2a2a]">
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-6 h-6 text-[#00ff88]" />
          <span className="text-2xl font-bold text-white">{score}%</span>
        </div>
        <h3 className="text-sm text-gray-400 mb-2">{title}</h3>
        <div className="w-full bg-[#0f0f0f] rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${score}%`,
              backgroundColor: getColor(score),
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-8 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 text-white">
            AI Resume Analyzer
          </h1>
          <p className="text-xl text-gray-400 max-w-6xl mx-auto mb-8">
            Get actionable insights to optimize your resume for applicant tracking systems and hiring managers in seconds.
          </p>
        </div>

        {/* Usage Limit Display - Minimal Premium UI */}
        {usageInfo && (
          <div className="bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f] rounded-xl p-4 border border-[#00ff88]/30 mb-8 max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#00ff88]" />
                <span className="text-sm text-gray-400">Daily Limit</span>
              </div>
              <div className="text-right">
                {usageInfo.hasReachedLimit ? (
                  <div className="text-red-400 text-sm">
                    Limit reached - Reset in {Math.ceil((new Date(usageInfo.nextReset) - new Date()) / (1000 * 60 * 60))}h
                  </div>
                ) : (
                  <div className="text-[#00ff88] font-medium">
                    {usageInfo.remaining} of {usageInfo.limit} remaining
                  </div>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
              <div 
                className="bg-gradient-to-r from-[#00ff88] to-[#00cc66] h-1.5 rounded-full" 
                style={{ width: `${(usageInfo.used / usageInfo.limit) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 mb-6 text-center">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setFile(null);
              }}
              className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Two-column layout for upload section */}
        {!file && !analyzing && !analyzed && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left column - Description */}
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-6 text-white">Professional Resume Analysis</h2>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-[#00ff88] mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-400">ATS compatibility scoring</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-[#00ff88] mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-400">Content quality assessment</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-[#00ff88] mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-400">Keyword optimization suggestions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-[#00ff88] mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-400">Format and design recommendations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-[#00ff88] mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-400">Personalized improvement tips</span>
                </li>
              </ul>
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#2a2a2a]">
                <h3 className="text-xl font-bold mb-3 text-white">How It Works</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-400">
                  <li>Upload your resume in PDF, DOC, or DOCX format</li>
                  <li>Our AI analyzes your resume in seconds</li>
                  <li>Receive a detailed report with scores and suggestions</li>
                  <li>Implement improvements and re-upload for better results</li>
                </ol>
              </div>
            </div>

            {/* Right column - Upload area */}
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
                dragActive
                  ? "border-[#00ff88] bg-white/10 scale-105"
                  : "border-[#2a2a2a] hover:border-[#00ff88]/50 bg-white/5"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) =>
                  e.target.files[0] && handleFile(e.target.files[0])
                }
                className="hidden"
                id="file-upload"
              />
              <Upload
                className="w-16 h-16 mx-auto mb-6 text-white"
              />
              <h2 className="text-2xl font-bold mb-2 text-white">Drop your resume here</h2>
              <p className="text-gray-400 mb-6">
                or click anywhere to browse (PDF, DOC, DOCX)
              </p>
              <div className="inline-block px-8 py-4 bg-white text-black font-bold rounded-lg">
                Select File
              </div>
              <p className="text-gray-500 text-sm mt-4">
                Supported formats: PDF, DOC, DOCX
              </p>
            </div>
          </div>
        )}

        {/* Analyzing Section */}
        {file && analyzing && (
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-12 border border-[#2a2a2a]">
            <div className="text-center mb-8">
              <FileText className="w-16 h-16 mx-auto mb-4 text-[#00ff88] animate-pulse" />
              <h2 className="text-2xl font-bold mb-2">{file.name}</h2>
              <p className="text-gray-400">Analyzing your resume...</p>
            </div>
            <div className="max-w-md mx-auto">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Progress</span>
                <span className="text-sm font-bold text-[#00ff88]">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-[#0f0f0f] rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00ff88] to-[#00ffcc] rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analyzed && analysisData && (
          <div className="space-y-8">
            {/* PDF Report Container */}
            <div ref={reportRef} className="space-y-8">
            {/* File Info and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6 rounded-xl border border-[#2a2a2a]">
                <FileText className="w-8 h-8 text-[#00ff88] mb-3" />
                <h3 className="text-sm text-gray-400 mb-1">File Name</h3>
                <p className="text-white font-semibold truncate">
                  {file?.name || "Resume"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6 rounded-xl border border-[#2a2a2a]">
                <TrendingUp className="w-8 h-8 text-[#00ff88] mb-3" />
                <h3 className="text-sm text-gray-400 mb-1">Word Count</h3>
                <p className="text-white font-semibold text-2xl">
                  {analysisData.wordCount || 487}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6 rounded-xl border border-[#2a2a2a]">
                <FileText className="w-8 h-8 text-[#00ff88] mb-3" />
                <h3 className="text-sm text-gray-400 mb-1">Page Length</h3>
                <p className="text-white font-semibold text-2xl">
                  {analysisData.pageCount || 2} Pages
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6 rounded-xl border border-[#2a2a2a]">
                <Upload className="w-8 h-8 text-[#00ff88] mb-3" />
                <h3 className="text-sm text-gray-400 mb-1">File Size</h3>
                <p className="text-white font-semibold text-2xl">
                  {file ? Math.round(file.size / 1024) : 245} KB
                </p>
              </div>
            </div>

            {/* Overall Score and Section Scores */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl border border-[#2a2a2a] p-8 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-6">Overall Score</h2>
                <CircularProgress value={analysisData.overallScore || 85} />
                <p className="text-gray-400 mt-6 text-center">
                  Your resume is performing well with room for improvement
                </p>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ScoreCard
                  title="Content Quality"
                  score={analysisData.contentScore || 90}
                  icon={CheckCircle}
                />
                <ScoreCard
                  title="Format & Design"
                  score={analysisData.formatScore || 80}
                  icon={FileText}
                />
                <ScoreCard
                  title="Keyword Match"
                  score={analysisData.keywordScore || 85}
                  icon={TrendingUp}
                />
                <ScoreCard
                  title="ATS Compatibility"
                  score={analysisData.atsScore || 88}
                  icon={Zap}
                />
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl border border-[#2a2a2a] p-8">
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <AlertCircle className="w-8 h-8 mr-3 text-[#00ff88]" />
                Recommendations
              </h2>
              <div className="space-y-4">
                {(analysisData.recommendations || [
                  "Add more quantifiable achievements with metrics and numbers",
                  "Include industry-specific keywords for your target role",
                  "Improve formatting consistency in the experience section",
                  "Add a skills section with relevant technical competencies",
                  "Optimize for ATS by using standard section headings",
                  "Consider reducing resume to one page for better readability",
                ]).map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start space-x-4 p-4 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]"
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-2 bg-[#00ff88]"
                    />
                    <p className="text-gray-300">
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            </div>
            {/* End PDF Report Container */}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center space-x-2 px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all"
              >
                <Download className="w-5 h-5" />
                <span>Download Report</span>
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setAnalyzed(false);
                  setAnalysisData(null);
                  setError(null);
                }}
                className="flex items-center space-x-2 px-8 py-4 bg-[#1a1a1a] text-white font-bold rounded-lg border border-[#2a2a2a] hover:border-[#00ff88] transition-all"
              >
                <Upload className="w-5 h-5" />
                <span>Analyze Another</span>
              </button>
              <button className="flex items-center space-x-2 px-8 py-4 bg-[#1a1a1a] text-white font-bold rounded-lg border border-[#2a2a2a] hover:border-[#00ff88] transition-all">
                <Share2 className="w-5 h-5" />
                <span>Share Analysis</span>
              </button>
            </div>

            {/* Debug Info */}
            <details className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">
              <summary className="text-gray-400 cursor-pointer hover:text-[#00ff88]">
                🔍 Debug: View Raw Analysis Data
              </summary>
              <pre className="text-xs text-gray-500 mt-4 overflow-auto max-h-96 p-4 bg-black rounded">
                {JSON.stringify(analysisData, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Show warning if analyzed but no data */}
        {analyzed && !analysisData && (
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-xl font-bold text-yellow-500 mb-2">
              No Analysis Data Received
            </h3>
            <p className="text-gray-400 mb-4">
              The analysis completed but no data was returned. Check the console
              for details.
            </p>
            <button
              onClick={() => {
                setFile(null);
                setAnalyzed(false);
                setAnalysisData(null);
              }}
              className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}