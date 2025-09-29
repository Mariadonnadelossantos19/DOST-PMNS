import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, DataTable } from '../UI';

const PendingActivations = () => {
   const [pendingProponents, setPendingProponents] = useState([]);
   const [pendingLoading, setPendingLoading] = useState(false);
   const [activatingId, setActivatingId] = useState(null);

   // Fetch pending proponents for activation
   const fetchPendingProponents = async () => {
      try {
         setPendingLoading(true);
         console.log('Fetching pending proponents...');
         const response = await fetch('http://localhost:4000/api/users/psto/pending-proponents', {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });
         
         console.log('Response status:', response.status);
         if (response.ok) {
            const data = await response.json();
            console.log('Pending proponents data:', data);
            setPendingProponents(data.proponents || []);
         } else {
            const errorData = await response.json();
            console.error('Failed to load pending proponents:', errorData);
         }
      } catch (err) {
         console.error('Error loading pending proponents:', err);
      } finally {
         setPendingLoading(false);
      }
   };

   // Activate proponent account
   const activateProponent = async (proponentId) => {
      try {
         setActivatingId(proponentId);
         console.log('Activating proponent:', proponentId);
         const response = await fetch(`http://localhost:4000/api/users/psto/activate-proponent/${proponentId}`, {
            method: 'PATCH',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
               'Content-Type': 'application/json'
            }
         });
         
         console.log('Activation response status:', response.status);
         if (response.ok) {
            const data = await response.json();
            console.log('Activation successful:', data);
            alert(`Proponent ${data.proponent.name} activated successfully!`);
            // Refresh the list
            fetchPendingProponents();
         } else {
            const errorData = await response.json();
            console.error('Activation failed:', errorData);
            alert(`Failed to activate proponent: ${errorData.message}`);
         }
      } catch (err) {
         console.error('Error activating proponent:', err);
         alert('Error activating proponent: ' + err.message);
      } finally {
         setActivatingId(null);
      }
   };

   useEffect(() => {
      fetchPendingProponents();
   }, []);

   // Define table columns
   const columns = [
      {
         key: 'name',
         header: 'Name',
         render: (proponent) => (
            <div>
               <div className="font-medium text-gray-900">
                  {proponent.firstName} {proponent.lastName}
               </div>
               <div className="text-sm text-gray-500">{proponent.email}</div>
            </div>
         )
      },
      {
         key: 'business',
         header: 'Business/Organization',
         render: (proponent) => (
            <div>
               {proponent.proponentInfo?.businessName ? (
                  <div>
                     <div className="font-medium text-gray-900">{proponent.proponentInfo.businessName}</div>
                     <div className="text-sm text-gray-500">{proponent.proponentInfo.organizationType}</div>
                  </div>
               ) : (
                  <span className="text-gray-400 italic">Not provided</span>
               )}
            </div>
         )
      },
      {
         key: 'province',
         header: 'Province',
         render: (proponent) => (
            <span className="text-gray-900">{proponent.province}</span>
         )
      },
      {
         key: 'phone',
         header: 'Contact',
         render: (proponent) => (
            <div>
               {proponent.proponentInfo?.phone ? (
                  <span className="text-gray-900">{proponent.proponentInfo.phone}</span>
               ) : (
                  <span className="text-gray-400 italic">Not provided</span>
               )}
            </div>
         )
      },
      {
         key: 'registered',
         header: 'Registered',
         render: (proponent) => (
            <span className="text-gray-900">
               {new Date(proponent.createdAt).toLocaleDateString()}
            </span>
         )
      },
      {
         key: 'status',
         header: 'Status',
         render: () => (
            <Badge className="bg-yellow-100 text-yellow-800">
               PENDING
            </Badge>
         )
      }
   ];

   // Define table actions
   const getActions = (proponent) => (
      <div className="flex space-x-2">
         <Button
            onClick={() => activateProponent(proponent._id)}
            disabled={activatingId === proponent._id}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
         >
            {activatingId === proponent._id ? 'Activating...' : 'Activate Account'}
         </Button>
         <Button
            onClick={() => {
               // TODO: Implement view details modal
               console.log('View details for:', proponent._id);
            }}
            variant="outline"
            size="sm"
         >
            View Details
         </Button>
      </div>
   );

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold text-gray-900">Pending Proponent Activations</h2>
               <p className="text-gray-600 mt-1">Review and activate proponent accounts</p>
            </div>
            <Button onClick={fetchPendingProponents} disabled={pendingLoading}>
               {pendingLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
         </div>

         {pendingProponents.length === 0 && !pendingLoading ? (
            <Card className="p-8 text-center">
               <div className="text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">No Pending Activations</h3>
                  <p className="text-sm">All proponents are currently active or no new registrations found.</p>
                  <p className="text-xs text-gray-400 mt-2">Check the console for debugging information.</p>
               </div>
            </Card>
         ) : (
            <DataTable
               data={pendingProponents}
               columns={columns}
               actions={getActions}
               loading={pendingLoading}
               emptyMessage="No pending proponent activations found. All proponents are currently active or no new registrations."
            />
         )}
      </div>
   );
};

export default PendingActivations;
