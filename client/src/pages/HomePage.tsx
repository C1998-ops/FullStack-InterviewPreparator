import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  const techStack = [
    "React",
    "TypeScript",
    "Node.js",
    "System Design",
    "Algorithms",
    "CSS",
    "HTML",
    "MongoDB",
    "Redux",
    "GraphQL",
    "Next.js",
    "Docker",
    "AWS",
  ];
  return (
    <div className="h-full min-h-full bg-gray-50 flex flex-col font-sans min-w-full">
      {/* Hero Section */}
      <div className="relative bg-linear-to-r from-indigo-600 via-purple-600 to-blue-600 text-white overflow-hidden w-full min-h-[50vh] sm:min-h-[60vh] md:min-h-[65vh] flex items-center justify-center">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 pb-20 sm:pb-32 md:pb-48 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 md:mb-8 leading-tight drop-shadow-sm">
            Master Your <span className="text-yellow-300">JavaScript</span>{" "}
            Interview
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 md:mb-12 text-indigo-100 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-sm px-2">
            The ultimate open-source collection of interview questions,
            algorithms, and system design problems to help you land your dream
            job.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center">
            <Link
              to="/browse/documents"
              className="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-white text-indigo-600 rounded-full font-bold text-base sm:text-lg md:text-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3"
            >
              <span>🚀</span> Start Learning
            </Link>
            <Link
              to="/resume-assistant"
              className="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-indigo-500 bg-opacity-20 border-2 border-white border-opacity-30 text-white rounded-full font-bold text-base sm:text-lg md:text-xl hover:bg-opacity-30 backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3"
            >
              <span>📄</span> Resume Assistant
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 -ml-20 -mt-20 w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-white opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-blue-400 opacity-10 blur-3xl"></div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20 -mt-8 sm:-mt-12 md:-mt-16 mb-8 sm:mb-12 md:mb-16 lg:mb-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
          {/* Feature 1 */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1 sm:hover:-translate-y-2 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-indigo-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300">
              📚
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-indigo-600 transition-colors">
              Curated Questions
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Over 200+ hand-picked questions covering React, Node.js, System
              Design, and Algorithms, organized for efficient learning.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1 sm:hover:-translate-y-2 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-purple-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300">
              🤖
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-purple-600 transition-colors">
              AI Resume Analyzer
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Get instant, intelligent feedback on your resume. Our AI analyzes
              your CV against industry standards to improve your shortlist
              chances.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1 sm:hover:-translate-y-2 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300">
              ⚡
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors">
              Smart Search
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Don't waste time scrolling. Instantly find the exact topic,
              concept, or question you need with our powerful search
              functionality.
            </p>
          </div>
        </div>
      </div>

      {/* Topics Preview */}
      <div className="bg-slate-950 py-8 sm:py-12 md:py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-indigo-500 font-bold mb-6 sm:mb-8 md:mb-10 tracking-tighter text-2xl sm:text-3xl md:text-4xl">
            Master the Modern Stack
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="group relative inline-block px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-slate-900 border border-slate-800 rounded-lg sm:rounded-xl text-slate-300 text-xs sm:text-sm font-semibold transition-all duration-300 hover:border-indigo-500 hover:text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
