import { AnimationScene } from "./animation";
import { SceneControlState } from "@/contexts/SceneContext";

// Shape of Animation state that will be saved
export interface SavedAnimationState {
  animationScenes: AnimationScene[];
  totalVideoDuration: number;
}


// Shape of the Asset state that will be saved
export interface SavedAssetState {
  selectedModelName: string;
  uploadedFileUrl: string | null;
  uploadedFileType: "image" | "video" | null;
}

// Top-level Project object that will be saved as a Json document in Firestore
export interface ProjectData {
    id: string;
    name: string; 
    ownerId: string;
    createdAt: number;

    animationState: SavedAnimationState;
    sceneState: SceneControlState;
    assetState: SavedAssetState;
}