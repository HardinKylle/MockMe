'use client';

import { createContext, useContext, ReactNode, useState } from 'react';

interface ModalContextType {
    isSignInModalOpen: boolean;
    openSignInModal: () => void;
    closeSignInModal: () => void;

    isProjectsModalOpen: boolean;
    openProjectsModal:() => void;
    closeProjectsModal:()=> void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {

    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
    const openSignInModal = () => setIsSignInModalOpen(true);
    const closeSignInModal = () => setIsSignInModalOpen(false);

    const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);

    const openProjectsModal = () => setIsProjectsModalOpen(true);
    const closeProjectsModal = () => setIsProjectsModalOpen(false);

    const value = {
        isSignInModalOpen,
        openSignInModal,
        closeSignInModal,
        isProjectsModalOpen,
        openProjectsModal,
        closeProjectsModal
    }

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be within a ModalProvider.");
    }
    return context;
};