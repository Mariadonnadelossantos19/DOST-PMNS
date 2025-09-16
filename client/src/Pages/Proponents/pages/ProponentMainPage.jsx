import React, { useState, useEffect, useRef } from 'react';
import { ProponentDashboard, ProponentRegistrationForm, EnterpriseProfile } from '../Components';
import { ProgramSelection } from '../../../Component/ProgramSelection';
import { MultiStepForm } from '../../../Component/ProgramApplication';
import { Button, Card, Modal } from '../../../Component/UI';

const ProponentMainPage = ({ onNavigateToProfile }) => {
   const [userData, setUserData] = useState(null);
   const [showRegistrationForm, setShowRegistrationForm] = useState(false);
   const [loading, setLoading] = useState(true);
   const [showProfileModal, setShowProfileModal] = useState(false);
   const [showProgramSelection, setShowProgramSelection] = useState(false);
   const [showApplicationForm, setShowApplicationForm] = useState(false);
   const [selectedProgram, setSelectedProgram] = useState(null);

   // Debug modal state changes
   useEffect(() => {
      console.log('Modal state changed:', showProfileModal);
   }, [showProfileModal]);

   // Debug component mount
   useEffect(() => {
      console.log('ProponentMainPage mounted, initial modal state:', showProfileModal);
   }, []);

   // Handle navigation from header dropdown
   useEffect(() => {
      if (onNavigateToProfile) {
         console.log('Setting up navigation function');
         onNavigateToProfile(() => {
            console.log('Navigation function called, opening modal');
            setShowProfileModal(true);
         });
      }
   }, [onNavigateToProfile]);

   // Set up global function as backup
   useEffect(() => {
      window.openEnterpriseProfile = () => {
         setShowProfileModal(true);
      };
      
      return () => {
         delete window.openEnterpriseProfile;
      };
   }, []);

   // Listen for program selection event from sidebar
   useEffect(() => {
      const handleOpenProgramSelection = () => {
         setShowProgramSelection(true);
      };

      window.addEventListener('openProgramSelection', handleOpenProgramSelection);
      
      return () => {
         window.removeEventListener('openProgramSelection', handleOpenProgramSelection);
      };
   }, []);

   useEffect(() => {
      // Check if user is logged in
      const checkAuth = () => {
         const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
         const storedUserData = localStorage.getItem('userData');
         
         if (isLoggedIn && storedUserData) {
            try {
               const parsedData = JSON.parse(storedUserData);
               const user = parsedData.user || parsedData;
               
               if (user.role === 'proponent') {
                  setUserData({
                     id: user.id || user._id,
                     firstName: user.firstName,
                     lastName: user.lastName,
                     email: user.email,
                     province: user.province,
                     position: user.position,
                     role: user.role,
                     userId: user.userId
                  });
               } else {
                  // User is not a proponent, show registration form
                  setShowRegistrationForm(true);
               }
            } catch (error) {
               console.error('Error parsing user data:', error);
               setShowRegistrationForm(true);
            }
         } else {
            // Not logged in, show registration form
            setShowRegistrationForm(true);
         }
         setLoading(false);
      };

      checkAuth();
   }, []);


   const handleRegistrationSuccess = () => {
      setShowRegistrationForm(false);
      // Show success message or redirect
      alert('Account request submitted successfully! You will receive an email when your account is approved.');
   };

   const handleLogin = () => {
      // Redirect to login page or show login modal
      window.location.href = '/login';
   };

   const handleProgramSelect = (program) => {
      setSelectedProgram(program);
   };

   const handleProgramNext = () => {
      if (selectedProgram) {
         // Close program selection and show application form
         setShowProgramSelection(false);
         setShowApplicationForm(true);
         console.log('Selected program:', selectedProgram);
      }
   };

   const handleProgramBack = () => {
      setShowProgramSelection(false);
      setSelectedProgram(null);
   };

   const handleApplicationBack = () => {
      setShowApplicationForm(false);
      setShowProgramSelection(true);
   };

   const handleApplicationSubmit = async (applicationData) => {
      try {
         // Get auth token
         const token = localStorage.getItem('authToken');
         console.log('Auth token from localStorage:', token ? 'Token found' : 'No token');
         if (!token) {
            alert('Please log in to submit an application');
            return;
         }

         // Create FormData for file uploads
         const formData = new FormData();
         
         // Add all form fields
         Object.keys(applicationData).forEach(key => {
            if (key !== 'letterOfIntent' && key !== 'enterpriseProfile') {
               formData.append(key, applicationData[key]);
            }
         });
         
         // Add files
         if (applicationData.letterOfIntent) {
            formData.append('letterOfIntent', applicationData.letterOfIntent);
         }
         if (applicationData.enterpriseProfile) {
            formData.append('enterpriseProfile', applicationData.enterpriseProfile);
         }

         // Submit to server based on program type
         const programCode = applicationData.programCode.toLowerCase();
         console.log('Submitting to:', `http://localhost:4000/api/programs/${programCode}/submit`);
         console.log('Program code:', programCode);
         console.log('Form data keys:', Array.from(formData.keys()));
         
         const response = await fetch(`http://localhost:4000/api/programs/${programCode}/submit`, {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${token}`
            },
            body: formData
         });

         const result = await response.json();

         if (result.success) {
            alert(`Application submitted successfully! Your application ID is: ${result.data.applicationId}`);
            
            // Reset states
            setShowApplicationForm(false);
            setShowProgramSelection(false);
            setSelectedProgram(null);
         } else {
            alert(`Error submitting application: ${result.message}`);
         }
      } catch (error) {
         console.error('Error submitting application:', error);
         alert('Error submitting application. Please try again.');
      }
   };

   if (loading) {
      return (
         <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
         </div>
      );
   }

   // If user is logged in as proponent, show dashboard
   if (userData) {
      return (
         <div className="min-h-screen bg-gray-50">
            {/* Main Dashboard Content */}
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
               <div className="px-6">
                  {showApplicationForm ? (
                     <MultiStepForm
                        selectedProgram={selectedProgram}
                        onBack={handleApplicationBack}
                        onSubmit={handleApplicationSubmit}
                     />
                  ) : showProgramSelection ? (
                     <ProgramSelection
                        onProgramSelect={handleProgramSelect}
                        selectedProgram={selectedProgram}
                        onNext={handleProgramNext}
                        onBack={handleProgramBack}
                     />
                  ) : (
                     <ProponentDashboard 
                        userData={userData} 
                        onOpenProgramSelection={() => setShowProgramSelection(true)}
                     />
                  )}
               </div>
            </div>

            {/* Enterprise Profile Modal */}
            {showProfileModal && (
               <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Enterprise Profile</h2>
                        <button 
                           onClick={() => {
                              console.log('Closing modal from X button');
                              setShowProfileModal(false);
                           }}
                           className="text-gray-500 hover:text-gray-700"
                        >
                           ✕
                        </button>
                     </div>
                     <EnterpriseProfile />
                  </div>
               </div>
            )}
            
            {/* Debug indicator */}
            {showProfileModal && (
               <div className="fixed top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs z-50">
                  MODAL IS OPEN
               </div>
            )}
         </div>
      );
   }

   // If not logged in or not a proponent, show registration options
   return (
      <div className="min-h-screen bg-gray-50 py-12">
         <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
               <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  DOST MIMAROPA Proponent Portal
               </h1>
               <p className="text-xl text-gray-600">
                  Access DOST programs and services in MIMAROPA region
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Request Account Card */}
               <Card className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                     <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                     </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                     Request Proponent Account
                  </h2>
                  <p className="text-gray-600 mb-6">
                     Submit a request to your local PSTO for a proponent account. 
                     You'll need to provide business information and program preferences.
                  </p>
                  <Button
                     onClick={() => setShowRegistrationForm(true)}
                     className="bg-blue-600 hover:bg-blue-700 w-full"
                  >
                     Request Account
                  </Button>
               </Card>

               {/* Login Card */}
               <Card className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                     <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                     </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                     Already Have an Account?
                  </h2>
                  <p className="text-gray-600 mb-6">
                     If you already have a proponent account, login to access your dashboard 
                     and manage your enrollments.
                  </p>
                  <Button
                     onClick={handleLogin}
                     className="bg-green-600 hover:bg-green-700 w-full"
                  >
                     Login to Dashboard
                  </Button>
               </Card>
            </div>

            {/* Program Information */}
            <div className="mt-16">
               <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                  Available Programs
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="p-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-2">SETUP</h3>
                     <p className="text-sm text-gray-600">
                        Small Enterprise Technology Upgrading Program
                     </p>
                  </Card>
                  <Card className="p-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-2">GIA</h3>
                     <p className="text-sm text-gray-600">
                        Grants-in-Aid Program
                     </p>
                  </Card>
                  <Card className="p-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-2">CEST</h3>
                     <p className="text-sm text-gray-600">
                        Community Empowerment through Science and Technology
                     </p>
                  </Card>
                  <Card className="p-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-2">SSCP</h3>
                     <p className="text-sm text-gray-600">
                        Small Scale Commercialization Program
                     </p>
                  </Card>
               </div>
            </div>
         </div>

         {/* Registration Form Modal */}
         <ProponentRegistrationForm
            isOpen={showRegistrationForm}
            onClose={() => setShowRegistrationForm(false)}
            onSuccess={handleRegistrationSuccess}
         />
      </div>
   );
};

export default ProponentMainPage;
