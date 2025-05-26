import { format, isToday, isTomorrow, isPast } from 'date-fns'
import ApperIcon from './ApperIcon'

const TaskCard = ({ task, project, onEdit, onDelete, onToggleStatus, isKanban = false, dragHandleProps, provided }) => {
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

  const dueDateInfo = getDueDateDisplay(task.dueDate)

  if (isKanban) {
    return (
      <div className="bg-surface-50 dark:bg-surface-700 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group">
        {/* Drag Handle */}
        <div {...dragHandleProps} className="flex items-center justify-between mb-2">
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
              onEdit(task)
            }}
            className="p-1 hover:bg-surface-200 dark:hover:bg-surface-600 rounded transition-colors"
          >
            <ApperIcon name="Edit2" className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded transition-colors"
          >
            <ApperIcon name="Trash2" className="w-3 h-3" />
          </button>
        </div>
      </div>
    )
  }

  // List view
  return (
    <div className={`bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-soft border border-surface-200 dark:border-surface-700 hover:shadow-lg transition-all duration-200 ${
      task.status === 'completed' ? 'opacity-75' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <button
            onClick={() => onToggleStatus(task)}
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
            onClick={() => onEdit(task)}
            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
          >
            <ApperIcon name="Edit2" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors"
          >
            <ApperIcon name="Trash2" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskCard
