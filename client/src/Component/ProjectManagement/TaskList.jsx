import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Input } from '../UI';

const TaskList = ({ 
   tasks = [], 
   onTaskUpdate, 
   onTaskDelete, 
   onTaskCreate,
   projectId,
   className = '' 
}) => {
   const [selectedTask, setSelectedTask] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
   const [newTask, setNewTask] = useState({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      assignee: '',
      dueDate: ''
   });

   const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
         case 'todo':
         case 'pending':
            return 'default';
         case 'in progress':
         case 'in-progress':
            return 'primary';
         case 'completed':
         case 'done':
            return 'success';
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
      if (!date) return 'No due date';
      return new Date(date).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'short',
         day: 'numeric'
      });
   };

   const handleTaskClick = (task) => {
      setSelectedTask(task);
      setIsModalOpen(true);
   };

   const handleStatusChange = (taskId, newStatus) => {
      onTaskUpdate?.(taskId, { status: newStatus });
   };

   const handleCreateTask = () => {
      if (newTask.title.trim()) {
         onTaskCreate?.({ ...newTask, projectId });
         setNewTask({
            title: '',
            description: '',
            priority: 'medium',
            status: 'todo',
            assignee: '',
            dueDate: ''
         });
         setIsCreateModalOpen(false);
      }
   };

   const groupedTasks = tasks.reduce((acc, task) => {
      const status = task.status || 'todo';
      if (!acc[status]) {
         acc[status] = [];
      }
      acc[status].push(task);
      return acc;
   }, {});

   const statusColumns = [
      { key: 'todo', label: 'To Do', color: 'bg-gray-100' },
      { key: 'in-progress', label: 'In Progress', color: 'bg-blue-100' },
      { key: 'completed', label: 'Completed', color: 'bg-green-100' }
   ];

   return (
      <div className={className}>
         {/* Header */}
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
            <Button 
               onClick={() => setIsCreateModalOpen(true)}
               icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
               }
            >
               Add Task
            </Button>
         </div>

         {/* Kanban Board */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statusColumns.map((column) => (
               <div key={column.key} className="space-y-4">
                  <div className={`p-3 rounded-lg ${column.color}`}>
                     <h3 className="font-medium text-gray-900">{column.label}</h3>
                     <span className="text-sm text-gray-600">
                        {groupedTasks[column.key]?.length || 0} tasks
                     </span>
                  </div>
                  
                  <div className="space-y-3">
                     {(groupedTasks[column.key] || []).map((task) => (
                        <Card 
                           key={task.id} 
                           className="cursor-pointer hover:shadow-md transition-shadow"
                           onClick={() => handleTaskClick(task)}
                        >
                           <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                 <h4 className="font-medium text-gray-900 line-clamp-2">
                                    {task.title}
                                 </h4>
                                 <Badge variant={getPriorityColor(task.priority)} size="sm">
                                    {task.priority}
                                 </Badge>
                              </div>
                              
                              {task.description && (
                                 <p className="text-sm text-gray-600 line-clamp-2">
                                    {task.description}
                                 </p>
                              )}
                              
                              <div className="flex justify-between items-center text-xs text-gray-500">
                                 <span>{formatDate(task.dueDate)}</span>
                                 {task.assignee && (
                                    <span className="bg-gray-100 px-2 py-1 rounded">
                                       {task.assignee}
                                    </span>
                                 )}
                              </div>
                              
                              <div className="flex gap-2">
                                 {statusColumns.map((status) => (
                                    <Button
                                       key={status.key}
                                       variant={task.status === status.key ? 'primary' : 'outline'}
                                       size="sm"
                                       className="text-xs"
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          handleStatusChange(task.id, status.key);
                                       }}
                                    >
                                       {status.label}
                                    </Button>
                                 ))}
                              </div>
                           </div>
                        </Card>
                     ))}
                  </div>
               </div>
            ))}
         </div>

         {/* Task Detail Modal */}
         <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={selectedTask?.title}
            size="lg"
         >
            {selectedTask && (
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                     </label>
                     <p className="text-sm text-gray-600">
                        {selectedTask.description || 'No description'}
                     </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                           Priority
                        </label>
                        <Badge variant={getPriorityColor(selectedTask.priority)}>
                           {selectedTask.priority}
                        </Badge>
                     </div>
                     
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                           Status
                        </label>
                        <Badge variant={getStatusColor(selectedTask.status)}>
                           {selectedTask.status}
                        </Badge>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                           Assignee
                        </label>
                        <p className="text-sm text-gray-600">
                           {selectedTask.assignee || 'Unassigned'}
                        </p>
                     </div>
                     
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                           Due Date
                        </label>
                        <p className="text-sm text-gray-600">
                           {formatDate(selectedTask.dueDate)}
                        </p>
                     </div>
                  </div>
               </div>
            )}
         </Modal>

         {/* Create Task Modal */}
         <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Create New Task"
         >
            <div className="space-y-4">
               <Input
                  label="Task Title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                  required
               />
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Description
                  </label>
                  <textarea
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     rows={3}
                     value={newTask.description}
                     onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                     placeholder="Enter task description"
                  />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                     </label>
                     <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                     >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                     </select>
                  </div>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date
                     </label>
                     <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                     />
                  </div>
               </div>
               
               <Input
                  label="Assignee"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  placeholder="Enter assignee name"
               />
            </div>
            
            <Modal.Footer>
               <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
               </Button>
               <Button onClick={handleCreateTask}>
                  Create Task
               </Button>
            </Modal.Footer>
         </Modal>
      </div>
   );
};

export default TaskList;
