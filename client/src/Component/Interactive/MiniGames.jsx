import React, { useState, useEffect, useCallback } from 'react';

// Memory Card Game
export const MemoryCardGame = ({ onComplete }) => {
   const [cards, setCards] = useState([]);
   const [flippedCards, setFlippedCards] = useState([]);
   const [matchedCards, setMatchedCards] = useState([]);
   const [moves, setMoves] = useState(0);
   const [gameComplete, setGameComplete] = useState(false);

   const symbols = [
      <svg key="target" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg key="clipboard" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>,
      <svg key="check" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>,
      <svg key="lightning" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg key="diamond" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>,
      <svg key="heart" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      <svg key="star" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>,
      <svg key="trophy" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
   ];

   const initializeGame = useCallback(() => {
      const gameCards = [...symbols, ...symbols]
         .sort(() => Math.random() - 0.5)
         .map((symbol, index) => ({
            id: index,
            symbol,
            isFlipped: false,
            isMatched: false
         }));
      
      setCards(gameCards);
      setFlippedCards([]);
      setMatchedCards([]);
      setMoves(0);
      setGameComplete(false);
   }, []);

   useEffect(() => {
      initializeGame();
   }, [initializeGame]);

   const handleCardClick = (cardId) => {
      if (flippedCards.length >= 2 || flippedCards.includes(cardId) || matchedCards.includes(cardId)) {
         return;
      }

      const newFlippedCards = [...flippedCards, cardId];
      setFlippedCards(newFlippedCards);

      if (newFlippedCards.length === 2) {
         setMoves(prev => prev + 1);
         
         const [firstCard, secondCard] = newFlippedCards;
         const firstSymbol = cards.find(card => card.id === firstCard)?.symbol;
         const secondSymbol = cards.find(card => card.id === secondCard)?.symbol;

         if (firstSymbol === secondSymbol) {
            setMatchedCards(prev => [...prev, firstCard, secondCard]);
            setFlippedCards([]);
            
            if (matchedCards.length + 2 === cards.length) {
               setGameComplete(true);
               setTimeout(() => {
                  onComplete && onComplete(moves + 1);
               }, 1000);
            }
         } else {
            setTimeout(() => {
               setFlippedCards([]);
            }, 1000);
         }
      }
   };

   return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
         <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Memory Match</h3>
            <p className="text-sm text-gray-600">Match the pairs to complete the game!</p>
            <div className="text-sm text-blue-600 font-medium">Moves: {moves}</div>
         </div>
         
         <div className="grid grid-cols-4 gap-2 mb-4">
            {cards.map(card => (
               <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl transition-all duration-300 ${
                     flippedCards.includes(card.id) || matchedCards.includes(card.id)
                        ? 'bg-blue-100 border-blue-300 transform scale-105'
                        : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                  }`}
                  disabled={matchedCards.includes(card.id)}
               >
                  {flippedCards.includes(card.id) || matchedCards.includes(card.id) ? card.symbol : '?'}
               </button>
            ))}
         </div>
         
         {gameComplete && (
            <div className="text-center">
               <div className="text-4xl mb-2">🎉</div>
               <p className="text-lg font-semibold text-green-600">Congratulations!</p>
               <p className="text-sm text-gray-600">You completed the game in {moves} moves!</p>
            </div>
         )}
         
         <div className="text-center mt-4">
            <button
               onClick={initializeGame}
               className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
               New Game
            </button>
         </div>
      </div>
   );
};

// Typing Speed Test
export const TypingSpeedTest = ({ onComplete }) => {
   const [text, setText] = useState('');
   const [userInput, setUserInput] = useState('');
   const [startTime, setStartTime] = useState(null);
   const [wpm, setWpm] = useState(0);
   const [accuracy, setAccuracy] = useState(0);
   const [gameComplete, setGameComplete] = useState(false);

   const sampleTexts = [
      "DOST MIMAROPA provides science and technology services to help communities grow and develop through innovative solutions.",
      "The Technology Needs Assessment helps identify the best technological solutions for small and medium enterprises.",
      "Community Empowerment through Science and Technology aims to improve the quality of life in rural areas.",
      "Grants-in-Aid programs support research and development projects that benefit the local community."
   ];

   const initializeGame = () => {
      const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
      setText(randomText);
      setUserInput('');
      setStartTime(null);
      setWpm(0);
      setAccuracy(0);
      setGameComplete(false);
   };

   useEffect(() => {
      initializeGame();
   }, []);

   const handleInputChange = (e) => {
      const value = e.target.value;
      setUserInput(value);
      
      if (!startTime) {
         setStartTime(Date.now());
      }
      
      if (value === text) {
         const endTime = Date.now();
         const timeInMinutes = (endTime - startTime) / 60000;
         const wordsPerMinute = Math.round((text.split(' ').length / timeInMinutes));
         const accuracyScore = Math.round((text.length / value.length) * 100);
         
         setWpm(wordsPerMinute);
         setAccuracy(accuracyScore);
         setGameComplete(true);
         
         setTimeout(() => {
            onComplete && onComplete({ wpm: wordsPerMinute, accuracy: accuracyScore });
         }, 1000);
      }
   };

   const getCharacterClass = (index) => {
      if (index >= userInput.length) return 'text-gray-400';
      if (userInput[index] === text[index]) return 'text-green-600';
      return 'text-red-600 bg-red-100';
   };

   return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
         <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Typing Speed Test</h3>
            <p className="text-sm text-gray-600">Type the text below as fast and accurately as possible!</p>
         </div>
         
         <div className="mb-4">
            <div className="bg-gray-50 p-4 rounded-lg text-sm leading-relaxed">
               {text.split('').map((char, index) => (
                  <span key={index} className={getCharacterClass(index)}>
                     {char}
                  </span>
               ))}
            </div>
         </div>
         
         <div className="mb-4">
            <textarea
               value={userInput}
               onChange={handleInputChange}
               placeholder="Start typing here..."
               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               rows={3}
               disabled={gameComplete}
            />
         </div>
         
         {gameComplete && (
            <div className="text-center mb-4">
               <div className="text-4xl mb-2">🏆</div>
               <p className="text-lg font-semibold text-green-600">Great Job!</p>
               <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="bg-blue-50 p-3 rounded-lg">
                     <div className="text-2xl font-bold text-blue-600">{wpm}</div>
                     <div className="text-sm text-gray-600">Words/Min</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                     <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
                     <div className="text-sm text-gray-600">Accuracy</div>
                  </div>
               </div>
            </div>
         )}
         
         <div className="text-center">
            <button
               onClick={initializeGame}
               className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
               New Test
            </button>
         </div>
      </div>
   );
};

// Number Puzzle Game
export const NumberPuzzle = ({ onComplete }) => {
   const [numbers, setNumbers] = useState([]);
   const [emptyIndex, setEmptyIndex] = useState(15);
   const [moves, setMoves] = useState(0);
   const [gameComplete, setGameComplete] = useState(false);

   const initializeGame = () => {
      const shuffled = Array.from({ length: 15 }, (_, i) => i + 1)
         .sort(() => Math.random() - 0.5);
      setNumbers([...shuffled, null]);
      setEmptyIndex(15);
      setMoves(0);
      setGameComplete(false);
   };

   useEffect(() => {
      initializeGame();
   }, []);

   const canMove = (index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      const emptyRow = Math.floor(emptyIndex / 4);
      const emptyCol = emptyIndex % 4;
      
      return (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
             (Math.abs(col - emptyCol) === 1 && row === emptyRow);
   };

   const handleNumberClick = (index) => {
      if (canMove(index)) {
         const newNumbers = [...numbers];
         newNumbers[emptyIndex] = newNumbers[index];
         newNumbers[index] = null;
         setNumbers(newNumbers);
         setEmptyIndex(index);
         setMoves(prev => prev + 1);
         
         // Check if solved
         const isSolved = newNumbers.slice(0, 15).every((num, i) => num === i + 1);
         if (isSolved) {
            setGameComplete(true);
            setTimeout(() => {
               onComplete && onComplete(moves + 1);
            }, 1000);
         }
      }
   };

   return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
         <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Number Puzzle</h3>
            <p className="text-sm text-gray-600">Arrange numbers 1-15 in order!</p>
            <div className="text-sm text-blue-600 font-medium">Moves: {moves}</div>
         </div>
         
         <div className="grid grid-cols-4 gap-2 mb-4 w-48 mx-auto">
            {numbers.map((number, index) => (
               <button
                  key={index}
                  onClick={() => handleNumberClick(index)}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold transition-all duration-200 ${
                     number === null
                        ? 'bg-gray-200 border-gray-300'
                        : canMove(index)
                        ? 'bg-blue-100 border-blue-300 hover:bg-blue-200 cursor-pointer'
                        : 'bg-gray-100 border-gray-300 cursor-not-allowed'
                  }`}
                  disabled={number === null || !canMove(index)}
               >
                  {number}
               </button>
            ))}
         </div>
         
         {gameComplete && (
            <div className="text-center">
               <div className="text-4xl mb-2">🎉</div>
               <p className="text-lg font-semibold text-green-600">Puzzle Solved!</p>
               <p className="text-sm text-gray-600">You completed it in {moves} moves!</p>
            </div>
         )}
         
         <div className="text-center">
            <button
               onClick={initializeGame}
               className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
               New Puzzle
            </button>
         </div>
      </div>
   );
};

// Main Mini Games Container
const MiniGames = ({ onGameComplete }) => {
   const [activeGame, setActiveGame] = useState(null);
   const [gameStats, setGameStats] = useState({});

   const games = [
      { id: 'memory', name: 'Memory Match', icon: '🧠', component: MemoryCardGame },
      { id: 'typing', name: 'Typing Test', icon: '⌨️', component: TypingSpeedTest },
      { id: 'puzzle', name: 'Number Puzzle', icon: '🧩', component: NumberPuzzle }
   ];

   const handleGameComplete = (gameId, result) => {
      setGameStats(prev => ({
         ...prev,
         [gameId]: {
           ...prev[gameId],
           completed: (prev[gameId]?.completed || 0) + 1,
           lastResult: result
         }
      }));
      setActiveGame(null);
      onGameComplete && onGameComplete(gameId, result);
   };

   if (activeGame) {
      const GameComponent = games.find(g => g.id === activeGame)?.component;
      return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md mx-4">
               <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Mini Game</h2>
                  <button
                     onClick={() => setActiveGame(null)}
                     className="text-gray-500 hover:text-gray-700"
                  >
                     ✕
                  </button>
               </div>
               <div className="p-6">
                  {GameComponent && (
                     <GameComponent onComplete={(result) => handleGameComplete(activeGame, result)} />
                  )}
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
         <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            🎮 Take a Break - Mini Games
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {games.map(game => (
               <button
                  key={game.id}
                  onClick={() => setActiveGame(game.id)}
                  className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow text-center"
               >
                  <div className="text-3xl mb-2">{game.icon}</div>
                  <h4 className="font-medium text-gray-900 mb-1">{game.name}</h4>
                  {gameStats[game.id] && (
                     <p className="text-sm text-gray-600">
                        Completed: {gameStats[game.id].completed} times
                     </p>
                  )}
               </button>
            ))}
         </div>
      </div>
   );
};

export default MiniGames;
