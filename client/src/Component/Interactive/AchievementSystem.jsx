import React, { useState, useEffect } from 'react';

const AchievementSystem = ({ userStats, onAchievementUnlocked }) => {
   const [achievements, setAchievements] = useState([]);
   const [unlockedAchievements, setUnlockedAchievements] = useState([]);
   const [showCelebration, setShowCelebration] = useState(false);
   const [newAchievement, setNewAchievement] = useState(null);

   // Define achievement criteria
   const achievementDefinitions = [
      {
         id: 'first_enrollment',
         title: 'First Steps',
         description: 'Complete your first enrollment',
         icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
         ),
         condition: (stats) => stats.totalEnrollments >= 1,
         points: 10
      },
      {
         id: 'tna_master',
         title: 'TNA Master',
         description: 'Complete 5 TNA assessments',
         icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
         ),
         condition: (stats) => stats.completedTna >= 5,
         points: 25
      },
      {
         id: 'approval_expert',
         title: 'Approval Expert',
         description: 'Approve 10 applications',
         icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
         ),
         condition: (stats) => stats.approvedApplications >= 10,
         points: 50
      },
      {
         id: 'speed_demon',
         title: 'Speed Demon',
         description: 'Process 3 applications in one day',
         icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
         ),
         condition: (stats) => stats.dailyProcessed >= 3,
         points: 30
      },
      {
         id: 'perfectionist',
         title: 'Perfectionist',
         description: 'Complete 20 applications without rejection',
         icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
         ),
         condition: (stats) => stats.perfectStreak >= 20,
         points: 100
      },
      {
         id: 'team_player',
         title: 'Team Player',
         description: 'Help 5 colleagues with their tasks',
         icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
         ),
         condition: (stats) => stats.helpfulActions >= 5,
         points: 40
      }
   ];

   // Check for new achievements
   useEffect(() => {
      const newUnlocked = [];
      
      achievementDefinitions.forEach(achievement => {
         if (achievement.condition(userStats) && 
             !unlockedAchievements.includes(achievement.id)) {
            newUnlocked.push(achievement);
         }
      });

      if (newUnlocked.length > 0) {
         const latestAchievement = newUnlocked[newUnlocked.length - 1];
         setNewAchievement(latestAchievement);
         setShowCelebration(true);
         setUnlockedAchievements(prev => [...prev, latestAchievement.id]);
         
         // Trigger celebration sound and animation
         playCelebrationSound();
         
         if (onAchievementUnlocked) {
            onAchievementUnlocked(latestAchievement);
         }
      }
   }, [userStats, unlockedAchievements, onAchievementUnlocked]);

   const playCelebrationSound = () => {
      // Create a simple celebration sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
   };

   const closeCelebration = () => {
      setShowCelebration(false);
      setNewAchievement(null);
   };

   const getTotalPoints = () => {
      return unlockedAchievements.reduce((total, achievementId) => {
         const achievement = achievementDefinitions.find(a => a.id === achievementId);
         return total + (achievement ? achievement.points : 0);
      }, 0);
   };

   return (
      <>
         {/* Achievement Celebration Modal */}
         {showCelebration && newAchievement && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <div className="bg-white rounded-lg p-8 max-w-md mx-4 animate-bounce">
                  <div className="text-center">
                     <div className="text-6xl mb-4">🎉</div>
                     <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Achievement Unlocked!
                     </h3>
                     <div className="text-4xl mb-4">{newAchievement.icon}</div>
                     <h4 className="text-xl font-semibold text-blue-600 mb-2">
                        {newAchievement.title}
                     </h4>
                     <p className="text-gray-600 mb-4">
                        {newAchievement.description}
                     </p>
                     <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                        +{newAchievement.points} points
                     </div>
                     <button
                        onClick={closeCelebration}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                     >
                        Awesome!
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Achievement Panel */}
         <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold text-gray-900">
                  🏆 Achievements
               </h3>
               <div className="text-sm text-gray-600">
                  Total Points: <span className="font-bold text-purple-600">{getTotalPoints()}</span>
               </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
               {achievementDefinitions.map(achievement => {
                  const isUnlocked = unlockedAchievements.includes(achievement.id);
                  return (
                     <div
                        key={achievement.id}
                        className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                           isUnlocked
                              ? 'bg-green-50 border-green-300 shadow-md'
                              : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                     >
                        <div className="text-center">
                           <div className={`text-2xl mb-2 ${isUnlocked ? '' : 'grayscale'}`}>
                              {achievement.icon}
                           </div>
                           <h4 className={`text-sm font-medium ${
                              isUnlocked ? 'text-gray-900' : 'text-gray-500'
                           }`}>
                              {achievement.title}
                           </h4>
                           <p className={`text-xs ${
                              isUnlocked ? 'text-gray-600' : 'text-gray-400'
                           }`}>
                              {achievement.description}
                           </p>
                           {isUnlocked && (
                              <div className="text-xs text-green-600 font-medium mt-1">
                                 +{achievement.points} pts
                              </div>
                           )}
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      </>
   );
};

export default AchievementSystem;
