'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
interface AuthContextType {
    user: User | null;
    authLoading: boolean;
    signIn: (email: string, pass: string) => Promise<User>; 
    signUp: (email: string, pass: string) => Promise<User>;
    signOut: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Create the Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    //Listener for authentication state changes
    useEffect(() => {
        //onAuthStateChanged returns an 'unsubcribed' function
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });

        // Cleanup: unsubcribe when the component unmounts
        return () => unsubscribe();
    }, []);

    // Sign-up function
    const signUp = async (email: string, pass: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        await sendEmailVerification(userCredential.user);
        return userCredential.user;
    };

    // Sign-in function
    const signIn = async (email: string, pass: string) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        return userCredential.user;
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
        } catch {
            // Sign out failed — Firebase session may still be active
        }
    };

    const value = {
        user,
        authLoading,
        signIn,
        signUp,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {!authLoading && children}
        </AuthContext.Provider>
    )

};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be within an AuthProvider.');
    }
    return context;
};
