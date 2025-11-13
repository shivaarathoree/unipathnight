'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowRight, CheckCircle, Loader2, 
  Target, Mic, MicOff, Download, Share2,
  Calendar, BookOpen, Code, AlertCircle, Rocket,
  Star, BarChart3, FileText, Clock, RotateCcw,
  Trophy, Award, TrendingUp
} from 'lucide-react';
import { checkDailyLimit, incrementUsageCount, getCurrentUser } from '../../actions/mockInterview';
import jsPDF from 'jspdf';

const DOMAINS = [
  'Software Development',
  'Data Science / AI',
  'UI/UX Design',
  'App Development',
  'Digital Marketing',
  'Cybersecurity',
  'Cloud / DevOps',
  "I'm not sure yet"
];

export default function AIMockInterviewPage() {
  // State management
  const [step, setStep] = useState('domain'); // domain, loading, interview, results
  const [selectedDomain, setSelectedDomain] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState('');
  const [usageLimit, setUsageLimit] = useState({ allowed: true, remaining: 3 });
  const [isLoadingLimit, setIsLoadingLimit] = useState(true);

  // Refs
  const recognitionRef = useRef(null);

  // Check daily limit on mount
  useEffect(() => {
    checkLimit();
  }, []);

  const checkLimit = async () => {
    setIsLoadingLimit(true);
    try {
      const user = getCurrentUser();
      const limit = await checkDailyLimit(user?.uid || null);
      setUsageLimit(limit);
    } catch (error) {
      console.error('Error checking limit:', error);
    } finally {
      setIsLoadingLimit(false);
    }
  };

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(prev => prev + finalTranscript);
        setUserAnswer(prev => prev + finalTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Handle domain selection
  const handleDomainSelect = async (domain) => {
    if (!usageLimit.allowed) {
      setError('You have reached your daily limit of 3 interviews. Please try again tomorrow.');
      return;
    }

    setSelectedDomain(domain);
    setStep('loading');
    setError('');

    try {
      // Increment usage count
      const user = getCurrentUser();
      await incrementUsageCount(user?.uid || null);

      // Generate questions
      const response = await fetch('/api/ai-mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateQuestions',
          domain: domain
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      setQuestions(data.questions);
      setStep('interview');
    } catch (error) {
      console.error('Error generating questions:', error);
      setError('Failed to generate questions. Please try again.');
      setStep('domain');
    }
  };

  // Toggle voice recording
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  // Submit answer and get evaluation
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      setError('Please provide an answer before submitting.');
      return;
    }

    setIsEvaluating(true);
    setError('');

    try {
      const currentQuestion = questions[currentQuestionIndex];
      
      const response = await fetch('/api/ai-mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluateAnswer',
          domain: selectedDomain,
          question: currentQuestion.text,
          userAnswer: userAnswer,
          questionId: currentQuestion.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to evaluate answer');
      }

      // Store evaluation
      const newEvaluation = {
        question: currentQuestion.text,
        userAnswer: userAnswer,
        ...data.evaluation
      };

      setEvaluations(prev => [...prev, newEvaluation]);

      // Move to next question or results
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setUserAnswer('');
        setTranscript('');
      } else {
        setStep('results');
      }
    } catch (error) {
      console.error('Error evaluating answer:', error);
      setError('Failed to evaluate answer. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Skip to next question
  const handleSkipQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      setTranscript('');
    } else {
      setStep('results');
    }
  };

  // Generate PDF report
  const generatePDFReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('AI Mock Interview Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Domain
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Domain: ${selectedDomain}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 15;

    // Summary
    const totalScore = evaluations.reduce((sum, e) => sum + e.score, 0);
    const avgScore = (totalScore / evaluations.length).toFixed(1);
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Score: ${totalScore}/50`, margin, yPosition);
    yPosition += 8;
    doc.text(`Average Score: ${avgScore}/10`, margin, yPosition);
    yPosition += 15;

    // Questions and evaluations
    evaluations.forEach((evaluation, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`Question ${index + 1}:`, margin, yPosition);
      yPosition += 7;

      doc.setFont(undefined, 'normal');
      const questionLines = doc.splitTextToSize(evaluation.question, pageWidth - 2 * margin);
      doc.text(questionLines, margin, yPosition);
      yPosition += questionLines.length * 6 + 5;

      doc.setFont(undefined, 'bold');
      doc.text('Your Answer:', margin, yPosition);
      yPosition += 7;

      doc.setFont(undefined, 'normal');
      const answerLines = doc.splitTextToSize(evaluation.userAnswer, pageWidth - 2 * margin);
      doc.text(answerLines, margin, yPosition);
      yPosition += answerLines.length * 6 + 5;

      doc.setFont(undefined, 'bold');
      doc.text(`Score: ${evaluation.score}/10`, margin, yPosition);
      yPosition += 7;

      doc.text('Feedback:', margin, yPosition);
      yPosition += 7;

      doc.setFont(undefined, 'normal');
      const feedbackLines = doc.splitTextToSize(evaluation.feedback, pageWidth - 2 * margin);
      doc.text(feedbackLines, margin, yPosition);
      yPosition += feedbackLines.length * 6 + 5;

      doc.setFont(undefined, 'bold');
      doc.text('Ideal Answer:', margin, yPosition);
      yPosition += 7;

      doc.setFont(undefined, 'normal');
      const idealLines = doc.splitTextToSize(evaluation.idealAnswer, pageWidth - 2 * margin);
      doc.text(idealLines, margin, yPosition);
      yPosition += idealLines.length * 6 + 15;
    });

    doc.save(`AI-Mock-Interview-${selectedDomain}-${Date.now()}.pdf`);
  };

  // Reset interview
  const resetInterview = async () => {
    setStep('domain');
    setSelectedDomain('');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setTranscript('');
    setEvaluations([]);
    setError('');
    await checkLimit();
  };

  // Render loading screen
  if (isLoadingLimit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Render domain selection
  if (step === 'domain') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Sparkles className="w-10 h-10" />
              AI Mock Interview
            </h1>
            <p className="text-gray-300 text-lg">
              Practice interviews with AI-powered questions and instant feedback
            </p>
            <div className="mt-4 text-sm text-gray-400">
              Sessions remaining today: <span className="text-blue-400 font-semibold">{usageLimit.remaining}/3</span>
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500 text-red-400 px-6 py-4 rounded-lg mb-8 max-w-2xl mx-auto"
            >
              {error}
            </motion.div>
          )}

          {!usageLimit.allowed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-500/10 border border-yellow-500 text-yellow-400 px-6 py-4 rounded-lg mb-8 max-w-2xl mx-auto"
            >
              You've reached your daily limit of 3 interviews. Please come back tomorrow!
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
          >
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              Select Your Domain
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DOMAINS.map((domain) => (
                <motion.button
                  key={domain}
                  onClick={() => handleDomainSelect(domain)}
                  disabled={!usageLimit.allowed}
                  className="bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
                  whileHover={{ scale: usageLimit.allowed ? 1.05 : 1 }}
                  whileTap={{ scale: usageLimit.allowed ? 0.95 : 1 }}
                >
                  {domain}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Render loading state
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-20 h-20 text-blue-500 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Generating Your Interview...
          </h2>
          <p className="text-gray-400 text-lg">
            Creating personalized questions for your domain
          </p>
        </motion.div>
      </div>
    );
  }

  // Render interview
  if (step === 'interview') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              ></motion.div>
            </div>
          </div>

          {/* Question card */}
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 mb-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Answer input */}
            <div className="space-y-4">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here or use voice recording..."
                className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />

              {/* Voice recording section */}
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={toggleRecording}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      Start Recording
                    </>
                  )}
                </motion.button>

                {transcript && (
                  <div className="text-sm text-gray-300">
                    Live transcript: {transcript}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Action buttons */}
          <div className="flex gap-4 justify-between">
            <motion.button
              onClick={handleSkipQuestion}
              className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Skip Question
            </motion.button>

            <div className="flex gap-4">
              <motion.button
                onClick={resetInterview}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-4 h-4" />
                Restart
              </motion.button>

              <motion.button
                onClick={handleSubmitAnswer}
                disabled={isEvaluating || !userAnswer.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                whileHover={{ scale: isEvaluating || !userAnswer.trim() ? 1 : 1.05 }}
                whileTap={{ scale: isEvaluating || !userAnswer.trim() ? 1 : 0.95 }}
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    Submit Answer
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-red-500/10 border border-red-500 text-red-400 px-6 py-4 rounded-lg"
            >
              {error}
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Render results
  if (step === 'results') {
    const totalScore = evaluations.reduce((sum, evalItem) => sum + evalItem.score, 0);
    const averageScore = (totalScore / evaluations.length).toFixed(1);
    const maxScore = evaluations.length * 10;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Trophy className="w-12 h-12 text-yellow-400" />
              Interview Complete! 🎉
            </h1>
            <p className="text-xl text-gray-500 mb-6">
              Here's your performance summary for {selectedDomain}
            </p>
          </motion.div>

          {/* Score summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-400">{totalScore}/{maxScore}</div>
                <div className="text-gray-400">Total Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">{averageScore}/10</div>
                <div className="text-gray-400">Average Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">{evaluations.length}</div>
                <div className="text-gray-400">Questions Answered</div>
              </div>
            </div>
          </motion.div>

          {/* Detailed evaluations */}
          <div className="space-y-6 mb-8">
            {evaluations.map((evaluation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    Question {index + 1}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    evaluation.score >= 8 ? 'bg-green-500/20 text-green-400' :
                    evaluation.score >= 6 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {evaluation.score}/10
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-gray-400 text-sm font-medium mb-2">Question:</h4>
                    <p className="text-white">{evaluation.question}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-gray-400 text-sm font-medium mb-2">Your Answer:</h4>
                    <p className="text-gray-300 bg-gray-700/50 p-3 rounded-lg">{evaluation.userAnswer}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-gray-400 text-sm font-medium mb-2">Feedback:</h4>
                    <p className="text-gray-300">{evaluation.feedback}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-gray-400 text-sm font-medium mb-2">Ideal Answer:</h4>
                    <p className="text-gray-300 bg-green-500/10 p-3 rounded-lg border border-green-500/20">{evaluation.idealAnswer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2"
              onClick={generatePDFReport}
            >
              <Download className="w-5 h-5" />
              Download PDF Report
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all flex items-center gap-2"
              onClick={resetInterview}
            >
              <RotateCcw className="w-5 h-5" />
              Start New Interview
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all flex items-center gap-2"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'My AI Mock Interview Results',
                    text: `I scored ${totalScore}/${maxScore} on my ${selectedDomain} mock interview!`,
                    url: window.location.href
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
            >
              <Share2 className="w-5 h-5" />
              Share Results
            </motion.button>
          </motion.div>

          {/* Performance insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6" />
              Performance Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {evaluations.filter(e => e.score >= 8).map((evaluation, index) => (
                    <li key={index} className="text-gray-300 flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                      Strong answer for: "{evaluation.question.substring(0, 50)}..."
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Areas for Improvement</h3>
                <ul className="space-y-2">
                  {evaluations.filter(e => e.score < 7).map((evaluation, index) => (
                    <li key={index} className="text-gray-300 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                      Review: "{evaluation.question.substring(0, 50)}..."
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}