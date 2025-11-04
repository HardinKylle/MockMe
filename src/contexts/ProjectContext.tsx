// src/contexts/ProjectContext.tsx
'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from 'react';
import { useProjectStorage } from '@/hooks/useProjectStorage';

// Import all the contexts this "brain" will control
import { useAuth } from '@/contexts/AuthContext';
import { useAnimation, DEFAULT_TOTAL_DURATION } from '@/contexts/AnimationContext';
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
  },[
    setAnimationScenes,
    setTotalVideoDuration,
    dispatchSceneControls,
    setModel,
    setUploadedFileUrl,
    setUploadedFileType
  ]);

  /** Resets the entire app state to default ("closes" the project). */
  const closeProject = useCallback(() => {
    const defaultProject: ProjectData = {
      id: '', name: '', ownerId: '', createdAt: 0,
      animationState: {
        animationScenes: [],
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
  }, [reinflateState, setModel]);
  
  
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
    const project = await storageLoadProject(projectId);
    if (project) {
      reinflateState(project);
      setActiveProject({ id: projectId, name });
    }
  }, [storageLoadProject, reinflateState]);

  const saveCurrentProject = useCallback(async () => {
    if (!activeProject) return;
    const { animationState, sceneState, assetState } = gatherCurrentState();
    await updateProject(
      activeProject.id,
      activeProject.name,
      animationState,
      sceneState,
      assetState
    );
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
      setActiveProject({ id: newProjectId, name });
      fetchProjects(); // Refresh the list
    }
    return newProjectId;
  }, [gatherCurrentState, createProject, fetchProjects]);

  const deleteProject = useCallback(async (projectId: string) => {
    await storageDeleteProject(projectId);
    fetchProjects(); // Refresh the list
  }, [storageDeleteProject, fetchProjects]);
  

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