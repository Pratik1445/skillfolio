import React from 'react';
import { motion } from 'framer-motion';
import { Upload, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center max-w-3xl mx-auto">
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900"
          >
            Showcase Your Work to
            <br />
            <span className="text-blue-600">The World</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 text-lg leading-8 text-gray-600"
          >
            Upload your portfolio and connect with professionals worldwide
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/upload">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full bg-black px-8 py-3 text-white shadow-lg hover:bg-gray-800 transition flex items-center gap-2 w-full sm:w-auto"
              >
                <Upload className="h-5 w-5" />
                Upload Portfolio
              </motion.button>
            </Link>
            <Link to="/portfolios">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full bg-white px-8 py-3 text-gray-900 shadow-lg hover:bg-gray-50 transition flex items-center gap-2 border border-gray-200 w-full sm:w-auto"
              >
                Browse Portfolios
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              title: "Easy Upload",
              description: "Drag and drop your portfolio files in PDF or DOC format",
              icon: "📄"
            },
            {
              title: "Get Discovered",
              description: "Showcase your work to potential clients and employers",
              icon: "🔍"
            },
            {
              title: "Connect",
              description: "Network with professionals and grow your career",
              icon: "🤝"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-2xl shadow-lg text-center"
            >
              <span className="text-4xl mb-4 block">{feature.icon}</span>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}