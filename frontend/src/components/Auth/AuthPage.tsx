import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../db/supabase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Typed from 'typed.js';

export function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const [typedHeading, setTypedHeading] = useState('');
  const typedRef = useRef<Typed | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const options = {
      strings: [isSignUp ? "Create Account" : "Welcome to Fantasy Pool"],
      typeSpeed: 50,
      backSpeed: 25,
      loop: false,
      showCursor: false,
      onComplete: () => {
        setTypedHeading(isSignUp ? "Create Account" : "Welcome to Fantasy Pool");
      },
    };

    typedRef.current = new Typed('#typed-heading', options);

    return () => {
      typedRef.current?.destroy();
    };
  }, [isSignUp]);

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }
  };

  const handleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        navigate('/');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
        }
        if (user && user.id) {
          navigate(`/profile/${user.id}`);
        } else {
          console.error("User ID is null or undefined");
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }
  };

  const handleAuthAction = async () => {
    if (isSignUp) {
      await handleSignUp();
    } else {
      await handleSignIn();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-200">
      <motion.div
        className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition duration-300"
        // Only use the initial "hidden" state on the very first mount.
        initial={hasMounted ? false : "hidden"}
        animate="visible"
        variants={containerVariants}
      >
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-800 transition duration-300 hover:text-gray-500">
            <span id="typed-heading">{typedHeading}</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {isSignUp
              ? "Join our community and create or join pools!"
              : "Sign in to access your pools and tournaments."}
          </p>
        </div>

        <div className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-400 transition duration-300 hover:border-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-400 transition duration-300 hover:border-blue-400"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAuthAction}
            className="w-full bg-blue-500 text-white px-4 py-3 rounded-md shadow-md transition duration-300"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </motion.button>

          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">
              {isSignUp ? "Already have an account?" : "Need an account?"}
            </span>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-500 hover:text-blue-700 focus:outline-none text-sm font-semibold transition duration-300"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
