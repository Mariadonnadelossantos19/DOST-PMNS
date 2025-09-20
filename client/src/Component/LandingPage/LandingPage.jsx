import React, { useState, useEffect } from 'react';
import { Button } from '../UI';
import AuthModal from '../Registration/AuthModal';
import { useDarkMode } from '../Context';
import heroImage from '../../assets/hero-img.png';

const LandingPage = ({ onLoginSuccess }) => {
   const { isDarkMode, toggleDarkMode } = useDarkMode();
   const [isScrolled, setIsScrolled] = useState(false);
   const [activeSection] = useState('home');
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [showAuthModal, setShowAuthModal] = useState(false);

   useEffect(() => {
      const handleScroll = () => {
         setIsScrolled(window.scrollY > 50);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
   }, []);

   // Initialize GLightbox for video popup
   useEffect(() => {
      if (window.GLightbox) {
         const lightbox = window.GLightbox({
            selector: '.glightbox',
            autoplayVideos: true,
            skin: 'modern',
            width: '90vw',
            height: '90vh'
         });
         
         return () => {
            lightbox.destroy();
         };
      }
   }, []);

   const handleLoginClick = () => {
      setShowAuthModal(true);
   };

   const handleAuthSuccess = (data) => {
      onLoginSuccess?.(data);
   };


   return (
      <div className={`min-h-screen transition-colors duration-300 ${
         isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
         {/* Header */}
         <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled 
               ? isDarkMode 
                  ? 'bg-gray-900/98 backdrop-blur-lg shadow-xl border-b border-gray-700/50' 
                  : 'bg-white/98 backdrop-blur-lg shadow-xl border-b border-gray-200/50'
               : isDarkMode 
                  ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-700/30' 
                  : 'bg-white/95 backdrop-blur-md border-b border-gray-200/30'
         }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex justify-between items-center h-14 sm:h-16">
                  <div className="flex items-center group cursor-pointer">
                     <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mr-2 sm:mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                     </div>
                     <div>
                        <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-blue-900 transition-all duration-300">
                           DOST-PMNS
                        </h1>
                        <div className={`text-xs font-medium transition-colors duration-300 hidden sm:block ${
                           isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>Project Management System</div>
                     </div>
                  </div>
                  
                  <nav className="hidden md:flex space-x-1">
                     {[
                        { href: '#home', label: 'Home' },
                        { href: '#about', label: 'About' },
                        { href: '#services', label: 'Services' },
                        { href: '#contact', label: 'Contact' }
                     ].map((item) => (
                        <a 
                           key={item.href}
                           href={item.href} 
                           className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group ${
                              activeSection === item.href.replace('#', '') 
                                 ? isDarkMode 
                                    ? 'text-blue-400 bg-blue-900/50' 
                                    : 'text-blue-600 bg-blue-50'
                                 : isDarkMode 
                                    ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' 
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                           }`}
                        >
                           {item.label}
                           <span className={`absolute bottom-0 left-1/2 w-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                              activeSection === item.href.replace('#', '') 
                                 ? 'w-full left-0' 
                                 : 'group-hover:w-full group-hover:left-0'
                           }`}></span>
                        </a>
                     ))}
                  </nav>
                  
                  <div className="hidden md:flex items-center space-x-3">
                     {/* Dark Mode Toggle */}
                     <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-lg transition-colors duration-300 ${
                           isDarkMode 
                              ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                     >
                        {isDarkMode ? (
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                           </svg>
                        ) : (
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                           </svg>
                        )}
                     </button>

                     <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleLoginClick}
                        className={`transition-all duration-300 ${
                           isDarkMode 
                              ? 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                     >
                        Login
                     </Button>
                     <Button 
                        variant="primary" 
                        size="sm"
                        onClick={handleLoginClick}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                     >
                        Get Started
                     </Button>
                  </div>
                  
                  <div className="md:hidden">
                     <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={`inline-flex items-center justify-center p-2 rounded-lg transition-all duration-300 ${
                           isDarkMode 
                              ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' 
                              : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500`}
                     >
                        <span className="sr-only">Open main menu</span>
                        <div className="relative w-5 h-5 sm:w-6 sm:h-6">
                           <span className={`absolute top-1 left-0 w-5 h-0.5 sm:w-6 sm:h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                           <span className={`absolute top-3 left-0 w-5 h-0.5 sm:w-6 sm:h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                           <span className={`absolute top-5 left-0 w-5 h-0.5 sm:w-6 sm:h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                        </div>
                     </button>
                  </div>
               </div>
            </div>
            
            {/* Mobile menu */}
            <div className={`md:hidden transition-all duration-300 overflow-hidden ${
               mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
               <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 backdrop-blur-lg shadow-lg transition-colors duration-300 ${
                  isDarkMode 
                     ? 'bg-gray-900/98 border-t border-gray-700/50' 
                     : 'bg-white/98 border-t border-gray-200/50'
               }`}>
                  {[
                     { href: '#home', label: 'Home', icon: '🏠' },
                     { href: '#about', label: 'About', icon: 'ℹ️' },
                     { href: '#services', label: 'Services', icon: '⭐' },
                     { href: '#contact', label: 'Contact', icon: '📞' }
                  ].map((item) => (
                     <a 
                        key={item.href}
                        href={item.href} 
                        className={`flex items-center block px-3 py-2.5 sm:py-3 text-sm sm:text-base font-medium rounded-lg transition-all duration-300 group ${
                           isDarkMode 
                              ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' 
                              : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                     >
                        <span className="mr-3 text-base sm:text-lg group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                        {item.label}
                     </a>
                  ))}
                  <div className="px-3 py-2 space-y-2">
                     <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleLoginClick}
                        className={`w-full text-sm transition-all duration-300 ${
                           isDarkMode 
                              ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                     >
                        Login
                     </Button>
                     <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={handleLoginClick}
                        className="w-full text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                     >
                        Get Started
                     </Button>
                  </div>
               </div>
            </div>
         </header>

         {/* Hero Section */}
         <section id="home" className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-16 sm:py-24 lg:py-32 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
               <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               }}></div>
            </div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                  <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
                     <div className="space-y-4 sm:space-y-6">
                        <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                           <span className="w-2 h-2 bg-green-400 rounded-full mr-2 sm:mr-3 animate-pulse"></span>
                           <span className="text-xs sm:text-sm font-medium">Live System</span>
                        </div>
                        
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                           Project Management and 
                           <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                              Notification System
                           </span>
                        </h1>
                        
                        <p className="text-base sm:text-lg lg:text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                           A comprehensive web-based system that streamlines project management and keeps all stakeholders informed through intelligent notifications.
                        </p>
                     </div>
                     
                     <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                        <Button 
                           variant="secondary" 
                           size="lg" 
                           onClick={handleLoginClick}
                           className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group w-full sm:w-auto"
                        >
                           <span className="mr-2">Get Started</span>
                           <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                           </svg>
                        </Button>
                        <a href="https://www.youtube.com/watch?v=aXHLN4qGSWw" className="glightbox btn-watch-video border-white/30 text-white hover:bg-white hover:text-blue-600 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group inline-flex items-center justify-center px-4 sm:px-6 py-3 border rounded-lg w-full sm:w-auto">
                           <i className="bi bi-play-circle mr-2 group-hover:scale-110 transition-transform"></i>
                           <span>Watch Video</span>
                        </a>
                     </div>
                     
                     {/* Stats */}
                     <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-6 sm:pt-8 border-t border-white/20">
                        <div className="text-center">
                           <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">133+</div>
                           <div className="text-xs sm:text-sm text-blue-200">Active Projects</div>
                        </div>
                        <div className="text-center">
                           <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">500+</div>
                           <div className="text-xs sm:text-sm text-blue-200">Users</div>
                        </div>
                        <div className="text-center">
                           <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">99.9%</div>
                           <div className="text-xs sm:text-sm text-blue-200">Uptime</div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="relative mt-8 lg:mt-0">
                     <div className="relative group">
                        {/* Floating Elements - Hidden on mobile for better performance */}
                        <div className="hidden sm:block absolute -top-4 -right-4 w-16 sm:w-20 h-16 sm:h-20 bg-yellow-400 rounded-full opacity-20 animate-bounce"></div>
                        <div className="hidden sm:block absolute -bottom-4 -left-4 w-12 sm:w-16 h-12 sm:h-16 bg-green-400 rounded-full opacity-20 animate-pulse"></div>
                        
                        <div className="relative z-10">
                           <img 
                              src={heroImage} 
                              alt="Project Management and Notification System" 
                              className="w-full h-auto max-w-sm sm:max-w-md lg:max-w-lg mx-auto drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500 animate-float"
                              style={{
                                 animation: 'float 6s ease-in-out infinite'
                              }}
                           />
                        </div>
                        
                        {/* Glow Effect - Reduced on mobile */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 sm:from-blue-400/20 to-purple-400/10 sm:to-purple-400/20 rounded-2xl sm:rounded-3xl blur-2xl sm:blur-3xl transform group-hover:scale-110 transition-transform duration-500"></div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* About Section */}
         <section className={`py-16 sm:py-20 lg:py-24 relative overflow-hidden transition-colors duration-300 ${
            isDarkMode 
               ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
               : 'bg-gradient-to-br from-gray-50 to-blue-50'
         }`}>
            {/* Background Elements - Hidden on mobile for better performance */}
            <div className={`hidden sm:block absolute top-0 right-0 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 rounded-full opacity-20 -translate-y-32 sm:-translate-y-40 lg:-translate-y-48 translate-x-32 sm:translate-x-40 lg:translate-x-48 transition-colors duration-300 ${
               isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
            }`}></div>
            <div className={`hidden sm:block absolute bottom-0 left-0 w-56 sm:w-72 lg:w-80 h-56 sm:h-72 lg:h-80 rounded-full opacity-20 translate-y-28 sm:translate-y-36 lg:translate-y-40 -translate-x-28 sm:-translate-x-36 lg:-translate-x-40 transition-colors duration-300 ${
               isDarkMode ? 'bg-blue-800' : 'bg-blue-200'
            }`}></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center mb-12 sm:mb-16 lg:mb-20">
                  <div className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-full mb-4 sm:mb-6 transition-colors duration-300 ${
                     isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'
                  }`}>
                     <span className={`font-semibold text-xs sm:text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-blue-300' : 'text-blue-600'
                     }`}>About Our System</span>
                  </div>
                  <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 transition-colors duration-300 ${
                     isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                     ABOUT <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">PMNS</span>
                  </h2>
                  <div className="w-20 sm:w-24 lg:w-32 h-1 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto rounded-full"></div>
               </div>
               
               <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
                  <p className={`text-base sm:text-lg lg:text-xl leading-relaxed transition-colors duration-300 ${
                     isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                     Facilitate project planning, notification, and scheduling by providing a centralized system for tracking tasks and deadlines and improve project outcomes by ensuring that all tasks are completed on time and to the required standard.
                  </p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
                  <div className="space-y-4 sm:space-y-6">
                     <div className={`group flex items-start p-3 sm:p-4 rounded-xl transition-all duration-300 ${
                        isDarkMode 
                           ? 'hover:bg-gray-800 hover:shadow-lg' 
                           : 'hover:bg-white hover:shadow-lg'
                     }`}>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4 mt-1 shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                           <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                        </div>
                        <div className="min-w-0">
                           <h3 className={`font-semibold mb-1 text-sm sm:text-base transition-colors ${
                              isDarkMode 
                                 ? 'text-white group-hover:text-blue-400' 
                                 : 'text-gray-900 group-hover:text-blue-600'
                           }`}>Task management and reminder</h3>
                        </div>
                     </div>
                     
                     <div className={`group flex items-start p-3 sm:p-4 rounded-xl transition-all duration-300 ${
                        isDarkMode 
                           ? 'hover:bg-gray-800 hover:shadow-lg' 
                           : 'hover:bg-white hover:shadow-lg'
                     }`}>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4 mt-1 shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                           <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                        </div>
                        <div className="min-w-0">
                           <h3 className={`font-semibold mb-1 text-sm sm:text-base transition-colors ${
                              isDarkMode 
                                 ? 'text-white group-hover:text-blue-400' 
                                 : 'text-gray-900 group-hover:text-blue-600'
                           }`}>Deadline tracking</h3>
                        </div>
                     </div>
                     
                     <div className={`group flex items-start p-3 sm:p-4 rounded-xl transition-all duration-300 ${
                        isDarkMode 
                           ? 'hover:bg-gray-800 hover:shadow-lg' 
                           : 'hover:bg-white hover:shadow-lg'
                     }`}>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4 mt-1 shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                           <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                        </div>
                        <div className="min-w-0">
                           <h3 className={`font-semibold mb-1 text-sm sm:text-base transition-colors ${
                              isDarkMode 
                                 ? 'text-white group-hover:text-blue-400' 
                                 : 'text-gray-900 group-hover:text-blue-600'
                           }`}>Priority settings</h3>
                        </div>
                     </div>
                     
                     <div className={`group flex items-start p-3 sm:p-4 rounded-xl transition-all duration-300 ${
                        isDarkMode 
                           ? 'hover:bg-gray-800 hover:shadow-lg' 
                           : 'hover:bg-white hover:shadow-lg'
                     }`}>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4 mt-1 shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                           <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                        </div>
                        <div className="min-w-0">
                           <h3 className={`font-semibold mb-1 text-sm sm:text-base transition-colors ${
                              isDarkMode 
                                 ? 'text-white group-hover:text-blue-400' 
                                 : 'text-gray-900 group-hover:text-blue-600'
                           }`}>Reporting and analytics</h3>
                        </div>
                     </div>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                     <div className={`group flex items-start p-3 sm:p-4 rounded-xl transition-all duration-300 ${
                        isDarkMode 
                           ? 'hover:bg-gray-800 hover:shadow-lg' 
                           : 'hover:bg-white hover:shadow-lg'
                     }`}>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4 mt-1 shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                           <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                        </div>
                        <div className="min-w-0">
                           <h3 className={`font-semibold mb-1 text-sm sm:text-base transition-colors ${
                              isDarkMode 
                                 ? 'text-white group-hover:text-blue-400' 
                                 : 'text-gray-900 group-hover:text-blue-600'
                           }`}>Contact management</h3>
                        </div>
                     </div>
                     
                     <div className={`group flex items-start p-3 sm:p-4 rounded-xl transition-all duration-300 ${
                        isDarkMode 
                           ? 'hover:bg-gray-800 hover:shadow-lg' 
                           : 'hover:bg-white hover:shadow-lg'
                     }`}>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4 mt-1 shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                           <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                        </div>
                        <div className="min-w-0">
                           <h3 className={`font-semibold mb-1 text-sm sm:text-base transition-colors ${
                              isDarkMode 
                                 ? 'text-white group-hover:text-blue-400' 
                                 : 'text-gray-900 group-hover:text-blue-600'
                           }`}>SMS and email broadcasting</h3>
                        </div>
                     </div>
                     
                     <div className={`group flex items-start p-3 sm:p-4 rounded-xl transition-all duration-300 ${
                        isDarkMode 
                           ? 'hover:bg-gray-800 hover:shadow-lg' 
                           : 'hover:bg-white hover:shadow-lg'
                     }`}>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4 mt-1 shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                           <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                        </div>
                        <div className="min-w-0">
                           <h3 className={`font-semibold mb-1 text-sm sm:text-base transition-colors ${
                              isDarkMode 
                                 ? 'text-white group-hover:text-blue-400' 
                                 : 'text-gray-900 group-hover:text-blue-600'
                           }`}>Scheduling</h3>
                        </div>
                     </div>
                     
                     <div className={`group flex items-start p-3 sm:p-4 rounded-xl transition-all duration-300 ${
                        isDarkMode 
                           ? 'hover:bg-gray-800 hover:shadow-lg' 
                           : 'hover:bg-white hover:shadow-lg'
                     }`}>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4 mt-1 shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                           <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                        </div>
                        <div className="min-w-0">
                           <h3 className={`font-semibold mb-1 text-sm sm:text-base transition-colors ${
                              isDarkMode 
                                 ? 'text-white group-hover:text-blue-400' 
                                 : 'text-gray-900 group-hover:text-blue-600'
                           }`}>Automated alerts and notification</h3>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="text-center mt-16">
                  <Button 
                     variant="primary" 
                     size="lg" 
                     className="shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
                  >
                     <span className="mr-2">Learn More</span>
                     <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                     </svg>
                  </Button>
               </div>
            </div>
         </section>

         {/* Project Statistics Section */}
         <section className={`py-16 sm:py-20 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
         }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  <div className="order-2 lg:order-1">
                     <div className={`rounded-2xl p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${
                        isDarkMode 
                           ? 'bg-gradient-to-br from-gray-800 to-gray-700' 
                           : 'bg-gradient-to-br from-blue-50 to-indigo-100'
                     }`}>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                           <div className={`rounded-lg p-3 sm:p-4 shadow-sm transition-colors duration-300 ${
                              isDarkMode ? 'bg-gray-700' : 'bg-white'
                           }`}>
                              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
                                 <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                 </svg>
                              </div>
                              <div className={`h-2 sm:h-3 rounded mb-1 sm:mb-2 transition-colors duration-300 ${
                                 isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                              }`}></div>
                              <div className={`h-1 sm:h-2 rounded w-3/4 transition-colors duration-300 ${
                                 isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                              }`}></div>
                           </div>
                           <div className={`rounded-lg p-3 sm:p-4 shadow-sm transition-colors duration-300 ${
                              isDarkMode ? 'bg-gray-700' : 'bg-white'
                           }`}>
                              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
                                 <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                 </svg>
                              </div>
                              <div className={`h-2 sm:h-3 rounded mb-1 sm:mb-2 transition-colors duration-300 ${
                                 isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                              }`}></div>
                              <div className={`h-1 sm:h-2 rounded w-2/3 transition-colors duration-300 ${
                                 isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                              }`}></div>
                           </div>
                           <div className={`rounded-lg p-3 sm:p-4 shadow-sm transition-colors duration-300 ${
                              isDarkMode ? 'bg-gray-700' : 'bg-white'
                           }`}>
                              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
                                 <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                 </svg>
                              </div>
                              <div className={`h-2 sm:h-3 rounded mb-1 sm:mb-2 transition-colors duration-300 ${
                                 isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                              }`}></div>
                              <div className={`h-1 sm:h-2 rounded w-4/5 transition-colors duration-300 ${
                                 isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                              }`}></div>
                           </div>
                           <div className={`rounded-lg p-3 sm:p-4 shadow-sm transition-colors duration-300 ${
                              isDarkMode ? 'bg-gray-700' : 'bg-white'
                           }`}>
                              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
                                 <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                 </svg>
                              </div>
                              <div className={`h-2 sm:h-3 rounded mb-1 sm:mb-2 transition-colors duration-300 ${
                                 isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                              }`}></div>
                              <div className={`h-1 sm:h-2 rounded w-1/2 transition-colors duration-300 ${
                                 isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                              }`}></div>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="order-1 lg:order-2">
                     <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>
                        Project
                     </h2>
                     <p className={`text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                     }`}>Total projects per program.</p>
                     
                     <div className="space-y-3 sm:space-y-4">
                        <div className={`flex items-center justify-between p-3 sm:p-4 rounded-lg transition-colors duration-300 ${
                           isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                        }`}>
                           <span className={`font-semibold text-sm sm:text-base transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>GIA</span>
                           <span className="text-xl sm:text-2xl font-bold text-blue-600">12</span>
                        </div>
                        <div className={`flex items-center justify-between p-3 sm:p-4 rounded-lg transition-colors duration-300 ${
                           isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                        }`}>
                           <span className={`font-semibold text-sm sm:text-base transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>CEST</span>
                           <span className="text-xl sm:text-2xl font-bold text-green-600">10</span>
                        </div>
                        <div className={`flex items-center justify-between p-3 sm:p-4 rounded-lg transition-colors duration-300 ${
                           isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                        }`}>
                           <span className={`font-semibold text-sm sm:text-base transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>SETUP</span>
                           <span className="text-xl sm:text-2xl font-bold text-purple-600">107</span>
                        </div>
                        <div className={`flex items-center justify-between p-3 sm:p-4 rounded-lg transition-colors duration-300 ${
                           isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                        }`}>
                           <span className={`font-semibold text-sm sm:text-base transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>SSCP</span>
                           <span className="text-xl sm:text-2xl font-bold text-orange-600">4</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Services Section */}
         <section className={`py-16 sm:py-20 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
         }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center mb-12 sm:mb-16">
                  <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 transition-colors duration-300 ${
                     isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>SERVICES</h2>
                  <div className="w-16 sm:w-20 lg:w-24 h-1 bg-blue-600 mx-auto"></div>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  <div className={`rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 ${
                     isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                     <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                     </div>
                     <h3 className={`text-lg sm:text-xl font-bold mb-2 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>GIA</h3>
                     <p className={`text-sm sm:text-base transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                     }`}>Grant-In-Aid.</p>
                  </div>
                  
                  <div className={`rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 ${
                     isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                     <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                     </div>
                     <h3 className={`text-lg sm:text-xl font-bold mb-2 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>CEST</h3>
                     <p className={`text-sm sm:text-base transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                     }`}>Community Empowerment thru Science and Technology.</p>
                  </div>
                  
                  <div className={`rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 ${
                     isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                     <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                     </div>
                     <h3 className={`text-lg sm:text-xl font-bold mb-2 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>SETUP</h3>
                     <p className={`text-sm sm:text-base transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                     }`}>Small Enterprise Technology Upgrading Program.</p>
                  </div>
                  
                  <div className={`rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 ${
                     isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                     <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                     </div>
                     <h3 className={`text-lg sm:text-xl font-bold mb-2 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>SSCP</h3>
                     <p className={`text-sm sm:text-base transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                     }`}>Smart and Sustainable Communities Program.</p>
                  </div>
               </div>
            </div>
         </section>

         {/* Contact Section */}
         <section className={`py-16 sm:py-20 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
         }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                  <div>
                     <h2 className={`text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>Contact Us</h2>
                     
                     <div className="space-y-4 sm:space-y-6">
                        <div className="flex items-start">
                           <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                           </div>
                           <div className="min-w-0">
                              <p className={`text-sm sm:text-base transition-colors duration-300 ${
                                 isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                 <strong>Location:</strong> 4/F DOST-PTRI Building, Gen. Santos Avenue, Bicutan, Taguig City
                              </p>
                           </div>
                        </div>
                        
                        <div className="flex items-start">
                           <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                              </svg>
                           </div>
                           <div className="min-w-0">
                              <p className={`text-sm sm:text-base transition-colors duration-300 ${
                                 isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                 <strong>Website:</strong> https://region4b.dost.gov.ph
                              </p>
                           </div>
                        </div>
                        
                        <div className="flex items-start">
                           <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                           </div>
                           <div className="min-w-0">
                              <p className={`text-sm sm:text-base transition-colors duration-300 ${
                                 isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                 <strong>Email:</strong> official@mimaropa.dost.gov.ph
                              </p>
                           </div>
                        </div>
                        
                        <div className="flex items-start">
                           <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                           </div>
                           <div className="min-w-0">
                              <p className={`text-sm sm:text-base transition-colors duration-300 ${
                                 isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                 <strong>Call:</strong> (02) 837-2071 loc 2092 or 2093
                              </p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="mt-6 sm:mt-8">
                        <div className="rounded-lg overflow-hidden shadow-lg">
                           <iframe 
                              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15451.867249833736!2d121.0486759!3d14.4865947!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397cf1162342b39%3A0x1b73947e2ee43d00!2sPhilippine%20Textile%20Research%20Institute!5e0!3m2!1sen!2sph!4v1715923383388!5m2!1sen!2sph" 
                              width="100%" 
                              height="200" 
                              style={{border: 0}} 
                              allowFullScreen="" 
                              loading="lazy" 
                              referrerPolicy="no-referrer-when-downgrade"
                              title="DOST-MIMAROPA Location Map"
                              className="sm:h-[250px] lg:h-[290px]"
                           ></iframe>
                        </div>
                     </div>
                  </div>
                  
                  <div>
                     <form className="space-y-4 sm:space-y-6">
                        <div>
                           <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                           }`}>Your Name</label>
                           <input type="text" className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 text-sm sm:text-base ${
                              isDarkMode 
                                 ? 'bg-gray-800 border-gray-600 text-white' 
                                 : 'bg-white border-gray-300 text-gray-900'
                           }`} />
                        </div>
                        
                        <div>
                           <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                           }`}>Your Email</label>
                           <input type="email" className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 text-sm sm:text-base ${
                              isDarkMode 
                                 ? 'bg-gray-800 border-gray-600 text-white' 
                                 : 'bg-white border-gray-300 text-gray-900'
                           }`} />
                        </div>
                        
                        <div>
                           <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                           }`}>Subject</label>
                           <input type="text" className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 text-sm sm:text-base ${
                              isDarkMode 
                                 ? 'bg-gray-800 border-gray-600 text-white' 
                                 : 'bg-white border-gray-300 text-gray-900'
                           }`} />
                        </div>
                        
                        <div>
                           <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                           }`}>Message</label>
                           <textarea rows={3} className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 text-sm sm:text-base resize-none ${
                              isDarkMode 
                                 ? 'bg-gray-800 border-gray-600 text-white' 
                                 : 'bg-white border-gray-300 text-gray-900'
                           }`}></textarea>
                        </div>
                        
                        <Button variant="primary" size="lg" className="w-full">
                           Send Message
                        </Button>
                     </form>
                  </div>
               </div>
            </div>
         </section>

         {/* Footer */}
         <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                     <h3 className="text-xl font-bold mb-4">DOST-MIMAROPA</h3>
                     <div className="space-y-2 text-gray-300">
                        <p>4/F DOST-PTRI Building, Gen. Santos Avenue, Bicutan, Taguig City</p>
                        <p>(02) 837-2071 loc 2092 or 2093</p>
                        <p>https://region4b.dost.gov.ph</p>
                        <p>official@mimaropa.dost.gov.ph</p>
                     </div>
                  </div>
                  
                  <div>
                     <h3 className="text-xl font-bold mb-4">Useful Links</h3>
                     <div className="space-y-2">
                        <a href="#home" className="block text-gray-300 hover:text-white transition-colors">Home</a>
                        <a href="#about" className="block text-gray-300 hover:text-white transition-colors">About us</a>
                        <a href="#services" className="block text-gray-300 hover:text-white transition-colors">Services</a>
                        <a href="#" className="block text-gray-300 hover:text-white transition-colors">Terms of service</a>
                        <a href="#" className="block text-gray-300 hover:text-white transition-colors">Privacy policy</a>
                     </div>
                  </div>
                  
                  <div>
                     <h3 className="text-xl font-bold mb-4">Our Social Networks</h3>
                     <div className="flex space-x-4">
                        <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                           </svg>
                        </a>
                        <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                           </svg>
                        </a>
                        <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                           </svg>
                        </a>
                     </div>
                  </div>
               </div>
               
               <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                  <p className="text-gray-400">© Copyright DOST-MIMAROPA. All Rights Reserved</p>
               </div>
            </div>
         </footer>

         {/* Authentication Modal */}
         <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onLoginSuccess={handleAuthSuccess}
            onRegisterSuccess={handleAuthSuccess}
         />
      </div>
   );
};

export default LandingPage;
