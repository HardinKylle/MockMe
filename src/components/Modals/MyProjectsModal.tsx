'use client';

import { useState, useEffect } from 'react';
import { useModal } from '@/contexts/ModalContext';
import { useProjectStorage } from '@/hooks/useProjectStorage';
import { ProjectData } from '@/types/project';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { X, Loader, Save, FolderDown, Trash2 } from 'lucide-react';

export const MyProjectsModal = () => {
    const { isProjectModalOpen, closeProjectsModal } = useModal();

    const {
        saveProject,
        loadProject,
        getProjects,
        deleteProject,
        isSaving,
        isLoading,
        error,
    } = useProjectStorage();

    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [projectName, setProjectName] = useState('');
    const [isListLoading, setIsListLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Fetch projects when modal opens
    useEffect(() => {
        if (isProjectModalOpen) {
            setFetchError(null);
            setIsListLoading(true); // 1. Start loading

            getProjects()
                .then(setProjects) // 2. Set projects on success
                .catch(() => setFetchError('Could not load projects.')) // 3. Set error on fail
                .finally(() => setIsListLoading(false)); // 4. Stop loading
        }
    }, [isProjectModalOpen, getProjects]); // getProjects is stable

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (projectName.trim() === '') return;

        const newProjectId = await saveProject(projectName);
        if (newProjectId) {
            //Refresh list and clear input

            getProjects().then(setProjects);
            setProjectName('');
        }
    };

    const handleLoad = async (projectId: string) => {
        await loadProject(projectId);
        // This `error` is the one from the hook, set by loadProject
        if (!error) {
            closeProjectsModal();
        }
    };

    const handleClose = () => {
        if (isSaving) return;

        setProjectName('');
        setFetchError(null);
        closeProjectsModal();
    };

    if (!isProjectModalOpen) {
        return null;
    }

    const handleDelete = async (projectId: string) => {
        setIsDeleting(projectId); // Show spinner on this button
        await deleteProject(projectId);
        // Refresh the list
        getProjects()
            .then(setProjects)
            .catch(() => setFetchError('Could not refresh projects.'));
        setIsDeleting(null); // Hide spinner
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
                className="w-full max-w-lg rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50"
                style={{ animation: 'slideUp 0.2s ease-out' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                    <h3 className="text-lg font-medium text-white">My Projects</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        disabled={isSaving || !!isDeleting} // Updated
                    >
                        <X className="h-5 w-5 text-slate-400" />
                    </Button>
                </div>

                {/* Body */}
                <div className="flex flex-col md:flex-row">
                    {/* Left Side: Save New Project */}
                    <div className="w-full md:w-1/2 p-5 border-b md:border-b-0 md:border-r border-slate-700/50">
                        <form onSubmit={handleSave} className="space-y-4">
                            <h4 className="text-md font-medium text-white">
                                Save Current Project
                            </h4>
                            <div className="space-y-1.5">
                                <Label htmlFor="project-name" className="text-slate-300">
                                    Project Name
                                </Label>
                                <Input
                                    id="project-name"
                                    placeholder="My Awesome Animation"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    disabled={isSaving || !!isDeleting} // Updated
                                />
                            </div>
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full"
                                disabled={isSaving || !!isDeleting || projectName.trim() === ''} // Updated
                            >
                                {isSaving ? (
                                    <Loader className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save
                                    </>
                                )}
                            </Button>
                            {error && <p className="text-sm text-red-400">{error}</p>}
                        </form>
                    </div>

                    {/* Right Side: Load Existing */}
                    <div className="w-full md:w-1/2 p-5">
                        <h4 className="text-md font-medium text-white mb-4">
                            Load Project
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {/* 1. Show loader when LIST is loading */}
                            {isListLoading && (
                                <div className="flex justify-center p-4">
                                    <Loader className="h-6 w-6 animate-spin text-white" />
                                </div>
                            )}

                            {/* 2. Show error if FETCH failed */}
                            {!isListLoading && fetchError && (
                                <p className="text-sm text-red-400">{fetchError}</p>
                            )}

                            {/* 3. Show "No projects" only after loading is false AND no error */}
                            {!isListLoading && !fetchError && projects.length === 0 && (
                                <p className="text-sm text-slate-400">
                                    You have no saved projects.
                                </p>
                            )}

                            {/* 4. Show projects only after loading is false AND no error */}
                            {!isListLoading &&
                                !fetchError &&
                                projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50"
                                    >
                                        {/* Project Info */}
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                {project.name}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                Saved: {new Date(project.createdAt).toLocaleString()}
                                            </p>
                                        </div>

                                        {/* Button Group */}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="secondary"
                                                size="xs"
                                                onClick={() => handleLoad(project.id)}
                                                // Disable if a different action is in progress
                                                disabled={isLoading || isSaving || !!isDeleting}
                                            >
                                                {/* We use 'isLoading' for the LOAD button */}
                                                {isLoading ? (
                                                    <Loader className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <FolderDown className="h-4 w-4 mr-1.5" />
                                                        Load
                                                    </>
                                                )}
                                            </Button>

                                            {/* NEW DELETE BUTTON */}
                                            <Button
                                                variant="danger"
                                                size="xs"
                                                className="px-2"
                                                onClick={() => handleDelete(project.id)}
                                                // Disable if a different action is in progress
                                                disabled={isLoading || isSaving || !!isDeleting}
                                            >
                                                {/* Show spinner only for the item being deleted */}
                                                {isDeleting === project.id ? (
                                                    <Loader className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                            {/* Show general hook error (e.g., from a failed loadProject) */}
                            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}