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

import { useAuth } from '@/contexts/AuthContext';
import { useAnimation, DEFAULT_TOTAL_DURATION, defaultScene } from '@/contexts/AnimationContext';
import { useScene, DEFAULT_SCENE_CONTROLS } from '@/contexts/SceneContext';
import { useAsset } from '@/contexts/AssetContext';

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
  isProjectLoading: boolean; 
  isProjectSaving: boolean;
  isListLoading: boolean; 
  projectError: string | null;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
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

  const [activeProject, setActiveProject] = useState<ActiveProject | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);
  const [loadedProjectData, setLoadedProjectData] = useState<ProjectData | null>(
    null
  );
  const { user } = useAuth();
  const { animationScenes, totalVideoDuration } = useAnimation();
  const { sceneControls } = useScene();
  const { selectedModel, uploadedFileUrl, uploadedFileType } = useAsset();

  const { setAnimationScenes, setTotalVideoDuration } = useAnimation();
  const { dispatchSceneControls } = useScene();
  const { setModel, setUploadedFileUrl, setUploadedFileType } = useAsset();

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
        selectedModelName: 'iPhone 15 Pro', 
        uploadedFileUrl: null,
        uploadedFileType: null,
      },
    };
    reinflateState(defaultProject);
    setActiveProject(null);
    setLoadedProjectData(null);
  }, [reinflateState]);


  const closeProject = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to start a new project? All current changes will be lost."
      );
      if (!confirmed) {
        return; 
      }
    }
    resetProjectState(); 
  }, [isDirty, resetProjectState]);


  const fetchProjects = useCallback(async () => {
    setIsListLoading(true);
    try {
      const projectList = await storageGetProjects();
      setProjects(projectList);
    } catch {
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
        return; 
      }
    }

    const project = await storageLoadProject(projectId);
    if (project) {
      reinflateState(project);
      setActiveProject({ id: projectId, name });
      setLoadedProjectData(project); 
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

      // After a successful save, update our "last saved" state
      setLoadedProjectData(prevData => ({
        ...prevData!, 
        id: activeProject.id,
        name: activeProject.name,
        animationState,
        sceneState,
        assetState,
      }));
      // ---
    } catch {
      // Save failed — error is surfaced via useProjectStorage's error state
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
      // The new project is now our "last saved" state
      const newProjectData: ProjectData = {
        id: newProjectId,
        name: name,
        ownerId: user!.uid, 
        createdAt: Date.now(), 
        animationState,
        sceneState,
        assetState,
      };
      setLoadedProjectData(newProjectData);
      // ---

      setActiveProject({ id: newProjectId, name });
      fetchProjects();
    }
    return newProjectId;
  }, [gatherCurrentState, createProject, fetchProjects, user]);

  const deleteProject = useCallback(async (projectId: string) => {
    await storageDeleteProject(projectId);

    if (activeProject && activeProject.id === projectId) {
      // We just deleted the active project.
      // Reset the state *without* a warning.
      resetProjectState(); // 
    }
    // ---
    fetchProjects(); 
  }, [
    storageDeleteProject,
    fetchProjects,
    activeProject,
    resetProjectState // 
  ]);

  useEffect(() => {
    // This is the function that runs when the user tries to leave
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Check for signed-in user AND unsaved changes
      if (user && isDirty) {
        event.preventDefault();
        event.returnValue = ''; // Required for most browsers
        return ''; // Required for some older browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, isDirty]);

  const value = {
    activeProject,
    projects,
    fetchProjects,
    loadProject,
    saveCurrentProject,
    saveAsNewProject,
    deleteProject,
    closeProject, 
    isProjectLoading: isLoading,
    isProjectSaving: isSaving,
    isListLoading,
    projectError: error,
    isDirty, 
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