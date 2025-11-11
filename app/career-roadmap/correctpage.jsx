"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, ArrowRight, CheckCircle, Loader2, 
  Target, GraduationCap, TrendingUp, Clock, 
  Briefcase, Globe, AlertCircle, Rocket,
  Calendar, BookOpen, Code, Download, Share2
} from "lucide-react";

const QUESTIONS = [
  {
    id: 1,
    question: "What career field excites you the most?",
    field: "careerField",
    icon: Target,
    options: [
      "Software Development",
      "Data Science / AI",
      "UI/UX Design",
      "App Development",
      "Digital Marketing",
      "Cybersecurity",
      "Cloud / DevOps",
      "I'm not sure yet"
    ]
  },
  {
    id: 2,
    question: "Which year of college are you in (or select 'graduate')?",
    field: "educationYear",
    icon: GraduationCap,
    options: [
      "1st Year",
      "2nd Year",
      "3rd Year",
      "4th Year",
      "Graduated / Job Seeker"
    ]
  },
  {
    id: 3,
    question: "What is your current skill level in your chosen field?",
    field: "skillLevel",
    icon: TrendingUp,
    options: [
      "Beginner (just starting)",
      "Intermediate (some experience)",
      "Advanced (ready for projects/interviews)"
    ]
  },
  {
    id: 4,
    question: "How much time can you give per week to career learning?",
    field: "timeCommitment",
    icon: Clock,
    options: [
      "Less than 5 hours",
      "5–10 hours",
      "10–20 hours",
      "20+ hours"
    ]
  },
  {
    id: 5,
    question: "What type of career goal are you targeting?",
    field: "careerGoal",
    icon: Briefcase,
    options: [
      "Internship",
      "Full-time job",
      "Freelancing",
      "Startup / Entrepreneurship",
      "I'm exploring"
    ]
  },
  {
    id: 6,
    question: "Do you already have a LinkedIn or portfolio website?",
    field: "hasPortfolio",
    icon: Globe,
    options: [
      "Yes",
      "No"
    ]
  },
  {
    id: 7,
    question: "What's your biggest challenge right now?",
    field: "biggestChallenge",
    icon: AlertCircle,
    options: [
      "I don't know where to start",
      "I learn but can't stay consistent",
      "I'm confused about what to build",
      "I need help with interviews / resume",
      "I lack confidence"
    ]
  },
  {
    id: 8,
    question: "Would you like Unipath AI to create a personalized 6-month career plan for you?",
    field: "confirmation",
    icon: Rocket,
    options: [
      "Yes, I'm ready!",
      "Not now"
    ]
  }
];

export default function CareerRoadmapPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [generating, setGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState(null);

  const handleAnswer = async (answer) => {
    const question = QUESTIONS[currentQuestion];
    const newAnswers = { ...answers, [question.field]: answer };
    setAnswers(newAnswers);

    if (currentQuestion === QUESTIONS.length - 1 && answer === "Not now") {
      window.location.href = "/";
      return;
    }

    if (currentQuestion === QUESTIONS.length - 1 && answer === "Yes, I'm ready!") {
      await generateRoadmap(newAnswers);
      return;
    }

    setTimeout(() => {
      setCurrentQuestion(prev => prev + 1);
    }, 300);
  };

  const generateRoadmap = async (finalAnswers) => {
    setGenerating(true);
    setError(null);

    try {
      console.log("📤 Sending answers:", finalAnswers);

      const response = await fetch("/api/career-roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalAnswers),
      });

      const data = await response.json();
      console.log("📥 Received response:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate roadmap");
      }

      setRoadmap(data.roadmap);
      setCurrentQuestion(QUESTIONS.length);

    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const progressPercentage = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  if (generating) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-20 h-20 text-[#FFD700] mx-auto mb-6" />
          </motion.div>
          <h2 className="text-3xl font-bold text-[#FFD700] mb-4">
            Creating Your Personalized Roadmap...
          </h2>
          <p className="text-gray-400 text-lg mb-6">
            Our AI is analyzing your answers and crafting a custom 6-month plan
          </p>
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-[#FFD700] rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (roadmap) {
    return <RoadmapDisplay roadmap={roadmap} answers={answers} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#FFD700] mb-4 flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10" />
            AI Career Path Builder
          </h1>
          <p className="text-gray-400 text-lg">
            Get Your Personalized 6-Month Career Roadmap — Crafted by AI
          </p>
        </motion.div>

        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-[#FFD700] to-[#FFA500]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
            style={{ boxShadow: "0 0 20px #FFD700" }}
          />
        </div>
        <p className="text-center text-gray-500 text-sm">
          Question {currentQuestion + 1} of {QUESTIONS.length}
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {currentQuestion < QUESTIONS.length && (
            <QuestionCard
              key={currentQuestion}
              question={QUESTIONS[currentQuestion]}
              onAnswer={handleAnswer}
              selectedAnswer={answers[QUESTIONS[currentQuestion].field]}
            />
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-red-900/20 border border-red-500/50 rounded-xl text-center"
          >
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-500 mb-2">Error</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setCurrentQuestion(0);
                setAnswers({});
              }}
              className="px-6 py-3 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFA500] transition-all"
            >
              Start Over
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({ question, onAnswer, selectedAnswer }) {
  const Icon = question.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-8 md:p-12 border border-[#FFD700]/20"
      style={{ boxShadow: "0 0 40px rgba(255, 215, 0, 0.1)" }}
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-[#FFD700]/10 rounded-xl">
          <Icon className="w-8 h-8 text-[#FFD700]" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#FFD700]">
          {question.question}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => onAnswer(option)}
            className="group relative p-6 bg-[#0A0A0A] border-2 border-[#FFD700]/30 rounded-xl text-left hover:border-[#FFD700] hover:bg-[#FFD700]/5 transition-all duration-300"
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255, 215, 0, 0.3)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-300 group-hover:text-[#FFD700] transition-colors text-lg">
                {option}
              </span>
              <ArrowRight className="w-5 h-5 text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {selectedAnswer === option && (
              <CheckCircle className="absolute top-4 right-4 w-6 h-6 text-[#FFD700]" />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function RoadmapDisplay({ roadmap, answers }) {
  const [selectedMonth, setSelectedMonth] = useState(0);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-[#FFD700] mb-4 flex items-center justify-center gap-3">
            <Rocket className="w-12 h-12" />
            Your Personalized Career Roadmap
          </h1>
          <p className="text-xl text-gray-400 mb-6">
            {roadmap.careerField} | 6-Month Plan
          </p>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-300 leading-relaxed">
              {roadmap.overallStrategy}
            </p>
          </div>
        </motion.div>

        <div className="mb-12 overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max justify-center">
            {roadmap.monthlyPlan?.map((month, index) => (
              <motion.button
                key={index}
                onClick={() => setSelectedMonth(index)}
                className={`px-6 py-4 rounded-xl font-bold transition-all ${
                  selectedMonth === index
                    ? "bg-[#FFD700] text-black"
                    : "bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Calendar className="w-5 h-5 mx-auto mb-2" />
                Month {month.month}
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {roadmap.monthlyPlan?.[selectedMonth] && (
            <motion.div
              key={selectedMonth}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MonthCard month={roadmap.monthlyPlan[selectedMonth]} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <SectionCard
            title="Resume Tips"
            icon={BookOpen}
            items={roadmap.resumeTips || []}
            color="#FFD700"
          />
          <SectionCard
            title="LinkedIn Strategy"
            icon={Globe}
            items={roadmap.linkedInStrategy || []}
            color="#0077B5"
          />
        </div>

        {roadmap.interviewPrep && (
          <div className="mt-8 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-8 border border-[#FFD700]/20">
            <h2 className="text-3xl font-bold text-[#FFD700] mb-6 flex items-center gap-3">
              <Code className="w-8 h-8" />
              Interview Preparation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-xl font-bold text-[#FFD700] mb-4">Technical Topics</h3>
                <ul className="space-y-2">
                  {roadmap.interviewPrep.technicalTopics?.map((topic, i) => (
                    <li key={i} className="text-gray-300 flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-1" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#FFD700] mb-4">Common Questions</h3>
                <ul className="space-y-2">
                  {roadmap.interviewPrep.commonQuestions?.map((q, i) => (
                    <li key={i} className="text-gray-300 text-sm">{q}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#FFD700] mb-4">Practice Resources</h3>
                <ul className="space-y-2">
                  {roadmap.interviewPrep.practiceResources?.map((r, i) => (
                    <li key={i} className="text-gray-300">{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {roadmap.motivationalGuidance && (
          <div className="mt-8 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-8 border border-[#FFD700]/20">
            <h2 className="text-3xl font-bold text-[#FFD700] mb-6">
              🎯 Personalized Motivation & Tips
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-300 mb-3">Addressing Your Challenge:</h3>
                <p className="text-gray-400 leading-relaxed">
                  {roadmap.motivationalGuidance.addressingChallenge}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-300 mb-3">Consistency Tips:</h3>
                <ul className="space-y-2">
                  {roadmap.motivationalGuidance.consistencyTips?.map((tip, i) => (
                    <li key={i} className="text-gray-400 flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-1" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-300 mb-3">Mindset Advice:</h3>
                <p className="text-gray-400 leading-relaxed">
                  {roadmap.motivationalGuidance.mindsetAdvice}
                </p>
              </div>
            </div>
          </div>
        )}

        {roadmap.keyMilestones && (
          <div className="mt-8 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-8 border border-[#FFD700]/20">
            <h2 className="text-3xl font-bold text-[#FFD700] mb-6">🎯 Key Milestones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roadmap.keyMilestones.map((milestone, i) => (
                <div key={i} className="p-4 bg-[#0A0A0A] rounded-xl border border-[#FFD700]/20">
                  <p className="text-gray-300">{milestone}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {roadmap.successMetrics && (
          <div className="mt-8 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-8 border border-[#FFD700]/20">
            <h2 className="text-3xl font-bold text-[#FFD700] mb-6">📊 Success Metrics</h2>
            <ul className="space-y-3">
              {roadmap.successMetrics.map((metric, i) => (
                <li key={i} className="text-gray-300 flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-1" />
                  {metric}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-12 flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-[#FFD700] text-black font-bold rounded-xl hover:bg-[#FFA500] transition-all flex items-center gap-2"
            onClick={() => window.print()}
          >
            <Download className="w-5 h-5" />
            Download Roadmap
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-[#1a1a1a] text-[#FFD700] font-bold rounded-xl hover:bg-[#2a2a2a] transition-all flex items-center gap-2 border border-[#FFD700]/30"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'My Career Roadmap',
                  text: 'Check out my personalized career roadmap!',
                  url: window.location.href
                });
              }
            }}
          >
            <Share2 className="w-5 h-5" />
            Share
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function MonthCard({ month }) {
  return (
    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-8 border border-[#FFD700]/20">
      <h2 className="text-3xl font-bold text-[#FFD700] mb-2">{month.title}</h2>
      <p className="text-gray-400 text-lg mb-6">{month.focus}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#FFD700] mb-4 flex items-center gap-2">
            <Code className="w-5 h-5" />
            Skills to Learn
          </h3>
          <ul className="space-y-2">
            {month.skills?.map((skill, i) => (
              <li key={i} className="text-gray-300 flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-1" />
                {skill}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-bold text-[#FFD700] mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Learning Resources
          </h3>
          <ul className="space-y-2">
            {month.learningResources?.map((resource, i) => (
              <li key={i} className="text-gray-300">
                <span className="font-semibold">{resource.name}</span>
                <span className="text-gray-500 text-sm"> ({resource.type})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#FFD700] mb-4">📌 Projects</h3>
        <ul className="space-y-2">
          {month.projects?.map((project, i) => (
            <li key={i} className="text-gray-300 flex items-start gap-2">
              <Rocket className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-1" />
              {project}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#FFD700] mb-4">📅 Weekly Tasks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {month.weeklyTasks?.map((task, i) => (
            <div key={i} className="p-3 bg-[#0A0A0A] rounded-lg border border-[#FFD700]/20">
              <p className="text-gray-300 text-sm">{task}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-[#FFD700] mb-4">🎯 Milestones</h3>
        <ul className="space-y-2">
          {month.milestones?.map((milestone, i) => (
            <li key={i} className="text-gray-300 flex items-start gap-2">
              <Target className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-1" />
              {milestone}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, items, color }) {
  return (
    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-8 border border-[#FFD700]/20">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color }}>
        <Icon className="w-7 h-7" />
        {title}
      </h2>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="text-gray-300 flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-1" style={{ color }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
