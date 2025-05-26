import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { toast } from 'react-toastify'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'


const MainFeature = ({ 
  tasks, 
  projects, 
  onAddTask, 
  onUpdateTask, 
  onDeleteTask,
  viewMode,
  selectedProject 
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [sortBy, setSortBy] = useState('dueDate')
  const [filterBy, setFilterBy] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
    projectId: projects[0]?.id || ''
  })

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: 'pending',
      projectId: projects[0]?.id || ''
    })
    setShowCreateForm(false)
    setEditingTask(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error("Task title is required")
      return
    }

    if (editingTask) {
      onUpdateTask(editingTask.id, formData)
      toast.success("Task updated successfully!")
    } else {
      onAddTask(formData)
    }
    
    resetForm()
  }

  const handleEdit = (task) => {
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      priority: task.priority,
      status: task.status,
      projectId: task.projectId
    })
    setEditingTask(task)
    setShowCreateForm(true)
  }

  const toggleTaskStatus = (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    onUpdateTask(task.id, { status: newStatus })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      case 'medium': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30'
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      default: return 'text-surface-600 bg-surface-100 dark:bg-surface-700'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'in-progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
      case 'pending': return 'text-surface-600 bg-surface-100 dark:bg-surface-700'
      default: return 'text-surface-600 bg-surface-100 dark:bg-surface-700'
    }
  }

  const getDueDateDisplay = (dueDate) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    
    if (isToday(date)) return { text: 'Today', color: 'text-primary' }
    if (isTomorrow(date)) return { text: 'Tomorrow', color: 'text-blue-600' }
    if (isPast(date)) return { text: 'Overdue', color: 'text-red-600' }
    
    return { text: format(date, 'MMM dd'), color: 'text-surface-600' }
  }

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // Search filter
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !task.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Status filter
      if (filterBy !== 'all' && task.status !== filterBy) {
        return false
      }
      
      return true
    })

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate) - new Date(b.dueDate)
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'title':
          return a.title.localeCompare(b.title)
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt)
        default:
          return 0
      }
    })

    return filtered
  }, [tasks, searchTerm, filterBy, sortBy])
  }, [tasks, searchTerm, filterBy, sortBy])

  const kanbanColumns = {
    pending: {
      id: 'pending',
      title: 'To Do',
      tasks: filteredAndSortedTasks.filter(task => task.status === 'pending')
    },
    'in-progress': {
      id: 'in-progress', 
      title: 'In Progress',
      tasks: filteredAndSortedTasks.filter(task => task.status === 'in-progress')
    },
    completed: {
      id: 'completed',
      title: 'Complete', 
      tasks: filteredAndSortedTasks.filter(task => task.status === 'completed')
    }
  }

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result

    // If no destination, return
    if (!destination) return

    // If dropped in same position, return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    // Find the task being moved
    const task = tasks.find(t => t.id === draggableId)
    if (!task) return

    // Update task status based on destination column
    const newStatus = destination.droppableId
    if (newStatus !== task.status) {
      onUpdateTask(task.id, { status: newStatus })
      
      // Show appropriate toast message
      const statusMessages = {
        'pending': 'Task moved to To Do',
        'in-progress': 'Task moved to In Progress', 
        'completed': 'Task completed! 🎉'
      }
      
      toast.success(statusMessages[newStatus] || 'Task status updated')
    }


  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-soft border border-surface-200 dark:border-surface-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
              {selectedProject ? projects.find(p => p.id === selectedProject)?.name : 'All Tasks'}
            </h2>
            <p className="text-surface-600 dark:text-surface-400">
              {filteredAndSortedTasks.length} tasks found
            </p>
          </div>
          
          <motion.button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ApperIcon name="Plus" className="w-5 h-5" />
            <span>Add Task</span>
          </motion.button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
              <option value="created">Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Creation Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-soft border border-surface-200 dark:border-surface-700 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-surface-900 dark:text-white">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter task title"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    placeholder="Add task description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Project
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {editingTask && (
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks Display */}
      {viewMode === 'list' ? (
        // List View
        <div className="space-y-4">
          <AnimatePresence>
            {filteredAndSortedTasks.map((task, index) => {
              const project = projects.find(p => p.id === task.projectId)
              const dueDateInfo = getDueDateDisplay(task.dueDate)
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-soft border border-surface-200 dark:border-surface-700 hover:shadow-lg transition-all duration-200 ${
                    task.status === 'completed' ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          task.status === 'completed'
                            ? 'bg-green-500 border-green-500'
                            : 'border-surface-300 dark:border-surface-600 hover:border-primary'
                        }`}
                      >
                        {task.status === 'completed' && (
                          <ApperIcon name="Check" className="w-4 h-4 text-white" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className={`text-lg font-semibold ${
                            task.status === 'completed' 
                              ? 'line-through text-surface-500 dark:text-surface-400' 
                              : 'text-surface-900 dark:text-white'
                          }`}>
                            {task.title}
                          </h3>
                          
                          <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          
                          <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getStatusColor(task.status)}`}>
                            {task.status.replace('-', ' ')}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-surface-600 dark:text-surface-400 mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center space-x-4 text-sm">
                          {project && (
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: project.color }}
                              />
                              <span className="text-surface-600 dark:text-surface-400">
                                {project.name}
                              </span>
                            </div>
                          )}

                          {dueDateInfo && (
                            <div className={`flex items-center space-x-1 ${dueDateInfo.color}`}>
                              <ApperIcon name="Calendar" className="w-4 h-4" />
                              <span>{dueDateInfo.text}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                      >
                        <ApperIcon name="Edit2" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filteredAndSortedTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 mx-auto bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center mb-4">
                <ApperIcon name="ClipboardList" className="w-12 h-12 text-surface-400" />
              </div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
                No tasks found
              </h3>
              <p className="text-surface-600 dark:text-surface-400 mb-6">
                {searchTerm || filterBy !== 'all' 
                  ? "Try adjusting your search or filters" 
                  : "Create your first task to get started"}
              </p>
              {!searchTerm && filterBy === 'all' && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Create Task
                </button>
              )}
            </motion.div>
          )}
        </div>
        // Kanban View
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(kanbanColumns).map((column) => (
              <div key={column.id} className="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-soft border border-surface-200 dark:border-surface-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-surface-900 dark:text-white">
                    {column.title}
                  </h3>
                  <span className="text-sm text-surface-500 bg-surface-100 dark:bg-surface-700 px-2 py-1 rounded-lg">
                    {column.tasks.length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-96 max-h-96 overflow-y-auto scrollbar-hide kanban-column transition-all ${
                        snapshot.isDraggingOver ? 'kanban-column-drag-over' : ''
                      }`}
                    >
                      <AnimatePresence>
                        {column.tasks.map((task, index) => {
                          const project = projects.find(p => p.id === task.projectId)
                          const dueDateInfo = getDueDateDisplay(task.dueDate)

                          return (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <motion.div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.2, delay: index * 0.05 }}
                                  className={`bg-surface-50 dark:bg-surface-700 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group ${
                                    snapshot.isDragging ? 'task-card-dragging shadow-lg z-50' : ''
                                  }`}
                                >
                                  {/* Drag Handle */}
                                  <div 
                                    {...provided.dragHandleProps}
                                    className="flex items-center justify-between mb-2"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div className="grid grid-cols-2 gap-0.5 opacity-40 group-hover:opacity-70 transition-opacity">
                                        <div className="w-1 h-1 bg-surface-400 rounded-full"></div>
                                        <div className="w-1 h-1 bg-surface-400 rounded-full"></div>
                                        <div className="w-1 h-1 bg-surface-400 rounded-full"></div>
                                        <div className="w-1 h-1 bg-surface-400 rounded-full"></div>
                                      </div>
                                      <h4 className="font-medium text-surface-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                                        {task.title}
                                      </h4>
                                    </div>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                  </div>

                                  {task.description && (
                                    <p className="text-sm text-surface-600 dark:text-surface-400 mb-3 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between text-xs">
                                    {project && (
                                      <div className="flex items-center space-x-1">
                                        <div 
                                          className="w-2 h-2 rounded-full"
                                          style={{ backgroundColor: project.color }}
                                        />
                                        <span className="text-surface-600 dark:text-surface-400 truncate">
                                          {project.name}
                                        </span>
                                      </div>
                                    )}

                                    {dueDateInfo && (
                                      <span className={`${dueDateInfo.color} font-medium`}>
                                        {dueDateInfo.text}
                                      </span>
                                    )}
                                  </div>

                                  {/* Quick Actions */}
                                  <div className="flex items-center justify-end space-x-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleEdit(task)
                                      }}
                                      className="p-1 hover:bg-surface-200 dark:hover:bg-surface-600 rounded transition-colors"
                                    >
                                      <ApperIcon name="Edit2" className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onDeleteTask(task.id)
                                      }}
                                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded transition-colors"
                                    >
                                      <ApperIcon name="Trash2" className="w-3 h-3" />
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </Draggable>
                          )
                        })}
                      </AnimatePresence>
                      {provided.placeholder}

                      {/* Empty State */}
                      {column.tasks.length === 0 && (
                        <div className="text-center py-8 text-surface-400">
                          <ApperIcon name="Plus" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No {column.title.toLowerCase()} tasks</p>
                          <p className="text-xs mt-1">Drag tasks here or create new ones</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>

    </div>
  )
}

export default MainFeature