// src/contexts/ProjectContext.tsx
'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useMemo,
  useEffect
} from 'react';
import { useProjectStorage } from '@/hooks/useProjectStorage';

// Import all the contexts this "brain" will control
import { useAuth } from '@/contexts/AuthContext';
import { useAnimation, DEFAULT_TOTAL_DURATION, defaultScene } from '@/contexts/AnimationContext';
import { useScene, DEFAULT_SCENE_CONTROLS } from '@/contexts/SceneContext';
import { useAsset } from '@/contexts/AssetContext';

// Import types
import { SavedAnimationState, SavedAssetState, ProjectData } from '@/types/project';
import { SceneControlState } from '@/contexts/SceneContext';


interface ActiveProject {
  id: string;
  name: string;
}

interface ProjectContextType {
  activeProject: ActiveProject | null;
  projects: ProjectData[];
  fetchProjects: () => Promise<void>;
  loadProject: (projectId: string, name: string) => Promise<void>;
  saveCurrentProject: () => Promise<void>;
  saveAsNewProject: (name: string) => Promise<string | null>;
  deleteProject: (projectId: string) => Promise<void>;
  closeProject: () => void;
  isProjectLoading: boolean; // For loading a project
  isProjectSaving: boolean; // For saving/updating a project
  isListLoading: boolean; // For fetching the list
  projectError: string | null;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  // --- 1. LOW-LEVEL "TOOL" ---
  const {
    createProject,
    updateProject,
    loadProject: storageLoadProject,
    getProjects: storageGetProjects,
    deleteProject: storageDeleteProject,
    isSaving,
    isLoading,
    error,
  } = useProjectStorage();

  // --- 2. HIGH-LEVEL STATE ---
  const [activeProject, setActiveProject] = useState<ActiveProject | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);
  const [loadedProjectData, setLoadedProjectData] = useState<ProjectData | null>(
    null
  );
  // --- 3. GETTERS (from all contexts) ---
  const { user } = useAuth();
  const { animationScenes, totalVideoDuration } = useAnimation();
  const { sceneControls } = useScene();
  const { selectedModel, uploadedFileUrl, uploadedFileType } = useAsset();

  // --- 4. SETTERS (from all contexts) ---
  const { setAnimationScenes, setTotalVideoDuration } = useAnimation();
  const { dispatchSceneControls } = useScene();
  const { setModel, setUploadedFileUrl, setUploadedFileType } = useAsset();

  // --- 5. HELPER FUNCTION ---
  /** Gathers a snapshot of the entire app state */
  const gatherCurrentState = useCallback(() => {
    const animationState: SavedAnimationState = {
      animationScenes,
      totalVideoDuration,
    };
    const assetState: SavedAssetState = {
      selectedModelName: selectedModel.name,
      uploadedFileUrl: uploadedFileUrl,
      uploadedFileType: uploadedFileType,
    };
    const sceneState: SceneControlState = sceneControls;

    return { animationState, sceneState, assetState };
  }, [
    animationScenes,
    totalVideoDuration,
    selectedModel,
    uploadedFileUrl,
    uploadedFileType,
    sceneControls,
  ]);

  const isDirty = useMemo(() => {
    // If no project is loaded, it's not "dirty" (it's a new, unsaved project)
    if (!loadedProjectData) {
      return false;
    }

    // Gather the current state
    const currentState = gatherCurrentState();

    // Get the equivalent "saved" state from our stored data
    const savedState = {
      animationState: loadedProjectData.animationState,
      sceneState: loadedProjectData.sceneState,
      assetState: loadedProjectData.assetState,
    };

    // A simple, effective way to deep-compare the states
    return JSON.stringify(currentState) !== JSON.stringify(savedState);
  }, [loadedProjectData, gatherCurrentState]);

  /** "Re-inflates" the app from loaded data */
  const reinflateState = useCallback((project: ProjectData) => {
    setAnimationScenes(project.animationState.animationScenes);
    setTotalVideoDuration(project.animationState.totalVideoDuration);
    dispatchSceneControls({
      type: 'UPDATE_RAW',
      payload: project.sceneState,
    });
    setModel(project.assetState.selectedModelName);
    setUploadedFileUrl(project.assetState.uploadedFileUrl);
    setUploadedFileType(project.assetState.uploadedFileType);
  }, [
    setAnimationScenes,
    setTotalVideoDuration,
    dispatchSceneControls,
    setModel,
    setUploadedFileUrl,
    setUploadedFileType
  ]);

  /** Resets the entire app state to default ("closes" the project). */
  const resetProjectState = useCallback(() => {
    const defaultProject: ProjectData = {
      id: '', name: '', ownerId: '', createdAt: 0,
      animationState: {
        animationScenes: [defaultScene],
        totalVideoDuration: DEFAULT_TOTAL_DURATION,
      },
      sceneState: DEFAULT_SCENE_CONTROLS,
      assetState: {
        selectedModelName: 'iPhone 15 Pro', // HACK: Should get from config
        uploadedFileUrl: null,
        uploadedFileType: null,
      },
    };
    reinflateState(defaultProject);
    setActiveProject(null);
    setLoadedProjectData(null);
  }, [reinflateState, setModel]);


  const closeProject = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to start a new project? All current changes will be lost."
      );
      if (!confirmed) {
        return; // User clicked "Cancel"
      }
    }
    resetProjectState(); // Proceed with closing
  }, [isDirty, resetProjectState]);

  // --- 6. HIGH-LEVEL API FUNCTIONS ---

  const fetchProjects = useCallback(async () => {
    setIsListLoading(true);
    try {
      const projectList = await storageGetProjects();
      setProjects(projectList);
    } catch (e) {
      console.error(e);
      setProjects([]);
    }
    setIsListLoading(false);
  }, [storageGetProjects]);

  const loadProject = useCallback(async (projectId: string, name: string) => {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to load a new project? All current changes will be lost."
      );
      if (!confirmed) {
        return; // User clicked "Cancel"
      }
    }

    const project = await storageLoadProject(projectId);
    if (project) {
      reinflateState(project);
      setActiveProject({ id: projectId, name });
      setLoadedProjectData(project); // <-- MUST SET THIS
    }
  }, [storageLoadProject, reinflateState, isDirty]);

  const saveCurrentProject = useCallback(async () => {
    if (!activeProject) return;
    const { animationState, sceneState, assetState } = gatherCurrentState();

    try {
      await updateProject(
        activeProject.id,
        activeProject.name,
        animationState,
        sceneState,
        assetState
      );

      // --- ADD THIS ---
      // After a successful save, update our "last saved" state
      setLoadedProjectData(prevData => ({
        ...prevData!, // It must exist if we have an activeProject
        id: activeProject.id,
        name: activeProject.name,
        animationState,
        sceneState,
        assetState,
      }));
      // ---
    } catch (e) {
      // Don't update loaded data if save failed
      console.error("Save failed:", e);
    }
  }, [activeProject, gatherCurrentState, updateProject]);

  const saveAsNewProject = useCallback(async (name: string): Promise<string | null> => {
    const { animationState, sceneState, assetState } = gatherCurrentState();
    const newProjectId = await createProject(
      name,
      animationState,
      sceneState,
      assetState
    );

    if (newProjectId) {
      // --- ADD THIS ---
      // The new project is now our "last saved" state
      const newProjectData: ProjectData = {
        id: newProjectId,
        name: name,
        ownerId: user!.uid, // createProject ensures user exists
        createdAt: Date.now(), // Close enough for dirty check
        animationState,
        sceneState,
        assetState,
      };
      setLoadedProjectData(newProjectData);
      // ---

      setActiveProject({ id: newProjectId, name });
      fetchProjects(); // Refresh the list
    }
    return newProjectId;
  }, [gatherCurrentState, createProject, fetchProjects, user]);

  const deleteProject = useCallback(async (projectId: string) => {
    await storageDeleteProject(projectId);

    // --- UPDATE THIS BLOCK ---
    if (activeProject && activeProject.id === projectId) {
      // We just deleted the active project.
      // Reset the state *without* a warning.
      resetProjectState(); // <-- Call the UNSAFE reset
    }
    // ---
    fetchProjects(); // Refresh the list
  }, [
    storageDeleteProject,
    fetchProjects,
    activeProject,
    resetProjectState // <-- Use the unsafe reset
  ]);

  useEffect(() => {
    // This is the function that runs when the user tries to leave
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Check for signed-in user AND unsaved changes
      if (user && isDirty) {
        // This is the standard way to trigger the browser's "Leave site?" popup
        event.preventDefault();
        event.returnValue = ''; // Required for most browsers
        return ''; // Required for some older browsers
      }
    };

    // Add the event listener when the component mounts
    window.addEventListener('beforeunload', handleBeforeUnload);

    // This is the cleanup function that removes the listener
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, isDirty]);

  // --- 7. UPDATE THE RETURN VALUE ---
  const value = {
    activeProject,
    projects,
    fetchProjects,
    loadProject,
    saveCurrentProject,
    saveAsNewProject,
    deleteProject,
    closeProject, // <-- This is now the SAFE function
    isProjectLoading: isLoading,
    isProjectSaving: isSaving,
    isListLoading,
    projectError: error,
    isDirty, // <-- EXPOSE THE 'isDirty' FLAG
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};