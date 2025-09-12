import React, { useState } from 'react';
import { MemoryCardGame, TypingSpeedTest, NumberPuzzle } from './MiniGames';

const MiniGamesModal = ({ isOpen, onClose }) => {
   const [selectedGame, setSelectedGame] = useState(null);

   console.log('MiniGamesModal - isOpen:', isOpen);

   if (!isOpen) return null;

   const games = [
      {
         id: 'memory',
         title: 'Memory Match',
         description: 'Test your memory by matching pairs of cards',
         icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
         ),
         color: 'blue'
      },
      {
         id: 'typing',
         title: 'Typing Test',
         description: 'Improve your typing speed and accuracy',
         icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
         ),
         color: 'green'
      },
      {
         id: 'puzzle',
         title: 'Number Puzzle',
         description: 'Solve the sliding number puzzle',
         icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
         ),
         color: 'purple'
      }
   ];

   const handleGameSelect = (gameId) => {
      setSelectedGame(gameId);
   };

   const handleBackToSelection = () => {
      setSelectedGame(null);
   };

   const renderGameContent = () => {
      switch (selectedGame) {
         case 'memory':
            return <MemoryCardGame onComplete={() => setSelectedGame(null)} />;
         case 'typing':
            return <TypingSpeedTest onComplete={() => setSelectedGame(null)} />;
         case 'puzzle':
            return <NumberPuzzle onComplete={() => setSelectedGame(null)} />;
         default:
            return null;
      }
   };

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{ zIndex: 9999 }}>
         <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
                  <div>
                     <h2 className="text-xl font-semibold text-gray-900">Take a Break - Mini Games</h2>
                     <p className="text-sm text-gray-500">Choose a game to play and relax</p>
                  </div>
               </div>
               <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
               >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </button>
            </div>

            {/* Content */}
            <div className="p-6">
               {!selectedGame ? (
                  // Game Selection
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {games.map((game) => (
                        <div
                           key={game.id}
                           onClick={() => handleGameSelect(game.id)}
                           className={`bg-gradient-to-br from-${game.color}-50 to-${game.color}-100 border-2 border-${game.color}-200 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 group`}
                        >
                           <div className="flex flex-col items-center text-center">
                              <div className={`w-16 h-16 bg-${game.color}-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                 {game.icon}
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{game.title}</h3>
                              <p className="text-sm text-gray-600 mb-4">{game.description}</p>
                              <div className={`px-4 py-2 bg-${game.color}-500 text-white rounded-lg text-sm font-medium group-hover:bg-${game.color}-600 transition-colors`}>
                                 Play Now
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  // Game Content
                  <div>
                     <div className="flex items-center gap-3 mb-6">
                        <button
                           onClick={handleBackToSelection}
                           className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                           </svg>
                           Back to Games
                        </button>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <h3 className="text-lg font-semibold text-gray-900">
                           {games.find(g => g.id === selectedGame)?.title}
                        </h3>
                     </div>
                     <div className="bg-gray-50 rounded-lg p-6">
                        {renderGameContent()}
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default MiniGamesModal;
