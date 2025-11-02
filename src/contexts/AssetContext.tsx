'use client'

import { createContext, useContext, ReactNode } from 'react';
import { useUploadedFile } from '@/hooks/useUploadedFile';
import { useModelSwitcher } from '@/hooks/useModelSwitcher';
import { ModelData } from '@/configs/models';

interface AssetContextType {
    // State from useUploadedFile
    uploadedFileUrl: string | null;
    uploadedFileType: 'image' | 'video' | null;
    videoDuration: number | null;
    handleFileUpload: (file: File | null) => void;

    setUploadedFileUrl: (url: string | null) => void;
    setUploadedFileType: (type: 'image' |'video' | null) => void;

    // State from useModelSwitcher
    selectedModel: ModelData;
    setModel: (modelName: string) => void;
    allModels: ModelData[];
}

const AssetContext = createContext<AssetContextType | null>(null);

export const AssetProvider = ({ children }: { children: ReactNode }) => {

    const {
        uploadedFileUrl,
        uploadedFileType,
        videoDuration,
        handleFileUpload,
        setUploadedFileType,
        setUploadedFileUrl
    } = useUploadedFile();

    const { selectedModel, setModel, allModels } = useModelSwitcher();

    const value: AssetContextType = {
        uploadedFileUrl,
        uploadedFileType,
        videoDuration,
        handleFileUpload,
        setUploadedFileType,
        setUploadedFileUrl,
        selectedModel,
        setModel,
        allModels,
    };

    return (
        <AssetContext.Provider value={value}>
            {children}
        </AssetContext.Provider>
    );

};

//hook to use asset context
export const useAsset = () => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAsset must be used within an AssetProvider');
  }
  return context;
};