import React, { useState, useEffect, useRef } from 'react';
import { ProponentDashboard, ProponentRegistrationForm, EnterpriseProfile } from '../Components';
import { ProgramSelection } from '../../../Component/ProgramSelection';
import { MultiStepForm, ApplicationStatusTracker } from '../../../Component/ProgramApplication';
import ProponentTNAViewer from '../../../Component/ProgramApplication/components/ProponentTNAViewer';
import ApplicationMonitor from '../../../Component/ProgramApplication/ApplicationMonitor';
import NotificationsPage from '../../NotificationsPage';
import { Button, Card, Modal } from '../../../Component/UI';

const ProponentMainPage = ({ onNavigateToProfile, currentUser, currentPath = '/applications' }) => {
   const [userData, setUserData] = useState(null);
   const [showRegistrationForm, setShowRegistrationForm] = useState(false);
   const [loading, setLoading] = useState(true);
   const [showProfileModal, setShowProfileModal] = useState(false);
   const [showEnterpriseProfile, setShowEnterpriseProfile] = useState(false);
   const [showProgramSelection, setShowProgramSelection] = useState(false);
   const [showApplicationForm, setShowApplicationForm] = useState(false);
   const [selectedProgram, setSelectedProgram] = useState(null);
   const [applications, setApplications] = useState([]);

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

   // Fetch applications when user data is available
   useEffect(() => {
      console.log('ProponentMainPage: useEffect triggered, userData:', userData);
      if (userData) {
         console.log('ProponentMainPage: userData available, calling fetchApplications');
         fetchApplications();
      } else {
         console.log('ProponentMainPage: userData not available yet');
      }
   }, [userData]);


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

   // Fetch applications for the proponent
   const fetchApplications = async () => {
      try {
         console.log('ProponentMainPage: Fetching applications...');
         const token = localStorage.getItem('authToken');
         if (!token) {
            console.log('ProponentMainPage: No auth token found');
            return;
         }

         console.log('ProponentMainPage: Making API call to fetch applications');
         const response = await fetch('http://localhost:4000/api/programs/setup/my-applications', {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         console.log('ProponentMainPage: API response status:', response.status);
         if (response.ok) {
            const data = await response.json();
            console.log('ProponentMainPage: API response data:', data);
            setApplications(data.applications || []);
            console.log('ProponentMainPage: Set applications:', data.applications || []);
         } else {
            console.error('ProponentMainPage: API call failed with status:', response.status);
         }
      } catch (error) {
         console.error('Error fetching applications:', error);
      }
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
            
            // Refresh applications
            fetchApplications();
         } else {
            alert(`Error submitting application: ${result.message}`);
         }
      } catch (error) {
         console.error('Error submitting application:', error);
         alert('Error submitting application. Please try again.');
      }
   };


   // Render content based on current path
   const renderContent = () => {
      console.log('ProponentMainPage renderContent - currentPath:', currentPath);
      
      // Handle specific forms first, as they are modal-like or full-page overrides
      if (showRegistrationForm) {
         return <ProponentRegistrationForm currentUser={currentUser} handleLoginSuccess={handleLoginSuccess} setShowRegistrationForm={setShowRegistrationForm} />;
      }
      if (showApplicationForm) {
         return <MultiStepForm currentUser={currentUser} setShowApplicationForm={setShowApplicationForm} />;
      }
      if (showEnterpriseProfile) {
         return <EnterpriseProfile currentUser={currentUser} setShowEnterpriseProfile={setShowEnterpriseProfile} />;
      }

      // Then handle sidebar navigation
      switch (currentPath) {
         case '/proponent-dashboard':
            // This is the main proponent dashboard with overview and quick actions
            return (
               <div className="container mx-auto p-6">
                  <div className="flex justify-between items-center mb-6">
                     <h1 className="text-3xl font-bold text-gray-800">Proponent Dashboard</h1>
                     <Button onClick={() => setShowApplicationForm(true)} className="bg-blue-600 hover:bg-blue-700">
                        New Application
                     </Button>
                  </div>
                  
                  {/* Dashboard Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                     <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                           <div className="p-2 bg-blue-100 rounded-lg">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                           </div>
                           <div className="ml-4">
                              <p className="text-sm font-medium text-gray-600">Total Applications</p>
                              <p className="text-2xl font-semibold text-gray-900">{applications.length}</p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                           <div className="p-2 bg-green-100 rounded-lg">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                           </div>
                           <div className="ml-4">
                              <p className="text-sm font-medium text-gray-600">Approved</p>
                              <p className="text-2xl font-semibold text-gray-900">
                                 {applications.filter(app => app.status === 'psto_approved').length}
                              </p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                           <div className="p-2 bg-yellow-100 rounded-lg">
                              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                           </div>
                           <div className="ml-4">
                              <p className="text-sm font-medium text-gray-600">Pending</p>
                              <p className="text-2xl font-semibold text-gray-900">
                                 {applications.filter(app => app.status === 'pending' || app.status === 'under_review').length}
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  {/* Recent Applications */}
                  {applications.length > 0 && (
                     <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                           <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                        </div>
                        <div className="p-6">
                           <div className="space-y-4">
                              {applications.slice(0, 3).map((application) => (
                                 <div key={application._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                       <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                       </div>
                                       <div>
                                          <h3 className="font-medium text-gray-900">{application.programName} Application</h3>
                                          <p className="text-sm text-gray-600">
                                             Submitted: {new Date(application.createdAt).toLocaleDateString()}
                                          </p>
                                       </div>
                                    </div>
                                    <ApplicationStatusTracker application={application} />
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}
                  
                  {applications.length === 0 && (
                     <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No Applications Yet</h3>
                        <p className="text-gray-600 mb-6">Start by creating your first program application</p>
                        <Button onClick={() => setShowApplicationForm(true)} className="bg-blue-600 hover:bg-blue-700">
                           Create Application
                        </Button>
                     </div>
                  )}
               </div>
            );
         case '/applications':
         case '/my-applications':
            // This is the default dashboard view with "New Application" button and application list
            return (
               <div className="container mx-auto p-6">
                  <div className="flex justify-between items-center mb-6">
                     <h1 className="text-3xl font-bold text-gray-800">My Applications</h1>
                     <Button onClick={() => setShowApplicationForm(true)} className="bg-blue-600 hover:bg-blue-700">
                        New Application
                     </Button>
                  </div>
                  {loading && <p>Loading applications...</p>}
                  {applications.length === 0 && !loading && (
                     <div className="text-center py-10">
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
                        <p className="mb-4">Start by creating your first program application</p>
                        <Button onClick={() => setShowApplicationForm(true)} className="bg-blue-600 hover:bg-blue-700">
                           Create Application
                        </Button>
                     </div>
                  )}
                  {applications.length > 0 && (
                     <div className="space-y-4">
                        {applications.map((application) => (
                           <div key={application._id} className="space-y-4">
                              <Card className="p-4">
                                 <div className="flex justify-between items-start">
                                    <div>
                                       <h3 className="font-medium text-gray-900">
                                          {application.programName} Application
                                       </h3>
                                       <p className="text-sm text-gray-600">
                                          Submitted: {new Date(application.createdAt).toLocaleDateString()}
                                       </p>
                                    </div>
                                    <ApplicationStatusTracker application={application} />
                                 </div>
                              </Card>
                              
                              {/* TNA Viewer for approved applications */}
                              <ProponentTNAViewer application={application} />
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            );
         case '/monitoring':
         case '/application-monitoring':
            return <ApplicationMonitor currentUser={currentUser} />;
         case '/notifications':
            return <NotificationsPage currentUser={currentUser} />;
         case '/reports':
            return (
               <div className="container mx-auto p-6">
                  <h1 className="text-3xl font-bold text-gray-800 mb-6">Reports</h1>
                  <div className="bg-white rounded-lg shadow p-6">
                     <p className="text-gray-600">Reports functionality will be available here.</p>
                  </div>
               </div>
            );
         case '/settings':
            return (
               <div className="container mx-auto p-6">
                  <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>
                  <div className="bg-white rounded-lg shadow p-6">
                     <p className="text-gray-600">User settings will be managed here.</p>
                  </div>
               </div>
            );
         default:
            // Default to the Proponent Dashboard if path is not recognized
            console.log('ProponentMainPage - Using default case for currentPath:', currentPath);
            return (
               <div className="container mx-auto p-6">
                  <div className="flex justify-between items-center mb-6">
                     <h1 className="text-3xl font-bold text-gray-800">Proponent Dashboard</h1>
                     <Button onClick={() => setShowApplicationForm(true)} className="bg-blue-600 hover:bg-blue-700">
                        New Application
                     </Button>
                  </div>
                  {loading && <p>Loading applications...</p>}
                  {applications.length === 0 && !loading && (
                     <div className="text-center py-10">
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
                        <p className="mb-4">Start by creating your first program application</p>
                        <Button onClick={() => setShowApplicationForm(true)} className="bg-blue-600 hover:bg-blue-700">
                           Create Application
                        </Button>
                     </div>
                  )}
                  {applications.length > 0 && (
                     <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Your Applications</h2>
                        {applications.map((application) => (
                           <div key={application._id} className="space-y-4">
                              <Card className="p-4">
                                 <div className="flex justify-between items-start">
                                    <div>
                                       <h3 className="font-medium text-gray-900">
                                          {application.programName} Application
                                       </h3>
                                       <p className="text-sm text-gray-600">
                                          Submitted: {new Date(application.createdAt).toLocaleDateString()}
                                       </p>
                                    </div>
                                    <ApplicationStatusTracker application={application} />
                                 </div>
                              </Card>
                              
                              {/* TNA Viewer for approved applications */}
                              <ProponentTNAViewer application={application} />
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            );
      }
   };

   if (loading) {
      return (
         <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
         </div>
      );
   }

   // If user is logged in as proponent, show dashboard content only
   if (userData) {
      return (
         <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
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
                     renderContent()
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
