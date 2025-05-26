import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { motion, AnimatePresence } from 'framer-motion'
import TaskCard from './TaskCard'
import ApperIcon from './ApperIcon'

const KanbanBoard = ({ 
  filteredAndSortedTasks, 
  projects, 
  onEdit, 
  onDelete, 
  onDragEnd 
}) => {
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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
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
                              className={`${
                                snapshot.isDragging ? 'task-card-dragging shadow-lg z-50' : ''
                              }`}
                            >
                              <TaskCard
                                task={task}
                                project={project}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                isKanban={true}
                                dragHandleProps={provided.dragHandleProps}
                                provided={provided}
                              />
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
  )
}

export default KanbanBoard
