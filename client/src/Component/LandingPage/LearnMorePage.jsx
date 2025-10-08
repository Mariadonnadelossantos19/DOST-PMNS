import React, { useState } from 'react'
import { Button } from '../UI'
import { useDarkMode } from '../Context'

const LearnMorePage = () => {
   const { isDarkMode } = useDarkMode()
   const [activeTab, setActiveTab] = useState('features')

   const features = [
      {
         title: "Real-time Collaboration",
         description: "Work together seamlessly with live updates, instant messaging, and shared workspaces.",
         icon: "🤝"
      },
      {
         title: "Advanced Analytics",
         description: "Get insights with comprehensive dashboards, progress tracking, and performance metrics.",
         icon: "📊"
      },
      {
         title: "Automated Workflows",
         description: "Streamline processes with intelligent automation and customizable workflow rules.",
         icon: "⚡"
      },
      {
         title: "Mobile Accessibility",
         description: "Access your projects anywhere with our responsive mobile-first design.",
         icon: "📱"
      }
   ]

   const benefits = [
      "Increase productivity by 40%",
      "Reduce project completion time by 30%",
      "Improve team communication by 60%",
      "Centralize all project data in one place",
      "Automate repetitive tasks and notifications",
      "Get real-time insights and analytics"
   ]

   const tabs = [
      { id: 'features', label: 'Features', icon: '✨' },
      { id: 'benefits', label: 'Benefits', icon: '🎯' },
      { id: 'pricing', label: 'Pricing', icon: '💰' },
      { id: 'support', label: 'Support', icon: '🛠️' }
   ]

   const handleBackToHome = () => {
      window.history.back()
   }

   return (
      <div className={`min-h-screen transition-colors duration-300 ${
         isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
         {/* Header */}
         <header className={`sticky top-0 z-50 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900/95 backdrop-blur-lg border-b border-gray-700/50' : 'bg-white/95 backdrop-blur-lg border-b border-gray-200/50'
         }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                     <button
                        onClick={handleBackToHome}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-300 ${
                           isDarkMode 
                              ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                     >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Home</span>
                     </button>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                     </div>
                     <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                           DOST-PMNS
                        </h1>
                        <div className={`text-sm font-medium transition-colors duration-300 ${
                           isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>Learn More</div>
                     </div>
                  </div>
               </div>
            </div>
         </header>

         {/* Main Content */}
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="text-center mb-12">
               <h1 className={`text-4xl sm:text-5xl font-bold mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
               }`}>
                  Learn More About DOST-PMNS
               </h1>
               <p className={`text-lg sm:text-xl transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
               }`}>
                  Discover the comprehensive features and benefits of our Project Management & Notification System
               </p>
            </div>

            {/* Tabs */}
            <div className="mb-8">
               <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                  {tabs.map((tab) => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                           activeTab === tab.id
                              ? isDarkMode
                                 ? 'bg-blue-600 text-white shadow-lg'
                                 : 'bg-blue-600 text-white shadow-lg'
                              : isDarkMode
                                 ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                                 : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                     >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                     </button>
                  ))}
               </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto">
               {activeTab === 'features' && (
                  <div className="space-y-8">
                     <h2 className={`text-3xl font-bold text-center mb-8 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>Key Features</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feature, index) => (
                           <div key={index} className={`p-8 rounded-2xl transition-colors duration-300 ${
                              isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                           }`}>
                              <div className="flex items-start space-x-4">
                                 <div className="text-4xl">{feature.icon}</div>
                                 <div>
                                    <h3 className={`text-xl font-semibold mb-3 transition-colors duration-300 ${
                                       isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                       {feature.title}
                                    </h3>
                                    <p className={`transition-colors duration-300 ${
                                       isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                       {feature.description}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {activeTab === 'benefits' && (
                  <div className="space-y-8">
                     <h2 className={`text-3xl font-bold text-center mb-8 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>Why Choose DOST-PMNS?</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {benefits.map((benefit, index) => (
                           <div key={index} className={`flex items-center space-x-4 p-6 rounded-xl transition-colors duration-300 ${
                              isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
                           }`}>
                              <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                              <span className={`text-lg transition-colors duration-300 ${
                                 isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>{benefit}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {activeTab === 'pricing' && (
                  <div className="space-y-8">
                     <h2 className={`text-3xl font-bold text-center mb-8 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>Pricing Plans</h2>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className={`p-8 rounded-2xl border-2 transition-colors duration-300 ${
                           isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                        }`}>
                           <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>Basic</h3>
                           <div className={`text-4xl font-bold mb-6 transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>Free</div>
                           <ul className="space-y-3 text-lg">
                              <li className={`flex items-center transition-colors duration-300 ${
                                 isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                 <span className="text-green-500 mr-3">✓</span>
                                 Up to 5 projects
                              </li>
                              <li className={`flex items-center transition-colors duration-300 ${
                                 isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                 <span className="text-green-500 mr-3">✓</span>
                                 Basic notifications
                              </li>
                              <li className={`flex items-center transition-colors duration-300 ${
                                 isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                 <span className="text-green-500 mr-3">✓</span>
                                 Standard support
                              </li>
                           </ul>
                        </div>
                        
                        <div className={`p-8 rounded-2xl border-2 border-blue-500 relative transition-colors duration-300 ${
                           isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                        }`}>
                           <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                              Popular
                           </div>
                           <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>Professional</h3>
                           <div className={`text-4xl font-bold mb-6 transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>
                              $29<span className="text-xl text-gray-500">/month</span>
                           </div>
                           <ul className="space-y-3 text-lg">
                              <li className={`flex items-center transition-colors duration-300 ${
                                 isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                 <span className="text-green-500 mr-3">✓</span>
                                 Unlimited projects
                              </li>
                              <li className={`flex items-center transition-colors duration-300 ${
                                 isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                 <span className="text-green-500 mr-3">✓</span>
                                 Advanced analytics
                              </li>
                              <li className={`flex items-center transition-colors duration-300 ${
                                 isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                 <span className="text-green-500 mr-3">✓</span>
                                 Priority support
                              </li>
                              <li className={`flex items-center transition-colors duration-300 ${
                                 isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                 <span className="text-green-500 mr-3">✓</span>
                                 Custom workflows
                              </li>
                           </ul>
                        </div>
                        
                        <div className={`p-8 rounded-2xl border-2 transition-colors duration-300 ${
                           isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                        }`}>
                           <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>Enterprise</h3>
                           <div className={`text-4xl font-bold mb-6 transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>Custom</div>
                           <ul className="space-y-3 text-lg">
                              <li className={`flex items-center transition-colors duration-300 ${
                                 isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                 <span className="text-green-500 mr-3">✓</span>
                                 Everything in Pro
                              </li>
                              <li className={`flex items-center transition-colors duration-300 ${
                                 isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                 <span className="text-green-500 mr-3">✓</span>
                                 White-label solution
                              </li>
                              <li className={`flex items-center transition-colors duration-300 ${
                                 isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                 <span className="text-green-500 mr-3">✓</span>
                                 Dedicated support
                              </li>
                              <li className={`flex items-center transition-colors duration-300 ${
                                 isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                 <span className="text-green-500 mr-3">✓</span>
                                 Custom integrations
                              </li>
                           </ul>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'support' && (
                  <div className="space-y-8">
                     <h2 className={`text-3xl font-bold text-center mb-8 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>Get Support</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className={`p-8 rounded-2xl transition-colors duration-300 ${
                           isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                        }`}>
                           <h3 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>📧 Email Support</h3>
                           <p className={`mb-4 transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                           }`}>
                              Get help via email with our dedicated support team.
                           </p>
                           <a href="mailto:support@dost-pmns.com" className="text-blue-600 dark:text-blue-400 font-medium">
                              support@dost-pmns.com
                           </a>
                        </div>
                        
                        <div className={`p-8 rounded-2xl transition-colors duration-300 ${
                           isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                        }`}>
                           <h3 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>📚 Documentation</h3>
                           <p className={`mb-4 transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                           }`}>
                              Comprehensive guides and tutorials to help you get started.
                           </p>
                           <a href="#" className="text-blue-600 dark:text-blue-400 font-medium">
                              View Documentation →
                           </a>
                        </div>
                        
                        <div className={`p-8 rounded-2xl transition-colors duration-300 ${
                           isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                        }`}>
                           <h3 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>💬 Live Chat</h3>
                           <p className={`mb-4 transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                           }`}>
                              Chat with our support team in real-time.
                           </p>
                           <button className="text-blue-600 dark:text-blue-400 font-medium">
                              Start Chat →
                           </button>
                        </div>
                        
                        <div className={`p-8 rounded-2xl transition-colors duration-300 ${
                           isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                        }`}>
                           <h3 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>🎓 Training</h3>
                           <p className={`mb-4 transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                           }`}>
                              Get personalized training for your team.
                           </p>
                           <button className="text-blue-600 dark:text-blue-400 font-medium">
                              Schedule Training →
                           </button>
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
               <div className={`inline-flex flex-col sm:flex-row gap-4 items-center p-8 rounded-2xl transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
               }`}>
                  <div className="text-center sm:text-left">
                     <h3 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>Ready to get started?</h3>
                     <p className={`transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                     }`}>Contact us today to learn more about DOST-PMNS!</p>
                  </div>
                  <div className="flex gap-3">
                     <Button 
                        variant="outline" 
                        size="lg"
                        onClick={handleBackToHome}
                        className="px-8 py-3"
                     >
                        Back to Home
                     </Button>
                     <Button 
                        variant="primary" 
                        size="lg"
                        className="px-8 py-3"
                     >
                        Get Started
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default LearnMorePage
