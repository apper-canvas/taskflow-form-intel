import { useState } from 'react'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

export const useTaskOperations = ({ tasks, projects, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
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

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const task = tasks.find(t => t.id === draggableId)
    if (!task) return

    const newStatus = destination.droppableId
    if (newStatus !== task.status) {
      onUpdateTask(task.id, { status: newStatus })
      
      const statusMessages = {
        'pending': 'Task moved to To Do',
        'in-progress': 'Task moved to In Progress', 
        'completed': 'Task completed! 🎉'
      }
      
      toast.success(statusMessages[newStatus] || 'Task status updated')
    }
  }

  return {
    showCreateForm,
    setShowCreateForm,
    editingTask,
    formData,
    setFormData,
    resetForm,
    handleSubmit,
    handleEdit,
    toggleTaskStatus,
    handleDragEnd
  }
}
