import { motion } from 'framer-motion'
import { useTaskOperations } from '../hooks/useTaskOperations'
import { useTaskFiltering } from '../hooks/useTaskFiltering'
import TaskForm from './TaskForm'
import ListView from './ListView'
import KanbanBoard from './KanbanBoard'
import FilterControls from './FilterControls'
import ApperIcon from './ApperIcon'

const MainFeature = ({ 
  tasks, 
  projects, 
  onAddTask, 
  onUpdateTask, 
  onDeleteTask,
  viewMode,
  selectedProject 
}) => {
  const taskOperations = useTaskOperations({ 
    tasks, 
    projects, 
    onAddTask, 
    onUpdateTask, 
    onDeleteTask 
  })
  
  const filtering = useTaskFiltering(tasks)

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
              {filtering.filteredAndSortedTasks.length} tasks found
            </p>
          </div>
          
          <motion.button
            onClick={() => taskOperations.setShowCreateForm(true)}
            className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ApperIcon name="Plus" className="w-5 h-5" />
            <span>Add Task</span>
          </motion.button>
        </div>

        {/* Filters and Search */}
        <FilterControls
          searchTerm={filtering.searchTerm}
          setSearchTerm={filtering.setSearchTerm}
          filterBy={filtering.filterBy}
          setFilterBy={filtering.setFilterBy}
          sortBy={filtering.sortBy}
          setSortBy={filtering.setSortBy}
        />
      </div>

      {/* Task Creation Form */}
      <TaskForm
        showCreateForm={taskOperations.showCreateForm}
        editingTask={taskOperations.editingTask}
        formData={taskOperations.formData}
        setFormData={taskOperations.setFormData}
        projects={projects}
        handleSubmit={taskOperations.handleSubmit}
        resetForm={taskOperations.resetForm}
      />

      {/* Tasks Display */}
      {viewMode === 'list' ? (
        <ListView
          filteredAndSortedTasks={filtering.filteredAndSortedTasks}
          projects={projects}
          onEdit={taskOperations.handleEdit}
          onDelete={onDeleteTask}
          onToggleStatus={taskOperations.toggleTaskStatus}
          searchTerm={filtering.searchTerm}
          filterBy={filtering.filterBy}
          setShowCreateForm={taskOperations.setShowCreateForm}
        />
      ) : (
        <KanbanBoard
          filteredAndSortedTasks={filtering.filteredAndSortedTasks}
          projects={projects}
          onEdit={taskOperations.handleEdit}
          onDelete={onDeleteTask}
          onDragEnd={taskOperations.handleDragEnd}
        />
      )}
    </div>
  )
}

export default MainFeature


export default MainFeature