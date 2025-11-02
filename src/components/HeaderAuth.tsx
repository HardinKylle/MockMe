'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/contexts/ModalContext';
import { Button } from '@/components/ui/Button';
import { Loader, User, LogOut, Folder } from 'lucide-react';
import { useState } from 'react';

export const HeaderAuth = () => {
  const { user, authLoading, signOut } = useAuth();
  const { openSignInModal, openProjectsModal } = useModal();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = () => {
    setIsMenuOpen(false);
    signOut();
  };

  const handleOpenProjects = () => {
    setIsMenuOpen(false);
    openProjectsModal();
  }

  if (authLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!user) {
    return (
      <Button variant="primary" onClick={openSignInModal}>
        Sign In
      </Button>
    );
  }

  // User is logged in
  return (
    <div className="relative">
      <Button
        variant="primary"
        size="default"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        isActive={isMenuOpen}
      >
        <User className="h-6 w-6" />
      </Button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-56 rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-xl z-30 p-1.5"
          style={{ animation: 'slideUp 0.2s ease-out' }}
        >
          <div className="px-3 py-2">
            <p className="text-xs text-slate-400">Signed in as</p>
            <p className="text-sm font-medium text-white truncate">
              {user.email}
            </p>
          </div>
          <hr className="border-slate-700/50 my-1" />

          <div className="space-y-1">
            <Button
              variant="menu-item"
              size="menu-item"
              className="w-full"
              onClick={handleOpenProjects}
            >
              <Folder className="h-4 w-4 mr-2" />
              My Projects
            </Button>
            <Button
              variant="menu-item"
              size="menu-item"
              className="w-full text-red-400 hover:text-red-400 hover:bg-red-500/10"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
