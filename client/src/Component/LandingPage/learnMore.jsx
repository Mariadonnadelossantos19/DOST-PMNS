import React, { useState } from 'react'

const LearnMore = ({ isOpen, onClose }) => {
   const [activeTab, setActiveTab] = useState('features')

   if (!isOpen) return null

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

   return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
         <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
               <div className="flex items-center justify-between">
                  <div>
                     <h2 className="text-2xl font-bold">DOST-PMNS</h2>
                     <p className="text-blue-100 mt-1">Project Management & Notification System</p>
                  </div>
                  <button 
                     onClick={onClose}
                     className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  >
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>
               </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
               <div className="flex overflow-x-auto">
                  {tabs.map((tab) => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                           activeTab === tab.id
                              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                     >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                     </button>
                  ))}
               </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
               {activeTab === 'features' && (
                  <div className="space-y-6">
                     <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Key Features</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                           <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                              <div className="flex items-start space-x-4">
                                 <div className="text-2xl">{feature.icon}</div>
                                 <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                       {feature.title}
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
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
                  <div className="space-y-6">
                     <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Why Choose DOST-PMNS?</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {benefits.map((benefit, index) => (
                           <div key={index} className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {activeTab === 'pricing' && (
                  <div className="space-y-6">
                     <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pricing Plans</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                           <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Basic</h4>
                           <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Free</div>
                           <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                              <li>✓ Up to 5 projects</li>
                              <li>✓ Basic notifications</li>
                              <li>✓ Standard support</li>
                           </ul>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border-2 border-blue-500 relative">
                           <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                              Popular
                           </div>
                           <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Professional</h4>
                           <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">$29<span className="text-lg text-gray-500">/month</span></div>
                           <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                              <li>✓ Unlimited projects</li>
                              <li>✓ Advanced analytics</li>
                              <li>✓ Priority support</li>
                              <li>✓ Custom workflows</li>
                           </ul>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                           <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Enterprise</h4>
                           <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Custom</div>
                           <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                              <li>✓ Everything in Pro</li>
                              <li>✓ White-label solution</li>
                              <li>✓ Dedicated support</li>
                              <li>✓ Custom integrations</li>
                           </ul>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'support' && (
                  <div className="space-y-6">
                     <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Get Support</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                           <h4 className="font-semibold text-gray-900 dark:text-white mb-3">📧 Email Support</h4>
                           <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                              Get help via email with our dedicated support team.
                           </p>
                           <a href="mailto:support@dost-pmns.com" className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                              support@dost-pmns.com
                           </a>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                           <h4 className="font-semibold text-gray-900 dark:text-white mb-3">📚 Documentation</h4>
                           <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                              Comprehensive guides and tutorials to help you get started.
                           </p>
                           <a href="#" className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                              View Documentation →
                           </a>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                           <h4 className="font-semibold text-gray-900 dark:text-white mb-3">💬 Live Chat</h4>
                           <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                              Chat with our support team in real-time.
                           </p>
                           <button className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                              Start Chat →
                           </button>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                           <h4 className="font-semibold text-gray-900 dark:text-white mb-3">🎓 Training</h4>
                           <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                              Get personalized training for your team.
                           </p>
                           <button className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                              Schedule Training →
                           </button>
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
               <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                     Ready to get started? Contact us today!
                  </p>
                  <div className="flex space-x-3">
                     <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                     >
                        Close
                     </button>
                     <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                        Get Started
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default LearnMore