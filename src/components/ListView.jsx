import { motion, AnimatePresence } from 'framer-motion'
import TaskCard from './TaskCard'
import ApperIcon from './ApperIcon'

const ListView = ({ 
  filteredAndSortedTasks, 
  projects, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  searchTerm, 
  filterBy, 
  setShowCreateForm 
}) => {
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {filteredAndSortedTasks.map((task, index) => {
          const project = projects.find(p => p.id === task.projectId)
          
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <TaskCard
                task={task}
                project={project}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                isKanban={false}
              />
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
  )
}

export default ListView
