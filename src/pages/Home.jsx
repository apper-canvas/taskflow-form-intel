import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'

const Home = () => {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([
    {
      id: '1',
      name: 'Work',
      description: 'Professional tasks and projects',
      color: '#6366f1',
      taskCount: 0
    },
    {
      id: '2',
      name: 'Personal',
      description: 'Personal goals and activities',
      color: '#06b6d4',
      taskCount: 0
    }
  ])
  const [selectedProject, setSelectedProject] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'kanban'

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const addTask = (taskData) => {
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setTasks(prev => [...prev, newTask])
    
    // Update project task count
    setProjects(prev => prev.map(project => 
      project.id === newTask.projectId 
        ? { ...project, taskCount: project.taskCount + 1 }
        : project
    ))
    
    toast.success("Task created successfully!")
  }

  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ))
    
    if (updates.status === 'completed') {
      toast.success("Task completed! 🎉")
    }
  }

  const deleteTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
    
    // Update project task count
    if (task) {
      setProjects(prev => prev.map(project => 
        project.id === task.projectId 
          ? { ...project, taskCount: Math.max(0, project.taskCount - 1) }
          : project
      ))
    }
    
    toast.success("Task deleted successfully")
  }

  const filteredTasks = selectedProject 
    ? tasks.filter(task => task.projectId === selectedProject)
    : tasks

  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const pending = tasks.filter(t => t.status === 'pending').length
    const inProgress = tasks.filter(t => t.status === 'in-progress').length
    const overdue = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
    ).length
    
    return { total, completed, pending, inProgress, overdue }
  }

  const stats = getTaskStats()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <ApperIcon name="CheckSquare" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  TaskFlow
                </h1>
                <p className="text-xs text-surface-500 dark:text-surface-400">Smart Task Management</p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="hidden sm:flex bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-surface-700 text-primary shadow-sm'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200'
                  }`}
                >
                  <ApperIcon name="List" className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'kanban'
                      ? 'bg-white dark:bg-surface-700 text-primary shadow-sm'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200'
                  }`}
                >
                  <ApperIcon name="Columns" className="w-4 h-4" />
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <motion.button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {darkMode ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ApperIcon name="Sun" className="w-5 h-5 text-amber-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ApperIcon name="Moon" className="w-5 h-5 text-surface-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div 
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <motion.div 
                className="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-soft border border-surface-200 dark:border-surface-700"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-surface-600 dark:text-surface-400">Total Tasks</p>
                    <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <ApperIcon name="ListTodo" className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-soft border border-surface-200 dark:border-surface-700"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-surface-600 dark:text-surface-400">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <ApperIcon name="CheckCircle" className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Projects */}
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-soft border border-surface-200 dark:border-surface-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Projects</h3>
                <button
                  onClick={() => setSelectedProject(null)}
                  className={`text-sm px-3 py-1 rounded-lg transition-all ${
                    selectedProject === null
                      ? 'bg-primary text-white'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700'
                  }`}
                >
                  All
                </button>
              </div>
              <div className="space-y-3">
                {projects.map((project) => (
                  <motion.button
                    key={project.id}
                    onClick={() => setSelectedProject(project.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedProject === project.id
                        ? 'bg-primary/10 border-primary/20'
                        : 'hover:bg-surface-50 dark:hover:bg-surface-700'
                    } border border-surface-200 dark:border-surface-700`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-surface-900 dark:text-white">{project.name}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">
                          {project.taskCount} tasks
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MainFeature
              tasks={filteredTasks}
              projects={projects}
              onAddTask={addTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              viewMode={viewMode}
              selectedProject={selectedProject}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Home