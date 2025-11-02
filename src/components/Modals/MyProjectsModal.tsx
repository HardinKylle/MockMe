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
                        disabled={isSaving || !!isDeleting}
                    >
                        <X className="h-5 w-5 text-slate-400" />
                    </Button>
                </div>

                {/* Main Content: Load Existing Projects */}
                <div className="p-6 h-[32rem] overflow-y-auto space-y-3">
                    {/* 1. Show loader when LIST is loading */}
                    {isListLoading && (
                        <div className="flex justify-center items-center h-full">
                            <Loader className="h-8 w-8 animate-spin text-white" />
                        </div>
                    )}

                    {/* 2. Show error if FETCH failed */}
                    {!isListLoading && fetchError && (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-slate-400">{fetchError}</p>
                        </div>
                    )}

                    {/* 3. Show "No projects" only after loading is false AND no error */}
                    {!isListLoading && !fetchError && projects.length === 0 && (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-slate-400">You have no saved projects.</p>
                        </div>
                    )}

                    {/* 4. Show projects only after loading is false AND no error */}
                    {!isListLoading &&
                        !fetchError &&
                        projects.map((project) => (
                            <div
                                key={project.id}
                                className="flex justify-between items-center p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 transition-colors"
                            >
                                {/* Project Info */}
                                <div>
                                    <p className="text-base font-medium text-white">
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
                                        size="md" // Made button bigger
                                        onClick={() => handleLoad(project.id)}
                                        disabled={isLoading || isSaving || !!isDeleting}
                                    >
                                        {isLoading ? (
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
                                        size="md" // Made button bigger
                                        className="px-3" // Give icon-only button some padding
                                        onClick={() => handleDelete(project.id)}
                                        disabled={isLoading || isSaving || !!isDeleting}
                                    >
                                        {isDeleting === project.id ? (
                                            <Loader className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                </div>

                {/* Footer: Save New Project */}
                <div className="p-6 border-t border-slate-700/50 bg-slate-900/50 rounded-b-lg">
                    <form onSubmit={handleSave} className="flex items-end gap-3">
                        <div className="flex-1 space-y-1.5">
                            <Label htmlFor="project-name" className="text-xs text-slate-300">
                                Save Current Project As...
                            </Label>
                            <Input
                                id="project-name"
                                placeholder="My Awesome Animation"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                disabled={isSaving || !!isDeleting}
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="primary"
                            size="md" // Made button bigger
                            disabled={isSaving || !!isDeleting || projectName.trim() === ''}
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
                    </form>
                    {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
                </div>
            </div>
        </div>
    );
}