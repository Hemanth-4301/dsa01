import React from "react";
import { motion } from "framer-motion";
import { Mail, Github, Twitter, Linkedin } from "lucide-react";

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="px-2 sm:px-4 py-4 sm:py-6 max-w-6xl mx-auto"
    >
      {/* About Section */}
      <motion.section className="mb-6 sm:mb-8" variants={itemVariants}>
        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60">
          <motion.h1
            className="text-3xl text-center sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            dsa01
          </motion.h1>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <p className="text-sm sm:text-base leading-relaxed">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  dsa01
                </span>{" "}
                is a comprehensive learning platform dedicated to helping
                students to practice and learn Data Structures and Algorithms.
                We provide a curated collection of problems, organized by topic
                and difficulty, to help you build your problem-solving skills
                systematically.
              </p>

              <p className="text-sm sm:text-base leading-relaxed">
                Whether you're preparing for technical interviews, competitive
                programming, or simply want to improve your algorithmic
                thinking, our platform offers the resources you need to succeed.
                With detailed explanations, multiple approaches, and an active
                community, we're here to support your learning journey.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section variants={itemVariants}>
        <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-indigo-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-indigo-200/60 dark:border-indigo-700/60">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-4 sm:mb-6 text-center">
              Contact Us
            </h2>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Get in Touch
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-3">
                    Have questions or feedback? We'd love to hear from you!
                  </p>

                  <div className="inline-flex items-center justify-center px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-700/50">
                    <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2" />
                    <a
                      href="mailto:dsa014301@gmail.com"
                      className="text-sm sm:text-base text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                    >
                      dsa014301@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default About;
