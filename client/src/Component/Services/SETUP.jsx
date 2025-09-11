import React, { useState } from 'react';
import { Card, Button, Badge, Alert } from '../UI';

const SETUP = () => {
   const [activeTab, setActiveTab] = useState('overview');
   const [showApplication, setShowApplication] = useState(false);
   const [applicationData, setApplicationData] = useState({
      companyName: '',
      businessType: '',
      currentTechnology: '',
      desiredUpgrade: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      employees: '',
      annualRevenue: '',
      technologyNeeds: '',
      expectedOutcome: ''
   });

   const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'services', label: 'Services' },
      { id: 'eligibility', label: 'Eligibility' },
      { id: 'application', label: 'Application' },
      { id: 'success-stories', label: 'Success Stories' }
   ];

   const technologyCategories = [
      {
         id: 'manufacturing',
         name: 'Manufacturing Technology',
         description: 'Advanced manufacturing equipment and automation systems',
         icon: '🏭',
         benefits: ['Increased productivity', 'Quality improvement', 'Cost reduction']
      },
      {
         id: 'digital',
         name: 'Digital Transformation',
         description: 'Digital tools and software solutions for business operations',
         icon: '💻',
         benefits: ['Process automation', 'Data management', 'Customer engagement']
      },
      {
         id: 'energy',
         name: 'Energy Efficiency',
         description: 'Green technology and energy-saving solutions',
         icon: '⚡',
         benefits: ['Reduced energy costs', 'Environmental compliance', 'Sustainability']
      },
      {
         id: 'quality',
         name: 'Quality Control',
         description: 'Testing equipment and quality assurance systems',
         icon: '🔍',
         benefits: ['Product quality', 'Standards compliance', 'Customer satisfaction']
      }
   ];

   const successStories = [
      {
         company: 'ABC Manufacturing Corp.',
         industry: 'Food Processing',
         technology: 'Automated Packaging System',
         impact: 'Increased production by 40% and reduced labor costs by 30%',
         investment: '₱2.5M',
         roi: '18 months'
      },
      {
         company: 'XYZ Services Inc.',
         industry: 'IT Services',
         technology: 'Cloud Infrastructure',
         impact: 'Improved service delivery and expanded client base by 60%',
         investment: '₱1.8M',
         roi: '12 months'
      }
   ];

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setApplicationData(prev => ({
         ...prev,
         [name]: value
      }));
   };

   const handleSubmitApplication = (e) => {
      e.preventDefault();
      // Handle application submission
      console.log('Application submitted:', applicationData);
      setShowApplication(false);
   };

   const renderOverview = () => (
      <div className="space-y-6">
         <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
               Small Enterprises Technology Upgrading Program (SETUP)
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
               SETUP is DOST's flagship program designed to help small and medium enterprises 
               (SMEs) improve their competitiveness through technology upgrading. The program 
               provides financial assistance, technical support, and expert guidance to help 
               businesses adopt modern technologies and enhance their operational efficiency.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
               <div className="text-4xl mb-4">🎯</div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">Targeted Support</h3>
               <p className="text-gray-600">
                  Focused assistance for SMEs in technology adoption and upgrading
               </p>
            </Card>
            <Card className="text-center p-6">
               <div className="text-4xl mb-4">💰</div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Assistance</h3>
               <p className="text-gray-600">
                  Cost-sharing arrangements to make technology accessible
               </p>
            </Card>
            <Card className="text-center p-6">
               <div className="text-4xl mb-4">🔧</div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">Technical Support</h3>
               <p className="text-gray-600">
                  Expert guidance and ongoing technical assistance
               </p>
            </Card>
         </div>
      </div>
   );

   const renderServices = () => (
      <div className="space-y-6">
         <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Technology Categories</h2>
            <p className="text-gray-600">
               Choose from our comprehensive range of technology upgrading services
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {technologyCategories.map((category) => (
               <Card key={category.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                     <div className="text-3xl">{category.icon}</div>
                     <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                           {category.name}
                        </h3>
                        <p className="text-gray-600 mb-4">{category.description}</p>
                        <div className="space-y-2">
                           <h4 className="text-sm font-medium text-gray-700">Key Benefits:</h4>
                           <ul className="space-y-1">
                              {category.benefits.map((benefit, index) => (
                                 <li key={index} className="text-sm text-gray-600 flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    {benefit}
                                 </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                  </div>
               </Card>
            ))}
         </div>
      </div>
   );

   const renderEligibility = () => (
      <div className="space-y-6">
         <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Eligibility Requirements</h2>
            <p className="text-gray-600">
               Check if your enterprise qualifies for SETUP assistance
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">General Requirements</h3>
               <ul className="space-y-3">
                  <li className="flex items-start">
                     <span className="text-green-500 mr-2">✓</span>
                     <span className="text-gray-700">Registered business entity (SEC, DTI, or CDA)</span>
                  </li>
                  <li className="flex items-start">
                     <span className="text-green-500 mr-2">✓</span>
                     <span className="text-gray-700">At least 3 years in operation</span>
                  </li>
                  <li className="flex items-start">
                     <span className="text-green-500 mr-2">✓</span>
                     <span className="text-gray-700">Annual revenue of ₱500K to ₱100M</span>
                  </li>
                  <li className="flex items-start">
                     <span className="text-green-500 mr-2">✓</span>
                     <span className="text-gray-700">At least 10 employees</span>
                  </li>
                  <li className="flex items-start">
                     <span className="text-green-500 mr-2">✓</span>
                     <span className="text-gray-700">Willingness to co-invest in technology</span>
                  </li>
               </ul>
            </Card>

            <Card className="p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Sectors</h3>
               <ul className="space-y-3">
                  <li className="flex items-start">
                     <span className="text-blue-500 mr-2">•</span>
                     <span className="text-gray-700">Food Processing</span>
                  </li>
                  <li className="flex items-start">
                     <span className="text-blue-500 mr-2">•</span>
                     <span className="text-gray-700">Manufacturing</span>
                  </li>
                  <li className="flex items-start">
                     <span className="text-blue-500 mr-2">•</span>
                     <span className="text-gray-700">Information Technology</span>
                  </li>
                  <li className="flex items-start">
                     <span className="text-blue-500 mr-2">•</span>
                     <span className="text-gray-700">Agriculture</span>
                  </li>
                  <li className="flex items-start">
                     <span className="text-blue-500 mr-2">•</span>
                     <span className="text-gray-700">Health & Wellness</span>
                  </li>
                  <li className="flex items-start">
                     <span className="text-blue-500 mr-2">•</span>
                     <span className="text-gray-700">Renewable Energy</span>
                  </li>
               </ul>
            </Card>
         </div>

         <Card className="p-6 bg-yellow-50 border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Notes</h3>
            <ul className="text-yellow-700 space-y-1">
               <li>• Applications are evaluated on a first-come, first-served basis</li>
               <li>• Maximum assistance is 70% of total project cost</li>
               <li>• Technology must be proven and commercially available</li>
               <li>• Implementation period should not exceed 18 months</li>
            </ul>
         </Card>
      </div>
   );

   const renderApplication = () => (
      <div className="space-y-6">
         <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Apply for SETUP</h2>
            <p className="text-gray-600">
               Start your technology upgrading journey with DOST SETUP
            </p>
         </div>

         {!showApplication ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Process</h3>
                  <ol className="space-y-3">
                     <li className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">1</span>
                        <span className="text-gray-700">Submit application form and required documents</span>
                     </li>
                     <li className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">2</span>
                        <span className="text-gray-700">Initial screening and eligibility verification</span>
                     </li>
                     <li className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">3</span>
                        <span className="text-gray-700">Technical evaluation and site visit</span>
                     </li>
                     <li className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">4</span>
                        <span className="text-gray-700">Project approval and funding release</span>
                     </li>
                     <li className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">5</span>
                        <span className="text-gray-700">Implementation and monitoring</span>
                     </li>
                  </ol>
               </Card>

               <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
                  <ul className="space-y-2">
                     <li className="flex items-center text-gray-700">
                        <span className="text-green-500 mr-2">✓</span>
                        Business registration documents
                     </li>
                     <li className="flex items-center text-gray-700">
                        <span className="text-green-500 mr-2">✓</span>
                        Financial statements (3 years)
                     </li>
                     <li className="flex items-center text-gray-700">
                        <span className="text-green-500 mr-2">✓</span>
                        Technology proposal
                     </li>
                     <li className="flex items-center text-gray-700">
                        <span className="text-green-500 mr-2">✓</span>
                        Cost-benefit analysis
                     </li>
                     <li className="flex items-center text-gray-700">
                        <span className="text-green-500 mr-2">✓</span>
                        Project timeline
                     </li>
                     <li className="flex items-center text-gray-700">
                        <span className="text-green-500 mr-2">✓</span>
                        Company profile
                     </li>
                  </ul>
               </Card>
            </div>
         ) : (
            <Card className="p-6">
               <form onSubmit={handleSubmitApplication} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Company Name *
                        </label>
                        <input
                           type="text"
                           name="companyName"
                           value={applicationData.companyName}
                           onChange={handleInputChange}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                           required
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Business Type *
                        </label>
                        <select
                           name="businessType"
                           value={applicationData.businessType}
                           onChange={handleInputChange}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                           required
                        >
                           <option value="">Select Business Type</option>
                           <option value="manufacturing">Manufacturing</option>
                           <option value="food-processing">Food Processing</option>
                           <option value="it-services">IT Services</option>
                           <option value="agriculture">Agriculture</option>
                           <option value="health">Health & Wellness</option>
                           <option value="other">Other</option>
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Contact Person *
                        </label>
                        <input
                           type="text"
                           name="contactPerson"
                           value={applicationData.contactPerson}
                           onChange={handleInputChange}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                           required
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Email Address *
                        </label>
                        <input
                           type="email"
                           name="email"
                           value={applicationData.email}
                           onChange={handleInputChange}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                           required
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Technology Needs Description *
                     </label>
                     <textarea
                        name="technologyNeeds"
                        value={applicationData.technologyNeeds}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe your current technology and what upgrades you need..."
                        required
                     />
                  </div>

                  <div className="flex justify-end space-x-4">
                     <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowApplication(false)}
                     >
                        Cancel
                     </Button>
                     <Button type="submit">
                        Submit Application
                     </Button>
                  </div>
               </form>
            </Card>
         )}

         {!showApplication && (
            <div className="text-center">
               <Button onClick={() => setShowApplication(true)} size="lg">
                  Start Application
               </Button>
            </div>
         )}
      </div>
   );

   const renderSuccessStories = () => (
      <div className="space-y-6">
         <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-gray-600">
               Real enterprises that have transformed through SETUP
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {successStories.map((story, index) => (
               <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                     <div>
                        <h3 className="text-lg font-semibold text-gray-900">{story.company}</h3>
                        <p className="text-gray-600">{story.industry}</p>
                     </div>
                     <Badge variant="success">Success</Badge>
                  </div>
                  
                  <div className="space-y-3">
                     <div>
                        <h4 className="font-medium text-gray-700">Technology Adopted:</h4>
                        <p className="text-gray-600">{story.technology}</p>
                     </div>
                     <div>
                        <h4 className="font-medium text-gray-700">Impact:</h4>
                        <p className="text-gray-600">{story.impact}</p>
                     </div>
                     <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                        <div>
                           <h4 className="font-medium text-gray-700">Investment:</h4>
                           <p className="text-gray-600">{story.investment}</p>
                        </div>
                        <div>
                           <h4 className="font-medium text-gray-700">ROI Period:</h4>
                           <p className="text-gray-600">{story.roi}</p>
                        </div>
                     </div>
                  </div>
               </Card>
            ))}
         </div>
      </div>
   );

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-3xl font-bold text-gray-900">SETUP</h1>
                  <p className="text-gray-600 mt-2">Small Enterprises Technology Upgrading Program</p>
               </div>
               <div className="text-right">
                  <div className="text-sm text-gray-500">Program Status</div>
                  <Badge variant="success">Active</Badge>
               </div>
            </div>
         </div>

         {/* Tabs */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
               <nav className="-mb-px flex space-x-8 px-6">
                  {tabs.map((tab) => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                           activeTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                     >
                        {tab.label}
                     </button>
                  ))}
               </nav>
            </div>

            <div className="p-6">
               {activeTab === 'overview' && renderOverview()}
               {activeTab === 'services' && renderServices()}
               {activeTab === 'eligibility' && renderEligibility()}
               {activeTab === 'application' && renderApplication()}
               {activeTab === 'success-stories' && renderSuccessStories()}
            </div>
         </div>
      </div>
   );
};

export default SETUP;
