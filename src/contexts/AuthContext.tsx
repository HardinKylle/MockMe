'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Auth, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Shape of AuthContext value
interface AuthContextType {
    user: User | null;
    authLoading: boolean;
    signIn: (email: string, pass: string) => Promise<User | null>;
    signUp: (email: string, pass: string) => Promise<User | null>;
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
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            setUser(userCredential.user);
            return userCredential.user;
        } catch (error) {
            console.error('Error signing up:', error);
            return null;
        }
    };

    const signIn = async (email: string, pass: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, pass);
            setUser(userCredential.user);
            return userCredential.user;
        } catch (error) {
            console.error("Error signing in:", error);
            return null;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
        } catch (error) {
            console.error('Error signing out', error);
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