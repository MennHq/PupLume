import React, { useState } from 'react';
import { 
  Check, 
  Clock, 
  Plus, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  Calendar,
  Layers,
  ArrowRight,
  MoreHorizontal,
  Edit2
} from 'lucide-react';
import { PuppyProfile, TaskItem } from '../types';
import { storage } from '../lib/storage';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Scissors, Activity, Droplet, GraduationCap } from 'lucide-react';

interface TasksViewProps {
  puppy: PuppyProfile;
  onOpenLesson: (lessonId: string) => void;
  onNavigate?: (view: string) => void;
}

const generateTaskGoogleCalendarUrl = (task: TaskItem) => {
  const startDate = (task.date || new Date().toISOString().split('T')[0]).replace(/-/g, '');
  const startTime = task.time.replace(':', '') + '00';
  
  const [hourStr, minStr] = task.time.split(':');
  const duration = task.durationMin || 30;
  
  const tempDate = new Date();
  tempDate.setHours(parseInt(hourStr, 10), parseInt(minStr, 10) + duration, 0);
  const endHour = String(tempDate.getHours()).padStart(2, '0');
  const endMinute = String(tempDate.getMinutes()).padStart(2, '0');
  const endTime = endHour + endMinute + '00';

  const dates = `${startDate}T${startTime}/${startDate}T${endTime}`;

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.append('action', 'TEMPLATE');
  url.searchParams.append('text', task.title);
  url.searchParams.append('dates', dates);
  if (task.description) url.searchParams.append('details', task.description);
  
  return url.toString();
};

export const TasksView: React.FC<TasksViewProps> = ({ puppy, onOpenLesson, onNavigate }) => {
  const [tasks, setTasks] = useState<TaskItem[]>(() => storage.getTasks(puppy.id));
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');

  React.useEffect(() => {
    setTasks(storage.getTasks(puppy.id));
  }, [puppy.id]);
  
  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('training');
  const [time, setTime] = useState('02:00 PM');
  const [durationMin, setDurationMin] = useState('15');
  const [period, setPeriod] = useState<any>('afternoon');
  const [description, setDescription] = useState('');

  React.useEffect(() => {
    const handleOpenAddTask = (e: any) => {
      if (e.detail) {
        setTitle(e.detail.title || '');
        setCategory(e.detail.category || 'training');
        if (e.detail.time) setTime(e.detail.time);
        if (e.detail.durationMin) setDurationMin(e.detail.durationMin.toString());
      }
      setIsAddOpen(true);
    };
    window.addEventListener('open-add-task', handleOpenAddTask);
    return () => window.removeEventListener('open-add-task', handleOpenAddTask);
  }, []);

  React.useEffect(() => {
    return storage.subscribe(() => {
      setTasks([...storage.getTasks(puppy.id)]);
    });
  }, [puppy.id]);

  // Context Menu & Long Press
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  // Desktop keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Force Alt+N or Shift+N or simply N (if not typing)
      const isNewTaskShortcut = 
        (e.altKey && e.key.toLowerCase() === 'n') || 
        (e.shiftKey && e.key.toLowerCase() === 'n') ||
        (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === 'n');

      if (isNewTaskShortcut) {
        e.preventDefault();
        e.stopPropagation();
        setIsAddOpen(true);
      }
      
      // Allow pressing 'T' to add a task quickly
      if (!e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setIsAddOpen(true);
      }

      // Escape to close
      if (e.key === 'Escape' && activeMenuTaskId) {
        setActiveMenuTaskId(null);
      }
    };
    
    // Use capture phase to ensure we intercept it before browser
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [activeMenuTaskId]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);

  const startPress = (taskId: string) => {
    longPressTimer.current = setTimeout(() => {
      setActiveMenuTaskId(taskId);
      if ('vibrate' in navigator) navigator.vibrate(50); // Optional haptic feedback
    }, 500);
  };

  const endPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleDelete = (taskId: string) => {
    storage.deleteTask(taskId);
    setTasks([...storage.getTasks(puppy.id)]);
    setActiveMenuTaskId(null);
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setActiveMenuTaskId(null);
    if (activeMenuTaskId) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [activeMenuTaskId]);

  const [editTaskId, setEditTaskId] = useState<string | null>(null);

  const openEdit = (task: TaskItem) => {
    setEditTaskId(task.id);
    setTitle(task.title);
    setCategory(task.category);
    setTime(task.time);
    setDurationMin(task.durationMin.toString());
    setPeriod(task.period);
    setDescription(task.description || '');
    setIsAddOpen(true);
    setActiveMenuTaskId(null);
  };

  const handleToggle = (taskId: string) => {
    storage.toggleTask(taskId);
    setTasks([...storage.getTasks(puppy.id)]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    if (editTaskId) {
      storage.editTask(editTaskId, {
        title: title.trim(),
        category,
        time: time.trim() || '10:00 AM',
        durationMin: parseInt(durationMin as any, 10) || 15,
        period,
        description: description.trim(),
      });
    } else {
      storage.addTask({
        puppyId: puppy.id,
        title: title.trim(),
        category,
        time: time.trim() || '10:00 AM',
        durationMin: parseInt(durationMin as any, 10) || 15,
        completed: false,
        skipped: false,
        period,
        description: description.trim(),
        date: new Date().toISOString().split('T')[0]
      });
    }
    setTasks([...storage.getTasks(puppy.id)]);
    setIsAddOpen(false);
    setEditTaskId(null);
    setTitle('');
    setDescription('');
  };

  const handleCloseModal = () => {
    setIsAddOpen(false);
    setEditTaskId(null);
    setTitle('');
    setDescription('');
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'potty', label: 'Potty' },
    { id: 'feeding', label: 'Feeding' },
    { id: 'training', label: 'Training' },
    { id: 'sleep', label: 'Sleep' },
    { id: 'walk', label: 'Walk' },
    { id: 'health', label: 'Health' },
    { id: 'grooming', label: 'Grooming' }
  ];

  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'pending' && (t.completed || t.skipped)) return false;
    if (activeFilter === 'completed' && !t.completed) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;

  // Calculate the upcoming pending task based on the current time of day
  const nextTask = React.useMemo(() => {
    const pendingTasks = tasks.filter((t) => !t.completed && !t.skipped && t.time);
    if (pendingTasks.length === 0) return null;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const parseToMinutes = (timeStr: string): number => {
      const [tPart, period] = timeStr.trim().split(' ');
      if (!tPart) return 0;
      let [h, m] = tPart.split(':').map(Number);
      if (isNaN(h)) h = 0;
      if (isNaN(m)) m = 0;
      if (period === 'PM' && h < 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };

    const sorted = [...pendingTasks].sort((a, b) => parseToMinutes(a.time) - parseToMinutes(b.time));
    const upcoming = sorted.find((t) => parseToMinutes(t.time) >= currentMinutes);
    const target = upcoming || sorted[0];
    if (!target) return null;

    const targetMinutes = parseToMinutes(target.time);
    const diff = targetMinutes - currentMinutes;

    let relativeTime = '';
    if (diff > 0 && diff < 60) {
      relativeTime = `in ${diff}m`;
    } else if (diff >= 60 && diff < 180) {
      const hrs = Math.floor(diff / 60);
      const mins = diff % 60;
      relativeTime = mins > 0 ? `in ${hrs}h ${mins}m` : `in ${hrs}h`;
    } else if (diff <= 0) {
      relativeTime = 'due now';
    } else {
      relativeTime = target.time;
    }

    return {
      ...target,
      relativeTime,
      isDue: diff <= 0,
    };
  }, [tasks]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E8DDD3] p-5 sm:p-6 shadow-xs">
        {/* Top: Title & Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C211B] tracking-tight">
                Daily Routine & Planner
              </h1>
              <span className="text-xs font-bold bg-[#F3E7DA] text-[#5F3E29] px-2.5 py-0.5 rounded-full">
                {completedCount} / {tasks.length} done
              </span>
            </div>
            <p className="text-xs text-[#766A63] mt-1 max-w-xl">
              Predictable rhythms establish security, house training, and emotional calm for {puppy.name}.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Task
            </Button>
          </div>
        </div>

        {/* Up Next Glance Bar */}
        {nextTask ? (
          <div
            onClick={() => {
              const el = document.getElementById(`task-card-${nextTask.id}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-2', 'ring-[#8B5E3C]');
                setTimeout(() => el.classList.remove('ring-2', 'ring-[#8B5E3C]'), 1800);
              }
            }}
            title="Click to jump to this task"
            className="mt-4 pt-3.5 border-t border-[#F3E7DA] flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#FFFDF9] -mx-1 px-2 py-1.5 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${nextTask.isDue ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${nextTask.isDue ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B5E3C] shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#8B5E3C]" />
                Up Next
              </span>
              <span className="text-[#C5B8AB] shrink-0">•</span>
              <span className="text-xs font-bold text-[#2C211B] truncate group-hover:text-[#8B5E3C] transition-colors">
                {nextTask.title}
              </span>
              <span className="text-[11px] font-medium text-[#766A63] shrink-0">
                ({nextTask.relativeTime})
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-semibold text-[#8B5E3C] bg-[#FFF9F2] px-2.5 py-0.5 rounded-lg border border-[#E8DDD3] shadow-2xs">
                {nextTask.time}
              </span>
              <span className="text-[11px] font-bold text-[#8B5E3C] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Jump <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ) : tasks.length > 0 && completedCount === tasks.length ? (
          <div className="mt-4 pt-3.5 border-t border-[#F3E7DA] flex items-center gap-2 text-xs font-bold text-[#1E6B37]">
            <CheckCircle2 className="w-4 h-4 text-[#2E9E52]" />
            <span>All tasks completed for today! Great job with {puppy.name}. 🎉</span>
          </div>
        ) : null}
      </div>

      {/* Filter Tabs & Category Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 p-1 rounded-xl bg-[#F3E7DA] border border-[#E8DDD3]">
            {[
              { id: 'all', label: `All (${tasks.length})` },
              { id: 'pending', label: `Remaining (${tasks.length - completedCount})` },
              { id: 'completed', label: `Done (${completedCount})` }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-white text-[#2C211B] shadow-2xs'
                    : 'text-[#766A63] hover:text-[#2C211B]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category horizontal scrolling pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                  : 'bg-white text-[#766A63] border-[#E8DDD3] hover:bg-[#FFF9F2]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {tasks.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E8DDD3] shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#F3E7DA] text-[#8B5E3C] flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#2C211B] mb-1">No tasks scheduled yet</h3>
            <p className="text-xs text-[#766A63] max-w-sm mx-auto mb-4">
              Add meals, walks, potty breaks, and training sessions to establish a daily routine for {puppy.name}.
            </p>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsAddOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add First Task
            </Button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#E8DDD3] text-xs text-[#766A63]">
            <CheckCircle2 className="w-8 h-8 text-[#A8B59A] mx-auto mb-2" />
            No tasks found matching your filter criteria.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              id={`task-card-${task.id}`}
              tabIndex={0}
              className={`relative p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 focus:outline-none focus:border-[#8B5E3C] focus:ring-4 focus:ring-[#8B5E3C]/10 ${
                task.completed
                  ? 'bg-[#FFF9F2]/60 border-[#E8DDD3]/70 opacity-65'
                  : 'bg-white border-[#E8DDD3] hover:border-[#8B5E3C]/40 shadow-xs'
              }`}
              title="Double-click to toggle completion. Right-click for options."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setActiveMenuTaskId(activeMenuTaskId === task.id ? null : task.id);
                } else if (e.key === ' ') {
                  e.preventDefault();
                  handleToggle(task.id);
                }
              }}
              onTouchStart={() => startPress(task.id)}
              onTouchEnd={endPress}
              onContextMenu={(e) => {
                e.preventDefault();
                setActiveMenuTaskId(task.id);
              }}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <button
                  type="button"
                  title={task.completed ? "Mark incomplete" : "Mark complete"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(task.id);
                  }}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer flex-shrink-0 mt-0.5 ${
                    task.completed
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-[#E8DDD3] hover:border-[#8B5E3C] bg-white'
                  }`}
                >
                  {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-bold text-[#2C211B] truncate ${task.completed ? 'line-through text-[#766A63]' : ''}`}>
                      {task.title}
                    </h3>
                    <Badge variant={task.category as any} size="sm">
                      {task.category}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-xs text-[#766A63] mt-1 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-[#766A63]">
                    <span className="flex items-center gap-1 font-semibold text-[#5F3E29]">
                      <Clock className="w-3.5 h-3.5" /> {task.time} ({task.durationMin} min)
                    </span>
                    {!task.completed && (
                      <a 
                        href={generateTaskGoogleCalendarUrl(task)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-[#4285F4] hover:text-[#3367D6] font-bold transition-colors ml-2"
                      >
                        <Calendar className="w-3 h-3" /> GCal
                      </a>
                    )}
                    <span className="capitalize text-[#766A63]">• {task.period}</span>
                    {task.completedAt && (
                      <span className="text-emerald-700 font-medium">✓ Done at {task.completedAt}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {task.category === 'training' && !task.completed && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenLesson('lesson-1');
                    }}
                    className="flex-shrink-0 text-xs hidden sm:flex"
                  >
                    <GraduationCap className="w-3.5 h-3.5 mr-1" />
                    Start Drill
                  </Button>
                )}

                {task.category === 'grooming' && !task.completed && onNavigate && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('socialization');
                    }}
                    className="flex-shrink-0 text-xs hidden sm:flex text-purple-700 hover:bg-purple-50"
                  >
                    <Scissors className="w-3.5 h-3.5 mr-1" />
                    Checklist
                  </Button>
                )}

                {task.category === 'health' && !task.completed && onNavigate && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('health');
                    }}
                    className="flex-shrink-0 text-xs hidden sm:flex text-rose-700 hover:bg-rose-50"
                  >
                    <Activity className="w-3.5 h-3.5 mr-1" />
                    Records
                  </Button>
                )}

                {task.category === 'potty' && !task.completed && onNavigate && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('potty');
                    }}
                    className="flex-shrink-0 text-xs hidden sm:flex text-emerald-700 hover:bg-emerald-50"
                  >
                    <Droplet className="w-3.5 h-3.5 mr-1" />
                    Tracker
                  </Button>
                )}
                
                <button
                  type="button"
                  title="More Options"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuTaskId(activeMenuTaskId === task.id ? null : task.id);
                  }}
                  className="p-1.5 text-[#766A63] hover:text-[#2C211B] hover:bg-[#FFF9F2] rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {activeMenuTaskId === task.id && (
                  <div className="absolute top-12 right-4 bg-white border border-[#E8DDD3] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2 z-10 min-w-[200px] flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(task);
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm font-semibold text-[#2C211B] hover:bg-[#F3E7DA] rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <Edit2 className="w-4 h-4 text-[#8B5E3C]" />
                        Edit Task Details
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#8B5E3C]/50" />
                    </button>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(task.id);
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <Trash2 className="w-4 h-4" />
                        Delete Task
                      </span>
                    </button>
                    
                    <div className="h-px w-full bg-[#E8DDD3] my-1" />
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuTaskId(null);
                      }}
                      className="w-full text-center px-3 py-2 text-sm font-bold text-[#766A63] hover:bg-[#F3E7DA]/50 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={handleCloseModal}
        title={editTaskId ? "Edit Task" : "Create Custom Task"}
        subtitle={`Schedule an activity for ${puppy.name}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Crate quiet settling practice"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
              >
                <option value="training">Training</option>
                <option value="potty">Potty</option>
                <option value="feeding">Feeding</option>
                <option value="sleep">Sleep</option>
                <option value="walk">Walk</option>
                <option value="health">Health</option>
                <option value="grooming">Grooming</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                Day Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10:30 AM"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                min="1"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Instructions / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What to prepare, treats to use..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              {editTaskId ? 'Update Task' : 'Save Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
