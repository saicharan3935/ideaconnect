import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  Plus,
  ExternalLink,
  Kanban,
  Users,
  AlertCircle,
  Lightbulb,
  Github,
  Figma,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ListTodo,
  CheckSquare
} from 'lucide-react';
import api from '../services/api';
import { ProjectWorkspace, TaskItem } from '../types';
import { Card3D } from '../components/common/Card3D';
import { BuildIdeaModal } from '../components/projects/BuildIdeaModal';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectWorkspace[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [buildModalOpen, setBuildModalOpen] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    setLoading(true);
    api.get('/projects')
      .then(res => {
        setProjects(res.data);
        if (res.data.length > 0 && !selectedProject) {
          // Fetch full project details including tasks for the first project
          fetchProjectDetails(res.data[0].id);
        }
      })
      .catch(err => console.error('Error loading projects:', err))
      .finally(() => setLoading(false));
  };

  const fetchProjectDetails = (projectId: string) => {
    api.get(`/projects/${projectId}`)
      .then(res => setSelectedProject(res.data))
      .catch(err => console.error('Error fetching project workspace:', err));
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    if (!selectedProject) return;
    try {
      await api.put(`/projects/${selectedProject.id}/tasks/${taskId}`, { status: newStatus });
      fetchProjectDetails(selectedProject.id);
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTaskTitle.trim()) return;

    try {
      setAddingTask(true);
      await api.post(`/projects/${selectedProject.id}/tasks`, {
        title: newTaskTitle.trim(),
        priority: newTaskPriority
      });
      setNewTaskTitle('');
      fetchProjectDetails(selectedProject.id);
    } catch (err) {
      console.error('Error adding task:', err);
    } finally {
      setAddingTask(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E2F4D] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Project Workspaces</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Real DB Kanban
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Where ideas transform into execution, collaborative Kanban tasks, and code repositories.
          </p>
        </div>

        <button
          onClick={() => setBuildModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-6 animate-pulse space-y-3" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-12 text-center space-y-3">
          <FolderGit2 className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No active projects yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Take any spark from the community and click "Build This Idea" to generate an active collaborative workspace.
          </p>
          <button
            onClick={() => setBuildModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs font-bold rounded-xl shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Launch First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Projects Selector List (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Workspaces ({projects.length})
            </h3>
            <div className="space-y-3">
              {projects.map(p => {
                const isSelected = selectedProject?.id === p.id;
                return (
                  <Card3D
                    key={p.id}
                    onClick={() => fetchProjectDetails(p.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#16253D] border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                        : 'bg-[#111C2E] border-[#1E2F4D] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                          <FolderGit2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">{p.title}</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono shrink-0">
                        {p.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{p.description}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                      <span>Tasks: {p.tasksSummary?.completed || 0}/{p.tasksSummary?.total || 0}</span>
                      {p.idea && (
                        <span className="text-cyan-400 font-medium truncate max-w-[140px]">
                          💡 {p.idea.title}
                        </span>
                      )}
                    </div>
                  </Card3D>
                );
              })}
            </div>
          </div>

          {/* Kanban Workspace (8 cols) */}
          {selectedProject ? (
            <div className="lg:col-span-8 space-y-6">
              {/* Project Workspace Details Header */}
              <div className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold font-mono">
                        {selectedProject.status}
                      </span>
                      {selectedProject.idea && (
                        <Link
                          to={`/ideas/${selectedProject.idea.id}`}
                          className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Originating Spark</span>
                        </Link>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-white">{selectedProject.title}</h2>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {selectedProject.description}
                    </p>
                  </div>

                  {/* External links */}
                  <div className="flex items-center gap-2">
                    {selectedProject.githubUrl && (
                      <a
                        href={selectedProject.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                        title="GitHub Repo"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {selectedProject.figmaUrl && (
                      <a
                        href={selectedProject.figmaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 transition-colors"
                        title="Figma Mockups"
                      >
                        <Figma className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Team Roster Snippet */}
                {selectedProject.team && (
                  <div className="pt-3 border-t border-[#1E2F4D] flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Team: <strong className="text-white">{selectedProject.team.name}</strong></span>
                      <span className="text-slate-500">({selectedProject.team.members?.length || 1} members)</span>
                    </div>
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {selectedProject.team.members?.map(m => (
                        <div
                          key={m.id}
                          title={`${m.user.name} (${m.role})`}
                          className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-[#111C2E]"
                        >
                          {m.user.name.charAt(0)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Add New Task Form */}
              <form onSubmit={handleCreateTask} className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="Add a new milestone or Kanban task..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 w-full"
                />
                <select
                  value={newTaskPriority}
                  onChange={e => setNewTaskPriority(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>
                <button
                  type="submit"
                  disabled={addingTask || !newTaskTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-900 font-bold text-xs shrink-0 transition-all flex items-center gap-1 w-full sm:w-auto justify-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </form>

              {/* Real Kanban Board Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map(colStatus => {
                  const tasksInCol = (selectedProject.tasks || []).filter(t => t.status === colStatus);
                  const colTitles = {
                    TODO: 'Backlog / To-Do',
                    IN_PROGRESS: 'In Progress',
                    DONE: 'Completed'
                  };
                  const colColor = {
                    TODO: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
                    IN_PROGRESS: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10',
                    DONE: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                  };

                  return (
                    <div key={colStatus} className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 space-y-3 flex flex-col">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${colColor[colStatus]}`}>
                          {colTitles[colStatus]}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {tasksInCol.length}
                        </span>
                      </div>

                      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[400px]">
                        {tasksInCol.length === 0 ? (
                          <div className="text-center py-6 text-[11px] text-slate-500 italic">
                            No tasks in this lane
                          </div>
                        ) : (
                          tasksInCol.map(task => (
                            <div
                              key={task.id}
                              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-sm space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-semibold text-white leading-snug">
                                  {task.title}
                                </span>
                              </div>

                              {task.description && (
                                <p className="text-[11px] text-slate-400 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                                <span className={`font-mono font-bold ${
                                  task.priority === 'HIGH' ? 'text-rose-400' :
                                  task.priority === 'MEDIUM' ? 'text-amber-400' : 'text-slate-400'
                                }`}>
                                  {task.priority}
                                </span>

                                {/* Quick column move select */}
                                <select
                                  value={task.status}
                                  onChange={e => handleUpdateTaskStatus(task.id, e.target.value)}
                                  className="bg-slate-800 text-slate-300 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                                >
                                  <option value="TODO">To-Do</option>
                                  <option value="IN_PROGRESS">In Progress</option>
                                  <option value="DONE">Done</option>
                                </select>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="lg:col-span-8 flex items-center justify-center p-12 text-slate-500 text-xs">
              Select a project to inspect its Kanban board.
            </div>
          )}
        </div>
      )}

      {/* Build Idea Modal */}
      {buildModalOpen && (
        <BuildIdeaModal
          isOpen={buildModalOpen}
          onClose={() => setBuildModalOpen(false)}
          onSuccess={() => loadProjects()}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
