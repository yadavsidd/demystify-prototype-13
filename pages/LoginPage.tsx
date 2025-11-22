
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Page } from '../types';
import ErrorMessage from '../components/ErrorMessage';
import { BrandIcon } from '../components/icons';
import { SparklesCore } from '../components/ui/sparkles';
import { GradientButton } from '@/components/ui/GradientButton';
import LoadingSpinner from '@/components/LoadingSpinner';
import { CornerBorderContainer } from '@/components/ui/corner-border-container';
import { testApiKey } from '@/services/geminiService';

interface LoginPageProps {
    onNavigate: (page: Page) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isTestingApiKey, setIsTestingApiKey] = useState(false);
    const { signIn } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { error } = await signIn(email, password);
        if (error) {
            setError(error.message);
        }
        setLoading(false);
    };

    const handleRunDiagnostic = async () => {
        setIsTestingApiKey(true);
        const result = await testApiKey();
        alert(`Diagnostic Result:\n\n${result}`);
        setIsTestingApiKey(false);
    };

    return (
        <div 
            className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black cursor-default"
            onClick={() => onNavigate('landing')}
        >
            {/* Background Sparkles */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                <SparklesCore
                    id="tsparticlesfullpage"
                    background="transparent"
                    minSize={0.6}
                    maxSize={1.4}
                    particleDensity={100}
                    className="w-full h-full"
                    particleColor="#FFFFFF"
                />
            </div>

            {/* Content */}
            <div 
                className="relative z-10 w-full max-w-md mx-auto p-4"
                onClick={(e) => e.stopPropagation()}
            >
                <CornerBorderContainer className="rounded-2xl p-8 shadow-2xl relative overflow-hidden border-gray-800/50 bg-black/40">
                    
                    {/* Aesthetic Gradients at Top of Card */}
                    <div className="absolute inset-x-0 top-0 h-px w-full">
                        <div className="absolute inset-x-10 top-0 bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent h-[2px] w-3/4 blur-sm opacity-75" />
                        <div className="absolute inset-x-10 top-0 bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent h-px w-3/4 opacity-100" />
                        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-white to-transparent h-[5px] w-1/4 blur-sm opacity-75" />
                        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-white to-transparent h-px w-1/4 opacity-100" />
                    </div>

                    {/* Top radial gradient for depth */}
                    <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)] pointer-events-none"></div>

                    <div className="text-center mb-8 relative z-20">
                        <BrandIcon className="w-10 h-10 mx-auto text-white" />
                        <h1 className="mt-4 text-3xl font-bold text-white font-heading">WELCOME BACK</h1>
                        <p className="mt-2 text-gray-300">Sign in to enter the arena.</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4 relative z-20">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full px-4 py-3 border border-gray-700 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent bg-black/50 text-white transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full px-4 py-3 border border-gray-700 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent bg-black/50 text-white transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        {error && <ErrorMessage message={error} onRunDiagnostic={handleRunDiagnostic} isTesting={isTestingApiKey} />}
                        <div>
                            <GradientButton
                                type="submit"
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <LoadingSpinner className="w-5 h-5 mr-2 text-black" />
                                        SIGNING IN...
                                    </>
                                ) : (
                                    'SIGN IN'
                                )}
                            </GradientButton>
                        </div>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-400 relative z-20">
                        Don't have an account?{' '}
                        <button onClick={() => onNavigate('signup')} className="font-medium text-[var(--accent-color)] hover:underline">
                            Sign up
                        </button>
                    </p>
                </CornerBorderContainer>
            </div>
        </div>
    );
};

export default LoginPage;
