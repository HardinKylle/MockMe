'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { 
  Auth, 
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
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            await sendEmailVerification(userCredential.user);
            return userCredential.user;
        } catch (error) {
            console.error("Error signing up:", error);
            throw error; 
        }
    };

    // Sign-in function
    const signIn = async (email: string, pass: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, pass);
            return userCredential.user;
        } catch (error) {
            console.error("Error signing in:", error);
            throw error;
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
