import React, { useState, useEffect } from 'react';
import ProgressAnimation, { CircularProgress, AnimatedCounter } from './ProgressAnimation';
import AchievementSystem from './AchievementSystem';
import RealTimeStats from './RealTimeStats';

const InteractiveDashboard = ({ userStats = {}, onAchievementUnlocked, userRole, userProvince }) => {
   const [currentTime, setCurrentTime] = useState(new Date());
   const [motivationalMessage, setMotivationalMessage] = useState('');
   const [showConfetti, setShowConfetti] = useState(false);

   // Update time every second
   useEffect(() => {
      const timer = setInterval(() => {
         setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(timer);
   }, []);

   useEffect(() => {
      const motivationalMessages = [
         "You're doing great! Keep up the excellent work!",
         "Every application you process makes a difference!",
         "Your efficiency is helping the community grow!",
         "Amazing progress today! You're on fire!",
         "Your attention to detail is impressive!",
         "Keep pushing forward - you're making a real impact!"
      ];
      
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      setMotivationalMessage(randomMessage);
   }, [userStats.totalEnrollments]);

   const handleAchievementUnlocked = (achievement) => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      onAchievementUnlocked && onAchievementUnlocked(achievement);
   };


   const getGreeting = () => {
      const hour = currentTime.getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 18) return "Good Afternoon";
      return "Good Evening";
   };

   const getProductivityLevel = () => {
      const today = userStats.todayProcessed || 0;
      if (today >= 10) return { level: "Excellent", color: "green", emoji: "🏆" };
      if (today >= 5) return { level: "Great", color: "blue", emoji: "⭐" };
      if (today >= 2) return { level: "Good", color: "yellow", emoji: "👍" };
      return { level: "Getting Started", color: "gray", emoji: "🌱" };
   };

   const productivity = getProductivityLevel();

   return (
      <div className="space-y-6">
         {/* Confetti Effect */}
         {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-50">
               {[...Array(50)].map((_, i) => (
                  <div
                     key={i}
                     className="absolute animate-bounce"
                     style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random() * 2}s`
                     }}
                  >
                     {['🎉', '🎊', '⭐', '✨', '🌟'][Math.floor(Math.random() * 5)]}
                  </div>
               ))}
            </div>
         )}

         {/* Welcome Header */}
         <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-2xl font-bold mb-2">
                     {getGreeting()}! Welcome back! 👋
                  </h1>
                  <p className="text-blue-100">{motivationalMessage}</p>
               </div>
               <div className="text-right">
                  <div className="text-sm text-blue-100">Current Time</div>
                  <div className="text-xl font-mono">
                     {currentTime.toLocaleTimeString()}
                  </div>
               </div>
            </div>
         </div>

         {/* Quick Stats with Animations */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
               <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">📊</div>
                  <div className="text-right">
                     <div className="text-2xl font-bold text-blue-600">
                        <AnimatedCounter value={userStats.totalEnrollments || 0} />
                     </div>
                     <div className="text-sm text-gray-600">Total Applications</div>
                  </div>
               </div>
               <ProgressAnimation
                  current={userStats.totalEnrollments || 0}
                  total={100}
                  label="Monthly Goal"
                  color="blue"
               />
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
               <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">✅</div>
                  <div className="text-right">
                     <div className="text-2xl font-bold text-green-600">
                        <AnimatedCounter value={userStats.approvedApplications || 0} />
                     </div>
                     <div className="text-sm text-gray-600">Approved Today</div>
                  </div>
               </div>
               <ProgressAnimation
                  current={userStats.approvedApplications || 0}
                  total={20}
                  label="Daily Target"
                  color="green"
               />
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
               <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">⏱️</div>
                  <div className="text-right">
                     <div className="text-2xl font-bold text-purple-600">
                        <AnimatedCounter value={userStats.avgProcessingTime || 0} suffix="min" />
                     </div>
                     <div className="text-sm text-gray-600">Avg. Processing</div>
                  </div>
               </div>
               <div className="text-center">
                  <CircularProgress
                     current={userStats.avgProcessingTime || 0}
                     total={60}
                     color="purple"
                     size={80}
                  />
               </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
               <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">{productivity.emoji}</div>
                  <div className="text-right">
                     <div className={`text-2xl font-bold text-${productivity.color}-600`}>
                        {productivity.level}
                     </div>
                     <div className="text-sm text-gray-600">Productivity</div>
                  </div>
               </div>
               <div className="text-center">
                  <CircularProgress
                     current={userStats.todayProcessed || 0}
                     total={10}
                     color={productivity.color}
                     size={80}
                  />
               </div>
            </div>
         </div>

         {/* Real-Time Statistics */}
         <RealTimeStats 
            userRole={userRole} 
            userProvince={userProvince} 
         />

         {/* Achievement System */}
         <AchievementSystem
            userStats={userStats}
            onAchievementUnlocked={handleAchievementUnlocked}
         />

         {/* Interactive Elements */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Challenge */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  🎯 Daily Challenge
               </h3>
               <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                     <h4 className="font-medium text-gray-900 mb-2">Process 5 Applications</h4>
                     <ProgressAnimation
                        current={userStats.todayProcessed || 0}
                        total={5}
                        label="Progress"
                        color="orange"
                     />
                  </div>
                  <div className="bg-white rounded-lg p-4">
                     <h4 className="font-medium text-gray-900 mb-2">Maintain 90% Accuracy</h4>
                     <ProgressAnimation
                        current={userStats.accuracyRate || 0}
                        total={100}
                        label="Accuracy"
                        color="green"
                     />
                  </div>
               </div>
            </div>

            {/* Fun Facts */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  💡 Fun Facts
               </h3>
               <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3">
                     <div className="text-sm text-gray-600">You've helped</div>
                     <div className="text-xl font-bold text-green-600">
                        <AnimatedCounter value={userStats.communitiesHelped || 0} />
                     </div>
                     <div className="text-sm text-gray-600">communities this month!</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                     <div className="text-sm text-gray-600">Time saved</div>
                     <div className="text-xl font-bold text-blue-600">
                        <AnimatedCounter value={userStats.timeSaved || 0} suffix=" hours" />
                     </div>
                     <div className="text-sm text-gray-600">through efficient processing!</div>
                  </div>
               </div>
            </div>
         </div>

         {/* Motivational Quote */}
         <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">💪</div>
            <blockquote className="text-lg italic text-gray-700 mb-2">
               "The best way to find out if you can trust somebody is to trust them."
            </blockquote>
            <cite className="text-sm text-gray-500">- Ernest Hemingway</cite>
         </div>
      </div>
   );
};

export default InteractiveDashboard;
