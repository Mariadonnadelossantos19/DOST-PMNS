import React, { useState } from 'react';
import MiniGamesModal from './MiniGamesModal';
import { MemoryCardGame, TypingSpeedTest, NumberPuzzle } from './MiniGames';

const FloatingMiniGamesButton = () => {
   const [showMiniGamesModal, setShowMiniGamesModal] = useState(false);
   const [selectedGame, setSelectedGame] = useState(null);

   console.log('FloatingMiniGamesButton rendered, showMiniGamesModal:', showMiniGamesModal);

   const handleButtonClick = () => {
      console.log('Floating button clicked!');
      setShowMiniGamesModal(true);
   };

   return (
      <>
         {/* Floating Button */}
         <div 
            className="fixed bottom-6 right-6" 
            style={{ 
               zIndex: 99999,
               position: 'fixed',
               bottom: '24px',
               right: '24px'
            }}
         >
            <button
               onClick={handleButtonClick}
               className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
               title="Take a Break - Mini Games"
               style={{ 
                  cursor: 'pointer',
                  zIndex: 99999,
                  position: 'relative'
               }}
            >
               <svg 
                  className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
               >
                  <path 
                     strokeLinecap="round" 
                     strokeLinejoin="round" 
                     strokeWidth={2} 
                     d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
               </svg>
            </button>

            {/* Pulse Animation Ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-ping opacity-20"></div>
            
            {/* Tooltip */}
            <div className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
               Take a Break - Mini Games
               <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
         </div>


         {/* Mini Games Modal */}
         {showMiniGamesModal && (
            <div 
               className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center" 
               style={{ 
                  zIndex: 99999,
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)'
               }}
               onClick={(e) => {
                  console.log('Modal background clicked, closing modal');
                  if (e.target === e.currentTarget) {
                     setShowMiniGamesModal(false);
                     setSelectedGame(null);
                  }
               }}
            >
               <div 
                  className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6"
                  onClick={(e) => {
                     console.log('Modal content clicked, preventing close');
                     e.stopPropagation();
                  }}
                  style={{
                     backgroundColor: 'white',
                     borderRadius: '8px',
                     boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                     maxWidth: '400px',
                     width: '90%',
                     padding: '24px',
                     position: 'relative',
                     zIndex: 100000
                  }}
               >
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-xl font-semibold">Mini Games</h2>
                     <button
                        onClick={() => {
                           setShowMiniGamesModal(false);
                           setSelectedGame(null);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                     >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                     </button>
                  </div>
                  {!selectedGame ? (
                     <div className="space-y-3">
                        <div 
                           className="p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                           onClick={() => {
                              console.log('Memory Match clicked');
                              setSelectedGame('memory');
                           }}
                        >
                           <h3 className="font-medium">Memory Match</h3>
                           <p className="text-sm text-gray-600">Test your memory by matching pairs</p>
                        </div>
                        <div 
                           className="p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                           onClick={() => {
                              console.log('Typing Test clicked');
                              setSelectedGame('typing');
                           }}
                        >
                           <h3 className="font-medium">Typing Test</h3>
                           <p className="text-sm text-gray-600">Improve your typing speed</p>
                        </div>
                        <div 
                           className="p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                           onClick={() => {
                              console.log('Number Puzzle clicked');
                              setSelectedGame('puzzle');
                           }}
                        >
                           <h3 className="font-medium">Number Puzzle</h3>
                           <p className="text-sm text-gray-600">Solve the sliding puzzle</p>
                        </div>
                     </div>
                  ) : (
                     <div>
                        <div className="flex items-center gap-3 mb-4">
                           <button
                              onClick={() => setSelectedGame(null)}
                              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                           >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                              Back to Games
                           </button>
                           <h3 className="text-lg font-semibold text-gray-900">
                              {selectedGame === 'memory' && 'Memory Match'}
                              {selectedGame === 'typing' && 'Typing Test'}
                              {selectedGame === 'puzzle' && 'Number Puzzle'}
                           </h3>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                           {selectedGame === 'memory' && <MemoryCardGame onComplete={() => setSelectedGame(null)} />}
                           {selectedGame === 'typing' && <TypingSpeedTest onComplete={() => setSelectedGame(null)} />}
                           {selectedGame === 'puzzle' && <NumberPuzzle onComplete={() => setSelectedGame(null)} />}
                        </div>
                     </div>
                  )}
               </div>
            </div>
         )}
      </>
   );
};

export default FloatingMiniGamesButton;
