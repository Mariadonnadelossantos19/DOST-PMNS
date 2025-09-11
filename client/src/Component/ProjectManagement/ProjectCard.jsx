import React from 'react';
import { Card, Badge, Button } from '../UI';

const ProjectCard = ({ 
   project, 
   onEdit, 
   onDelete, 
   onView,
   className = '' 
}) => {
   const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
         case 'active':
         case 'in progress':
            return 'primary';
         case 'completed':
         case 'done':
            return 'success';
         case 'on hold':
         case 'paused':
            return 'warning';
         case 'cancelled':
            return 'danger';
         default:
            return 'default';
      }
   };

   const getPriorityColor = (priority) => {
      switch (priority?.toLowerCase()) {
         case 'high':
         case 'urgent':
            return 'danger';
         case 'medium':
         case 'normal':
            return 'warning';
         case 'low':
            return 'success';
         default:
            return 'default';
      }
   };

   const formatDate = (date) => {
      if (!date) return 'No date';
      return new Date(date).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'short',
         day: 'numeric'
      });
   };

   const calculateProgress = (completed, total) => {
      if (!total || total === 0) return 0;
      return Math.round((completed / total) * 100);
   };

   return (
      <Card className={`hover:shadow-lg transition-all duration-200 ${className}`}>
         <Card.Header>
            <div className="flex items-start justify-between">
               <div className="flex-1">
                  <Card.Title className="text-lg mb-2">{project.name}</Card.Title>
                  <Card.Description className="line-clamp-2">
                     {project.description || 'No description available'}
                  </Card.Description>
               </div>
               <div className="flex gap-2 ml-4">
                  <Badge variant={getStatusColor(project.status)} size="sm">
                     {project.status}
                  </Badge>
                  <Badge variant={getPriorityColor(project.priority)} size="sm">
                     {project.priority}
                  </Badge>
               </div>
            </div>
         </Card.Header>

         <Card.Content>
            {/* Progress Bar */}
            <div className="mb-4">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">
                     {project.completedTasks || 0} / {project.totalTasks || 0} tasks
                  </span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                     className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                     style={{ width: `${calculateProgress(project.completedTasks, project.totalTasks)}%` }}
                  ></div>
               </div>
               <div className="text-right mt-1">
                  <span className="text-xs text-gray-500">
                     {calculateProgress(project.completedTasks, project.totalTasks)}%
                  </span>
               </div>
            </div>

            {/* Project Details */}
            <div className="space-y-2 mb-4">
               <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Start: {formatDate(project.startDate)}</span>
               </div>
               <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Due: {formatDate(project.endDate)}</span>
               </div>
               <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Team: {project.teamSize || 0} members</span>
               </div>
            </div>

            {/* Team Members Preview */}
            {project.teamMembers && project.teamMembers.length > 0 && (
               <div className="mb-4">
                  <div className="flex items-center mb-2">
                     <span className="text-sm font-medium text-gray-700">Team</span>
                  </div>
                  <div className="flex -space-x-2">
                     {project.teamMembers.slice(0, 4).map((member, index) => (
                        <div 
                           key={index}
                           className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold border-2 border-white"
                           title={member.name}
                        >
                           {member.name?.charAt(0) || 'U'}
                        </div>
                     ))}
                     {project.teamMembers.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-semibold border-2 border-white">
                           +{project.teamMembers.length - 4}
                        </div>
                     )}
                  </div>
               </div>
            )}
         </Card.Content>

         <Card.Footer>
            <div className="flex justify-between items-center w-full">
               <div className="text-xs text-gray-500">
                  Created {formatDate(project.createdAt)}
               </div>
               <div className="flex gap-2">
                  <Button 
                     variant="outline" 
                     size="sm"
                     onClick={() => onView?.(project)}
                  >
                     View
                  </Button>
                  <Button 
                     variant="outline" 
                     size="sm"
                     onClick={() => onEdit?.(project)}
                  >
                     Edit
                  </Button>
                  <Button 
                     variant="danger" 
                     size="sm"
                     onClick={() => onDelete?.(project)}
                  >
                     Delete
                  </Button>
               </div>
            </div>
         </Card.Footer>
      </Card>
   );
};

export default ProjectCard;
