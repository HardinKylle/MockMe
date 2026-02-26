// src/hooks/useProjectStorage.ts
"use client";

import { useState, useCallback } from "react";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  limit,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { useAuth } from "@/contexts/AuthContext";

import {
  ProjectData,
  SavedAnimationState,
  SavedAssetState,
} from "@/types/project";
import { SceneControlState } from "@/contexts/SceneContext";

export interface UseProjectStorageReturn {
  createProject: (
    name: string,
    animationState: SavedAnimationState,
    sceneState: SceneControlState,
    assetState: SavedAssetState
  ) => Promise<string | null>;
  updateProject: (
    projectId: string,
    name: string,
    animationState: SavedAnimationState,
    sceneState: SceneControlState,
    assetState: SavedAssetState
  ) => Promise<void>;
  loadProject: (projectId: string) => Promise<ProjectData | null>;
  getProjects: () => Promise<ProjectData[]>;
  deleteProject: (projectId: string) => Promise<void>;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useProjectStorage = (): UseProjectStorageReturn => {
  const { user } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Uploads a blob if needed.
   * it just takes a URL and user ID.
   */
  const uploadFileAsNeeded = useCallback(
    async (fileUrl: string | null, userId: string): Promise<string | null> => {
      if (!fileUrl || !fileUrl.startsWith("blob:")) {
        return fileUrl;
      }

      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const storageRef = ref(storage, `user_files/${userId}/${Date.now()}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    },
    []
  );

  /**
   * Creates a new project document in Firestore.
   */
  const createProject = useCallback(
    async (
      name: string,
      animationState: SavedAnimationState,
      sceneState: SceneControlState,
      assetState: SavedAssetState
    ): Promise<string | null> => {
      setIsSaving(true);
      setError(null);

      if (!user || !user.emailVerified) {
        setError("You must be signed in and verified to save a project.");
        setIsSaving(false);
        return null;
      }

      try {
        const projectsCollection = collection(
          db,
          "users",
          user.uid,
          "projects"
        );
        const q = query(projectsCollection, limit(3));
        const projectsSnapshot = await getDocs(q);

        if (projectsSnapshot.size >= 3) {
          throw new Error(
            "Project limit (3) reached. Please delete an old project."
          );
        }

        // Upload file if it's a new blob
        const finalUploadedFileUrl = await uploadFileAsNeeded(
          assetState.uploadedFileUrl,
          user.uid
        );

        const newAssetSate: SavedAssetState = {
          ...assetState,
          uploadedFileUrl: finalUploadedFileUrl,
        };

        const newProjectRef = doc(projectsCollection);
        const newProject: ProjectData = {
          id: newProjectRef.id,
          name: name,
          ownerId: user.uid,
          createdAt: Date.now(),
          animationState,
          sceneState,
          assetState: newAssetSate,
        };

        await setDoc(newProjectRef, newProject);
        setIsSaving(false);
        return newProjectRef.id;
      } catch (err) {
        setError((err as Error).message);
        setIsSaving(false);
        return null;
      }
    },
    [user, uploadFileAsNeeded]
  );

  /**
   * Updates an existing project document in Firestore.
   */
  const updateProject = useCallback(
    async (
      projectId: string,
      name: string,
      animationState: SavedAnimationState,
      sceneState: SceneControlState,
      assetState: SavedAssetState
    ) => {
      setIsSaving(true);
      setError(null);

      if (!user || !user.emailVerified) {
        setError("You must be signed in to update a project.");
        setIsSaving(false);
        return;
      }

      try {
        // Upload file if it's a new blob
        const finalUploadedFileUrl = await uploadFileAsNeeded(
          assetState.uploadedFileUrl,
          user.uid
        );

        const newAssetSate: SavedAssetState = {
          ...assetState,
          uploadedFileUrl: finalUploadedFileUrl,
        };

        const projectRef = doc(db, "users", user.uid, "projects", projectId);

        // use updateDoc to only change these fields,
        // keeping the createdAt date the same.
        await updateDoc(projectRef, {
          name: name, 
          animationState,
          sceneState,
          assetState: newAssetSate,
        });

        setIsSaving(false);
      } catch (err) {
        setError((err as Error).message);
        setIsSaving(false);
      }
    },
    [user, uploadFileAsNeeded]
  );

  /**
   * Fetches a project from Firestore and RETURNS it.
   */
  const loadProject = useCallback(
    async (projectId: string): Promise<ProjectData | null> => {
      setIsLoading(true);
      setError(null);

      if (!user) {
        setError("You must be signed in to load a project.");
        setIsLoading(false);
        return null;
      }

      try {
        const projectRef = doc(db, "users", user.uid, "projects", projectId);
        const docSnap = await getDoc(projectRef);

        if (!docSnap.exists()) {
          throw new Error("Project not found.");
        }

        const project = docSnap.data() as ProjectData;
        setIsLoading(false);
        return project; // Return the data
      } catch (err) {
        setError((err as Error).message);
        setIsLoading(false);
        return null;
      }
    },
    [user]
  );

  /**
   * Fetches a list of all projects for the current user.
   */
  const getProjects = useCallback(async (): Promise<ProjectData[]> => {
    if (!user) {
      throw new Error("You must be signed in to get projects.");
    }
    try {
      const projectsCollection = collection(db, "users", user.uid, "projects");
      const q = query(projectsCollection);
      const querySnapshot = await getDocs(q);
      const projects = querySnapshot.docs.map(
        (doc) => doc.data() as ProjectData
      );
      return projects.sort((a, b) => b.createdAt - a.createdAt);
    } catch (err) {
      throw err;
    }
  }, [user]);

  /**
   * Deletes a project from Firestore and its file from Storage.
   */
  const deleteProject = useCallback(
    async (projectId: string) => {
      setIsLoading(true);
      setError(null);

      if (!user) {
        setError("You must be signed in.");
        setIsLoading(false);
        return;
      }

      try {
        const projectRef = doc(db, "users", user.uid, "projects", projectId);

        const docSnap = await getDoc(projectRef);
        if (docSnap.exists()) {
          const project = docSnap.data() as ProjectData;
          const fileUrl = project.assetState.uploadedFileUrl;

          if (fileUrl && fileUrl.includes("firebasestorage.googleapis.com")) {
            try {
              const fileStorageRef = ref(storage, fileUrl);
              await deleteObject(fileStorageRef);
            } catch {
              // Storage file deletion failed — non-critical, project doc still deleted
            }
          }
        }

        await deleteDoc(projectRef);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  return {
    createProject,
    updateProject,
    loadProject,
    getProjects,
    deleteProject,
    isSaving,
    isLoading,
    error,
  };
};
