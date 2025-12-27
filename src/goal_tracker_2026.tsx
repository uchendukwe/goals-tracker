import React, { useState, useMemo, useCallback } from 'react';
import { 
  Plus, Trash2, Calendar, CheckCircle, Circle, 
  TrendingUp, Edit2, X, Bell, Clock 
} from 'lucide-react';

/**
 * GoalTracker2026
 * A comprehensive productivity tool featuring recurring task management
 * and progress visualization.
 */
const GoalTracker2026 = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [goals, setGoals] = useState([
    {
      id: 1,
      category: 'Technology & Infrastructure',
      title: 'Cloud Technology & Deployment Infrastructure',
      dueDate: '2026-12-31',
      priority: 'High',
      tasks: [
        { id: 1, title: 'Collaborate with Joshua Obilor on cloud technology', dueDate: '2026-03-31', status: 'Not Started', frequency: 'One-time', lastCompleted: null },
        { id: 2, title: 'Research and select VPS provider', dueDate: '2026-02-15', status: 'Not Started', frequency: 'One-time', lastCompleted: null },
        { id: 3, title: 'Purchase VPS and set up base infrastructure', dueDate: '2026-03-01', status: 'Not Started', frequency: 'One-time', lastCompleted: null },
      ]
    },
    {
      id: 2,
      category: 'Product Development',
      title: 'Complete Paroji APIs',
      dueDate: '2026-01-31',
      priority: 'Critical',
      tasks: [
        { id: 1, title: 'Calculate outstanding APIs in Paroji', dueDate: '2026-01-07', status: 'Not Started', frequency: 'One-time', lastCompleted: null },
        { id: 2, title: 'Complete Paroji API development', dueDate: '2026-01-31', status: 'Not Started', frequency: 'One-time', lastCompleted: null },
      ]
    },
    {
      id: 9,
      category: 'Career',
      title: 'Secure Better Job Opportunity',
      dueDate: '2026-06-30',
      priority: 'High',
      tasks: [
        { id: 1, title: 'Update resume and portfolio', dueDate: '2026-01-31', status: 'Not Started', frequency: 'One-time', lastCompleted: null },
        { id: 2, title: 'Apply to target companies', dueDate: '2026-12-31', status: 'Not Started', frequency: 'Weekly', lastCompleted: null },
        { id: 3, title: 'Network with industry professionals', dueDate: '2026-12-31', status: 'Not Started', frequency: 'Monthly', lastCompleted: null },
      ]
    },
  ]);

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [currentGoalId, setCurrentGoalId] = useState(null);

  const categories = ['Technology & Infrastructure', 'Product Development', 'Free MSME SaaS', 'Team Building', 'Career', 'AI & Efficiency', 'Business Strategy', 'Spiritual & Social', 'Personal & Family'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-50';
      case 'In Progress': return 'text-blue-600 bg-blue-50';
      case 'Blocked': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const calculateProgress = (goal) => {
    const total = goal.tasks.length;
    const completed = goal.tasks.filter(t => t.status === 'Completed' && t.frequency === 'One-time').length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const calculateNextDueDate = (lastCompleted, frequency) => {
    const date = new Date(lastCompleted);
    switch (frequency) {
      case 'Daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'Weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'Monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'Quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      default:
        return null;
    }
    return date.toISOString().split('T')[0];
  };

  const isTaskDue = (task) => {
    if (task.frequency === 'One-time') {
      return task.status !== 'Completed';
    }
    
    if (!task.lastCompleted) return true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDone = new Date(task.lastCompleted);
    lastDone.setHours(0, 0, 0, 0);
    
    const daysSince = Math.floor((today - lastDone) / (1000 * 60 * 60 * 24));
    
    switch (task.frequency) {
      case 'Daily': return daysSince >= 1;
      case 'Weekly': return daysSince >= 7;
      case 'Monthly': return daysSince >= 30;
      case 'Quarterly': return daysSince >= 90;
      default: return false;
    }
  };

  const updateTaskStatus = (goalId, taskId, newStatus) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          tasks: goal.tasks.map(task => {
            if (task.id === taskId) {
              const updatedTask = { ...task, status: newStatus };
              
              if (newStatus === 'Completed' && task.frequency !== 'One-time') {
                const today = new Date().toISOString().split('T')[0];
                updatedTask.lastCompleted = today;
                const nextDue = calculateNextDueDate(today, task.frequency);
                if (nextDue) {
                  updatedTask.dueDate = nextDue;
                }
                updatedTask.status = 'Not Started';
              }
              
              return updatedTask;
            }
            return task;
          })
        };
      }
      return goal;
    }));
  };

  const addGoal = (goalData) => {
    const newGoal = {
      id: Math.max(...goals.map(g => g.id), 0) + 1,
      ...goalData,
      tasks: []
    };
    setGoals([...goals, newGoal]);
    setShowGoalModal(false);
  };

  const updateGoal = (goalData) => {
    setGoals(goals.map(g => g.id === editingGoal.id ? { ...g, ...goalData } : g));
    setEditingGoal(null);
    setShowGoalModal(false);
  };

  const deleteGoal = (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal and all its tasks?')) {
      setGoals(goals.filter(g => g.id !== goalId));
    }
  };

  const addTask = (taskData) => {
    setGoals(goals.map(goal => {
      if (goal.id === currentGoalId) {
        const newTask = {
          id: Math.max(...goal.tasks.map(t => t.id), 0) + 1,
          ...taskData,
          status: 'Not Started',
          lastCompleted: null
        };
        return { ...goal, tasks: [...goal.tasks, newTask] };
      }
      return goal;
    }));
    setShowTaskModal(false);
    setCurrentGoalId(null);
  };

  const updateTask = (taskData) => {
    setGoals(goals.map(goal => {
      if (goal.id === currentGoalId) {
        return {
          ...goal,
          tasks: goal.tasks.map(task =>
            task.id === editingTask.id ? { ...task, ...taskData } : task
          )
        };
      }
      return goal;
    }));
    setEditingTask(null);
    setShowTaskModal(false);
    setCurrentGoalId(null);
  };

  const deleteTask = (goalId, taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setGoals(goals.map(goal => {
        if (goal.id === goalId) {
          return { ...goal, tasks: goal.tasks.filter(t => t.id !== taskId) };
        }
        return goal;
      }));
    }
  };

  const filteredGoals = selectedCategory === 'All' 
    ? goals 
    : goals.filter(g => g.category === selectedCategory);

  const stats = useMemo(() => {
    const totalGoals = goals.length;
    const totalTasks = goals.reduce((sum, g) => sum + g.tasks.length, 0);
    const completedTasks = goals.reduce((sum, g) => 
      sum + g.tasks.filter(t => t.status === 'Completed' && t.frequency === 'One-time').length, 0);
    const overallProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    
    return { totalGoals, totalTasks, completedTasks, overallProgress };
  }, [goals]);

  const recurringReminders = useMemo(() => {
    const reminders = [];
    goals.forEach(goal => {
      goal.tasks.forEach(task => {
        if (task.frequency !== 'One-time' && isTaskDue(task)) {
          reminders.push({
            goalId: goal.id,
            taskId: task.id,
            goalTitle: goal.title,
            taskTitle: task.title,
            frequency: task.frequency,
            lastCompleted: task.lastCompleted,
            priority: goal.priority
          });
        }
      });
    });
    return reminders.sort((a, b) => {
      const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [goals]);

  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const deadlines = [];
    goals.forEach(goal => {
      goal.tasks.forEach(task => {
        if (task.status !== 'Completed' || task.frequency !== 'One-time') {
          const taskDate = new Date(task.dueDate);
          if (taskDate >= today && taskDate <= next30Days) {
            deadlines.push({
              goalTitle: goal.title,
              taskTitle: task.title,
              dueDate: task.dueDate,
              frequency: task.frequency,
              daysUntil: Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24))
            });
          }
        }
      });
    });
    
    return deadlines.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 10);
  }, [goals]);

  const GoalModal = () => {
    const [formData, setFormData] = useState(editingGoal || {
      title: '',
      category: categories[0],
      dueDate: '',
      priority: 'Medium'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (editingGoal) {
        updateGoal(formData);
      } else {
        addGoal(formData);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h3>
            <button onClick={() => { setShowGoalModal(false); setEditingGoal(null); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingGoal ? 'Update Goal' : 'Add Goal'}
              </button>
              <button
                type="button"
                onClick={() => { setShowGoalModal(false); setEditingGoal(null); }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const TaskModal = () => {
    const [formData, setFormData] = useState(editingTask || {
      title: '',
      dueDate: '',
      frequency: 'One-time'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (editingTask) {
        updateTask(formData);
      } else {
        addTask(formData);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
            <button onClick={() => { setShowTaskModal(false); setEditingTask(null); setCurrentGoalId(null); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="One-time">One-time</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>
            {formData.frequency !== 'One-time' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Recurring Task:</strong> When you mark this task complete, it will automatically reset with the next due date.
                </p>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingTask ? 'Update Task' : 'Add Task'}
              </button>
              <button
                type="button"
                onClick={() => { setShowTaskModal(false); setEditingTask(null); setCurrentGoalId(null); }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">2026 Goal Tracker</h1>
            <p className="text-gray-600">Track your goals with recurring task reminders</p>
          </div>
          <button
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Goal
          </button>
        </div>

        {recurringReminders.length > 0 && (
          <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Bell className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">
                  Recurring Tasks Due ({recurringReminders.length})
                </h3>
                <div className="space-y-2">
                  {recurringReminders.slice(0, 3).map((reminder, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{reminder.taskTitle}</p>
                        <p className="text-sm text-gray-600">
                          {reminder.goalTitle} • {reminder.frequency}
                          {reminder.lastCompleted && (
                            <span className="ml-2 text-gray-500">
                              Last: {new Date(reminder.lastCompleted).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => updateTaskStatus(reminder.goalId, reminder.taskId, 'Completed')}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-sm ml-4"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Done
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Goals</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalGoals}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTasks}</p>
              </div>
              <Circle className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recurring Due</p>
                <p className="text-3xl font-bold text-orange-600">{recurringReminders.length}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Detailed View
              </button>
              <button
                onClick={() => setActiveTab('recurring')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'recurring'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Recurring Tasks
                {recurringReminders.length > 0 && (
                  <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {recurringReminders.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('deadlines')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'deadlines'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upcoming Deadlines
              </button>
            </nav>
          </div>

          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                {filteredGoals.map(goal => {
                  const progress = calculateProgress(goal);
                  return (
                    <div key={goal.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(goal.priority)}`}>
                              {goal.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{goal.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {goal.dueDate}
                            </div>
                          </div>
                          <button
                            onClick={() => { setEditingGoal(goal); setShowGoalModal(true); }}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>{goal.tasks.filter(t => t.status === 'Completed' && t.frequency === 'One-time').length} of {goal.tasks.length} tasks</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-6">
                {filteredGoals.map(goal => (
                  <div key={goal.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(goal.priority)}`}>
                            {goal.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Due: {goal.dueDate}</span>
                          <button
                            onClick={() => { setCurrentGoalId(goal.id); setShowTaskModal(true); }}
                            className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Add Task
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-sm text-gray-600 border-b">
                              <th className="pb-2 font-medium">Task</th>
                              <th className="pb-2 font-medium">Due Date</th>
                              <th className="pb-2 font-medium">Frequency</th>
                              <th className="pb-2 font-medium">Last Done</th>
                              <th className="pb-2 font-medium">Status</th>
                              <th className="pb-2 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {goal.tasks.map(task => {
                              const isDue = isTaskDue(task);
                              return (
                                <tr key={task.id} className={`border-b last:border-b-0 ${isDue && task.frequency !== 'One-time' ? 'bg-orange-50' : ''}`}>
                                  <td className="py-3">
                                    <div className="flex items-center gap-2">
                                      {task.title}
                                      {isDue && task.frequency !== 'One-time' && (
                                        <Bell className="w-4 h-4 text-orange-600" />
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 text-sm text-gray-600">{task.dueDate}</td>
                                  <td className="py-3 text-sm text-gray-600">{task.frequency}</td>
                                  <td className="py-3 text-sm text-gray-600">
                                    {task.lastCompleted ? new Date(task.lastCompleted).toLocaleDateString() : 'Never'}
                                  </td>
                                  <td className="py-3">
                                    <select
                                      value={task.status}
                                      onChange={(e) => updateTaskStatus(goal.id, task.id, e.target.value)}
                                      className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(task.status)}`}
                                    >
                                      <option value="Not Started">Not Started</option>
                                      <option value="In Progress">In Progress</option>
                                      <option value="Completed">Completed</option>
                                      <option value="Blocked">Blocked</option>
                                    </select>
                                  </td>
                                  <td className="py-3">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => { setCurrentGoalId(goal.id); setEditingTask(task); setShowTaskModal(true); }}
                                        className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => deleteTask(goal.id, task.id)}
                                        className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recurring' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recurring Tasks Due Now ({recurringReminders.length})
              </h3>
              {recurringReminders.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">All recurring tasks are up to date!</p>
                  <p className="text-gray-500 text-sm mt-2">Check back later for tasks that need attention.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recurringReminders.map((reminder, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(reminder.priority)}`}>
                            {reminder.priority}
                          </span>
                          <span className="text-xs text-gray-600">{reminder.frequency}</span>
                        </div>
                        <p className="font-medium text-gray-900">{reminder.taskTitle}</p>
                        <p className="text-sm text-gray-600">{reminder.goalTitle}</p>
                        {reminder.lastCompleted && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last done: {new Date(reminder.lastCompleted).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => updateTaskStatus(reminder.goalId, reminder.taskId, 'Completed')}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors ml-4"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Complete
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">How Recurring Tasks Work</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• When you complete a recurring task, it resets with the next due date automatically</li>
                  <li>• The system tracks when you last completed each task</li>
                  <li>• Tasks appear here when they're due based on their frequency</li>
                  <li>• High priority tasks are shown first</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'deadlines' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next 30 Days</h3>
              {upcomingDeadlines.length === 0 ? (
                <p className="text-gray-600">No upcoming deadlines in the next 30 days.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">{item.taskTitle}</p>
                          {item.frequency !== 'One-time' && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                              {item.frequency}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{item.goalTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{item.dueDate}</p>
                        <p className={`text-sm ${item.daysUntil <= 7 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {item.daysUntil} {item.daysUntil === 1 ? 'day' : 'days'} left
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Guide</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• <strong>Add Goals:</strong> Click "Add Goal" button to create new goals</li>
            <li>• <strong>Add Tasks:</strong> Use "Add Task" in Detailed View to break down goals</li>
            <li>• <strong>Recurring Tasks:</strong> Set frequency and tasks auto-reset when completed</li>
            <li>• <strong>Track Progress:</strong> Update task status with dropdown menus</li>
            <li>• <strong>Stay Alert:</strong> Check Recurring Tasks tab for overdue items</li>
          </ul>
        </div>
      </div>

      {showGoalModal && <GoalModal />}
      {showTaskModal && <TaskModal />}
    </div>
  );
};

export default GoalTracker2026;