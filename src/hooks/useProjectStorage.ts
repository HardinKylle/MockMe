"use client";

import { useState, useCallback } from "react";
import { db, storage, auth } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  limit,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { useAuth } from "@/contexts/AuthContext";
import { useAnimation } from "@/contexts/AnimationContext";
import { useScene } from "@/contexts/SceneContext";
import { useAsset } from "@/contexts/AssetContext";

import {
  ProjectData,
  SavedAnimationState,
  SavedAssetState,
} from "@/types/project";

export interface UseProjectStorageReturn {
  saveProject: (name: string) => Promise<string | null>;
  loadProject: (projectId: string) => Promise<void>;
  getProjects: () => Promise<ProjectData[]>;
  deleteProject: (projectId: string) => Promise<void>;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useProjectStorage = (): UseProjectStorageReturn => {
  const { user } = useAuth();

  // Get All State "Getters"
  const { animationScenes, totalVideoDuration } = useAnimation();
  const { sceneControls } = useScene();
  const { selectedModel, uploadedFileUrl, uploadedFileType } = useAsset();

  // Get All State "Setters"
  const { setAnimationScenes, setTotalVideoDuration } = useAnimation();
  const { dispatchSceneControls } = useScene();
  const { setModel, setUploadedFileUrl, setUploadedFileType } = useAsset();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles uploading a local file (blob) to Firebase Storage.
   * If the file is already a Firebase URL, it returns it.
   */
  const uploadFileAsNeeded = useCallback(
    async (fileUrl: string | null): Promise<string | null> => {
      if (!fileUrl || !fileUrl.startsWith("blob:")) {
        return fileUrl;
      }
      if (!user) throw new Error("User not authenticated for file upload.");

      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const storageRef = ref(storage, `user_files/${user.uid}/${Date.now()}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    },
    [user]
  );

  /**
   * Saves the entire current app state as a new project in Firestore.
   */
  const saveProject = useCallback(async (
    name: string
  ): Promise<string | null> => {
    setIsSaving(true);
    setError(null);

    if (!user || !user.emailVerified) {
      setError('You must be signed in and verified to save a project.');
      setIsSaving(false);
      return null;
    }

    try {
      const projectsCollection = collection(db, 'users', user.uid, 'projects');
      const q = query(projectsCollection, limit(3));
      const projectsSnapshot = await getDocs(q);

      if (projectsSnapshot.size >= 3) {
        throw new Error(
          'Project limit (3) reached. Please delete an old project.'
        );
      }

      const finalUploadedFileUrl = await uploadFileAsNeeded(uploadedFileUrl);

      const animationState: SavedAnimationState = {
        animationScenes,
        totalVideoDuration,
      };
      const assetState: SavedAssetState = {
        selectedModelName: selectedModel.name,
        uploadedFileUrl: finalUploadedFileUrl,
        uploadedFileType: uploadedFileType,
      };

      const newProjectRef = doc(projectsCollection);
      const newProject: ProjectData = {
        id: newProjectRef.id,
        name: name,
        ownerId: user.uid,
        createdAt: Date.now(),
        animationState,
        sceneState: sceneControls,
        assetState,
      };

      await setDoc(newProjectRef, newProject);
      setIsSaving(false);
      return newProjectRef.id;
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      setIsSaving(false);
      return null;
    }
  }, [
    user, 
    uploadFileAsNeeded, 
    animationScenes, 
    totalVideoDuration, 
    selectedModel, 
    uploadedFileUrl, 
    uploadedFileType, 
    sceneControls
  ]);

  /**
   * Fetches a project from Firestore and "re-inflates" the app state.
   */
  const loadProject = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);

    if (!user) {
      setError('You must be signed in to load a project.');
      setIsLoading(false);
      return;
    }

    try {
      const projectRef = doc(db, 'users', user.uid, 'projects', projectId);
      const docSnap = await getDoc(projectRef);
      if (!docSnap.exists()) throw new Error('Project not found.');
      const project = docSnap.data() as ProjectData;

      setAnimationScenes(project.animationState.animationScenes);
      setTotalVideoDuration(project.animationState.totalVideoDuration);
      dispatchSceneControls({
        type: 'UPDATE_RAW',
        payload: project.sceneState,
      });
      setModel(project.assetState.selectedModelName);
      setUploadedFileUrl(project.assetState.uploadedFileUrl);
      setUploadedFileType(project.assetState.uploadedFileType);

      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      setIsLoading(false);
    }
  }, [
    user, 
    setAnimationScenes, 
    setTotalVideoDuration, 
    dispatchSceneControls, 
    setModel, 
    setUploadedFileUrl, 
    setUploadedFileType
  ]);

  /**
   * Fetches a list of all projects for the current user.
   */
  const getProjects = useCallback(async (): Promise<ProjectData[]> => {
    if (!user) {
      throw new Error('You must be signed in to get projects.');
    }
    try {
      const projectsCollection = collection(db, 'users', user.uid, 'projects');
      const q = query(projectsCollection);
      const querySnapshot = await getDocs(q);
      const projects = querySnapshot.docs.map((doc) => doc.data() as ProjectData);
      return projects.sort((a, b) => b.createdAt - a.createdAt);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [user]); // <-- Dependency

  const deleteProject = useCallback(async (projectId: string) => {
    setIsLoading(true); // Use 'isLoading' to block other actions
    setError(null);

    if (!user) {
      setError('You must be signed in.');
      setIsLoading(false);
      return;
    }

    try {
      const projectRef = doc(db, 'users', user.uid, 'projects', projectId);
      
      // --- First, get the doc to find its file URL ---
      const docSnap = await getDoc(projectRef);
      if (docSnap.exists()) {
        const project = docSnap.data() as ProjectData;
        const fileUrl = project.assetState.uploadedFileUrl;

        // If it has a file and it's a Firebase file, delete it
        if (fileUrl && fileUrl.includes('firebasestorage.googleapis.com')) {
          try {
            const fileStorageRef = ref(storage, fileUrl);
            await deleteObject(fileStorageRef);
          } catch (storageError) {
            // Log the error, but don't block deleting the db entry
            console.warn("Could not delete file from storage:", storageError);
          }
        }
      }
      
      // --- Now, delete the Firestore document ---
      await deleteDoc(projectRef);
      
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return { saveProject, loadProject, getProjects, deleteProject,isSaving, isLoading, error };

  
};

