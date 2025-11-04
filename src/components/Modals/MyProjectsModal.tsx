// src/components/Modals/MyProjectsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useModal } from '@/contexts/ModalContext';
import { useProject } from '@/contexts/ProjectContext'; // <-- 1. IMPORT THE NEW HOOK
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { X, Loader, Save, FolderDown, Trash2 } from 'lucide-react';

export const MyProjectsModal = () => {
  const { isProjectsModalOpen, closeProjectsModal } = useModal();
  
  // --- 2. GET ALL STATE AND FUNCTIONS FROM THE NEW HOOK ---
  const {
    activeProject,
    projects,
    fetchProjects,
    loadProject,
    saveCurrentProject,
    saveAsNewProject,
    deleteProject,
    isProjectLoading,
    isProjectSaving,
    isListLoading,
    projectError,
  } = useProject();

  // This state is just for the "Save As" input field
  const [newProjectName, setNewProjectName] = useState('');

  // Fetch projects when modal opens
  useEffect(() => {
    if (isProjectsModalOpen) {
      fetchProjects();
      // Clear the input field every time modal is opened
      setNewProjectName('');
    }
    // fetchProjects is memoized with useCallback, so this is safe
  }, [isProjectsModalOpen, fetchProjects]);

  // --- 3. HANDLERS ARE NOW MUCH SIMPLER ---

  const handleSaveAs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim() === '') return;
    const newProjectId = await saveAsNewProject(newProjectName);
    if (newProjectId) {
      setNewProjectName(''); // Clear input on success
    }
  };
  
  const handleSaveUpdate = async () => {
    await saveCurrentProject();
    // You could show a "Saved!" message here
    // For now, it just updates the project
  };

  const handleLoad = async (projectId: string, name: string) => {
    await loadProject(projectId, name);
    if (!projectError) {
      closeProjectsModal();
    }
  };
  
  const handleDelete = async (projectId: string) => {
    // You could add a window.confirm here
    // const isConfirmed = confirm("Are you sure you want to delete this project?");
    // if (isConfirmed) {
      await deleteProject(projectId);
    // }
  };

  const handleClose = () => {
    // Block close if any operation is in progress
    if (isProjectSaving || isProjectLoading) return; 
    closeProjectsModal();
  };

  if (!isProjectsModalOpen) {
    return null;
  }

  // --- 4. THE JSX IS UPDATED TO REFLECT THE NEW LOGIC ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-3xl rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 flex flex-col"
        style={{ animation: 'slideUp 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h3 className="text-lg font-medium text-white">My Projects</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isProjectSaving || isProjectLoading}
          >
            <X className="h-5 w-5 text-slate-400" />
          </Button>
        </div>

        {/* Main Content: Load Existing Projects */}
        <div className="p-6 h-128 overflow-y-auto space-y-3">
          {/* Use 'isListLoading' from context */}
          {isListLoading && (
            <div className="flex justify-center items-center h-full">
              <Loader className="h-8 w-8 animate-spin text-white" />
            </div>
          )}

          {/* Use 'projectError' from context (for fetch error) */}
          {!isListLoading && projectError && (
            <div className="flex justify-center items-center h-full">
              <p className="text-slate-400">{projectError}</p>
            </div>
          )}

          {/* Use 'projects' from context */}
          {!isListLoading && !projectError && projects.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <p className="text-slate-400">You have no saved projects.</p>
            </div>
          )}

          {/* Use 'projects' from context */}
          {!isListLoading &&
            !projectError &&
            projects.map((project) => (
              <div
                key={project.id}
                className={`flex justify-between items-center p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 transition-colors
                  ${activeProject?.id === project.id ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                <div>
                  <p className="text-base font-medium text-white">
                    {project.name}
                    {activeProject?.id === project.id && (
                      <span className="ml-2 text-xs font-normal text-blue-400">(Loaded)</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">
                    Saved: {new Date(project.createdAt).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => handleLoad(project.id, project.name)}
                    // Disable if this one is active, or any action is in progress
                    disabled={activeProject?.id === project.id || isProjectLoading || isProjectSaving}
                  >
                    {/* Use 'isProjectLoading' for the load button */}
                    {isProjectLoading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <FolderDown className="h-4 w-4 mr-2" />
                        Load
                      </>
                    )}
                  </Button>

                  <Button
                    variant="danger"
                    size="md"
                    className="px-3"
                    onClick={() => handleDelete(project.id)}
                    disabled={isProjectLoading || isProjectSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
        </div>

        {/* --- 5. REDESIGNED FOOTER --- */}
        <div className="p-6 border-t border-slate-700/50 bg-slate-900/50 rounded-b-lg">
          
          {/* --- SECTION 1: "SAVE" (UPDATE) --- */}
          {/* This only shows if a project is open */}
          {activeProject && (
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/50">
              <div className="flex-1">
                <p className="text-xs text-slate-400">Currently Editing</p>
                <p className="text-lg font-bold text-white truncate">
                  {activeProject.name}
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleSaveUpdate}
                disabled={isProjectSaving || isProjectLoading}
              >
                {/* Use 'isProjectSaving' for save buttons */}
                {isProjectSaving ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
          
          {/* --- SECTION 2: "SAVE AS" (CREATE) --- */}
          <form onSubmit={handleSaveAs} className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="project-name" className="text-xs text-slate-300">
                {activeProject ? 'Or Save As a New Project...' : 'Save Current Project As...'}
              </Label>
              <Input
                id="project-name"
                placeholder="My New Project"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                disabled={isProjectSaving || isProjectLoading}
              />
            </div>
            <Button
              type="submit"
              variant={activeProject ? "secondary" : "primary"} // Make it primary if it's the only option
              size="md"
              disabled={isProjectSaving || isProjectLoading || newProjectName.trim() === ''}
            >
              {isProjectSaving ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save As New
                </>
              )}
            </Button>
          </form>
          
          {/* Show general project error (e.g., from a failed save) */}
          {projectError && <p className="text-sm text-red-400 mt-2">{projectError}</p>}
        </div>
      </div>
    </div>
  );
};
