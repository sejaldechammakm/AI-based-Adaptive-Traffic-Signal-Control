import { motion } from "framer-motion";
import React from "react";

const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      {/* Background Animation - Circles */}
      <div className="absolute inset-0 z-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.1, 0],
              scale: [0, 1, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              delay: i * 2,
              ease: "linear",
            }}
            className="absolute bg-blue-500 rounded-full mix-blend-screen"
            style={{
              width: `${50 + i * 30}px`,
              height: `${50 + i * 30}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        {/* Header Section */}
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
        >
          Adaptive Traffic Signal Control
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-center max-w-3xl mb-12"
        >
          AI-Powered Signal Optimization for Smarter Cities
        </motion.p>

        {/* Project Overview */}
        <section className="mb-16 max-w-4xl">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-4xl font-semibold mb-6 text-center"
          >
            Project Overview
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg leading-relaxed text-center"
          >
            This project revolutionizes urban mobility by replacing outdated fixed-timer traffic lights with an intelligent Reinforcement Learning (RL) agent. The AI dynamically observes real-time traffic conditions and makes optimal decisions to minimize vehicle wait times, reduce congestion, and prevent gridlock, leading to smoother, more efficient city traffic flow.
          </motion.p>
        </section>

        {/* How it Helps */}
        <section className="mb-16 max-w-4xl">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-4xl font-semibold mb-6 text-center"
          >
            How This Project Helps
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-3 text-blue-300">Reduced Congestion</h3>
              <p className="text-md">
                By intelligently adjusting signal timings, the RL agent prevents bottlenecks and keeps traffic moving, significantly cutting down on daily commute times.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-3 text-purple-300">Lower Emissions</h3>
              <p className="text-md">
                Less idling means less fuel consumption and a substantial reduction in harmful vehicle emissions, contributing to cleaner urban air.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-3 text-green-300">Improved Commutes</h3>
              <p className="text-md">
                Drivers experience smoother, less frustrating journeys, enhancing overall quality of life in bustling city environments.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              className="bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-3 text-yellow-300">Scalable Solution</h3>
              <p className="text-md">
                The AI model can be adapted and expanded to manage multiple intersections and more complex urban traffic networks.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Real-World Uses */}
        <section className="mb-16 max-w-4xl">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="text-4xl font-semibold mb-6 text-center"
          >
            Real-World Applications
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 2.0 }}
            className="text-lg leading-relaxed text-center"
          >
            Beyond simulations, this technology can be deployed in smart city initiatives to dynamically manage traffic flow, respond to unforeseen events like accidents or major events, and optimize public transportation routes. It forms a crucial component of future intelligent transportation systems.
          </motion.p>
        </section>

        {/* Tech Stack */}
        <section className="mb-16 max-w-4xl">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 2.2 }}
            className="text-4xl font-semibold mb-6 text-center"
          >
            Technology Stack
          </motion.h2>
          <div className="flex flex-wrap justify-center gap-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.4 }}
              className="bg-gray-800 p-4 rounded-lg shadow-md text-center"
            >
              <h3 className="text-xl font-bold text-red-400">SUMO</h3>
              <p className="text-sm">Traffic Simulation</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.6 }}
              className="bg-gray-800 p-4 rounded-lg shadow-md text-center"
            >
              <h3 className="text-xl font-bold text-yellow-400">Python</h3>
              <p className="text-sm">Backend & AI Logic</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.8 }}
              className="bg-gray-800 p-4 rounded-lg shadow-md text-center"
            >
              <h3 className="text-xl font-bold text-green-400">FastAPI</h3>
              <p className="text-sm">API & WebSockets</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3.0 }}
              className="bg-gray-800 p-4 rounded-lg shadow-md text-center"
            >
              <h3 className="text-xl font-bold text-blue-400">React.js</h3>
              <p className="text-sm">Interactive Frontend</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3.2 }}
              className="bg-gray-800 p-4 rounded-lg shadow-md text-center"
            >
              <h3 className="text-xl font-bold text-indigo-400">Reinforcement Learning</h3>
              <p className="text-sm">Intelligent Decision Making</p>
            </motion.div>
          </div>
        </section>

        {/* Call to Action or Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 3.4 }}
          className="text-center mt-12"
        >
          <p className="text-lg">Experience the future of urban traffic management.</p>
          <a
            href="/login" // Link to the login page
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105"
          >
            Get Started
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
