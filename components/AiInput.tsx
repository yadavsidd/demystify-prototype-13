
import React, { useState, useEffect, useRef } from "react";
import { GlobeIcon, PaperclipIcon, SendIcon, MicIcon } from "./icons";
import { Textarea } from "./ui/textarea";
import { cn } from "../lib/utils";
import { useAutoResizeTextarea } from "../hooks/useAutoResizeTextarea";

interface AiInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    placeholder?: string;
    formRef?: React.RefObject<HTMLFormElement>;
}

// Check for SpeechRecognition API
// FIX: Add type definitions for the Web Speech API to resolve 'Cannot find name SpeechRecognition' error.
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: SpeechRecognitionEvent) => void;
    onend: () => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    start: () => void;
    stop: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: { new (): SpeechRecognition };
        webkitSpeechRecognition: { new (): SpeechRecognition };
    }
}

export const AiInput: React.FC<AiInputProps> = ({ value, onChange, onSubmit, isLoading, placeholder, formRef }) => {
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 52,
        maxHeight: 200,
    });
    const [isFocused, setIsFocused] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [micError, setMicError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    
    // A simplified state for the "web search" toggle.
    const [showSearch] = useState(false);

    // Keep track of value for the speech recognition callback
    const valueRef = useRef(value);
    useEffect(() => {
        valueRef.current = value;
    }, [value]);

     useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech recognition is not supported by this browser.");
            setMicError("Voice input is not supported by your browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Stop after a pause in speech
        recognition.interimResults = false; // Only get final results
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            setMicError(null);
            const last = event.results.length - 1;
            const transcript = event.results[last][0].transcript;
            // Append the transcript to the existing value using the ref
            const currentValue = valueRef.current;
            onChange((currentValue ? currentValue + ' ' : '') + transcript);
            adjustHeight();
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            if (event.error === 'network') {
                setMicError("Network error: Speech recognition may be blocked in this environment.");
            } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                setMicError("Permission denied. Please allow microphone access in your browser settings.");
            } else {
                setMicError("An unknown microphone error occurred. Please try again.");
            }
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        // Cleanup on unmount
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [onChange, adjustHeight]);


    const handleMicClick = () => {
        setMicError(null);
        const recognition = recognitionRef.current;
        if (!recognition) {
            setMicError("Voice input is not supported by your browser.");
            return;
        }

        if (isListening) {
            recognition.stop();
        } else {
             navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => {
                    recognition.start();
                    setIsListening(true);
                })
                .catch(err => {
                    console.error("Microphone access denied:", err);
                    setMicError("Microphone access was denied. Please allow it in your browser settings.");
                });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(e);
        setTimeout(() => adjustHeight(true), 0);
    };

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const handleContainerClick = () => {
        textareaRef.current?.focus();
    };

    return (
        <div className="w-full">
            <form ref={formRef} onSubmit={handleSubmit}>
                <div className="relative w-full mx-auto">
                    <div
                        role="textbox"
                        tabIndex={0}
                        aria-label="Chat input container"
                        className={cn(
                            "relative flex flex-col rounded-xl transition-all duration-200 w-full text-left cursor-text",
                            "ring-1 ring-gray-700/50",
                            isFocused && "ring-[var(--accent-color)]/70",
                            micError && "ring-red-500/70"
                        )}
                        onClick={handleContainerClick}
                    >
                        <div className="overflow-y-auto max-h-[200px] bg-gray-900 rounded-t-xl">
                            <Textarea
                                id="ai-input"
                                value={value}
                                placeholder={placeholder || "Ask a follow-up question..."}
                                className="w-full rounded-t-xl px-4 py-3 bg-transparent border-none placeholder:text-gray-500 resize-none focus-visible:ring-0 leading-[1.4]"
                                ref={textareaRef}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                disabled={isLoading}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                                onChange={(e) => {
                                    onChange(e.target.value);
                                    adjustHeight();
                                }}
                            />
                        </div>

                        <div className="h-12 bg-gray-900/50 rounded-b-xl border-t border-gray-800">
                            <div className="absolute left-3 bottom-3 flex items-center gap-2">
                                <label className="cursor-pointer rounded-lg p-2 bg-gray-800/50 hover:bg-gray-800 transition-colors">
                                    <input type="file" className="hidden" disabled />
                                    <PaperclipIcon className="w-4 h-4 text-gray-500" />
                                </label>
                                <button
                                    type="button"
                                    onClick={handleMicClick}
                                    className={cn(
                                        "rounded-lg p-2 transition-colors",
                                        isListening 
                                            ? "bg-red-900/60 text-red-400" 
                                            : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
                                    )}
                                    aria-label={isListening ? "Stop listening" : "Start dictation"}
                                >
                                    <MicIcon className={cn("w-4 h-4", isListening && "animate-pulse-mic")} />
                                </button>
                                <button
                                    type="button"
                                    disabled
                                    className={cn(
                                        "rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-8 cursor-not-allowed opacity-50",
                                        showSearch
                                            ? "bg-sky-500/15 border-sky-400 text-sky-500"
                                            : "bg-gray-800/50 border-transparent text-gray-500"
                                    )}
                                >
                                    <GlobeIcon className="w-4 h-4"/>
                                </button>
                            </div>
                            <div className="absolute right-3 bottom-3">
                                <button
                                    type="submit"
                                    disabled={isLoading || !value.trim()}
                                    className={cn(
                                        "rounded-lg p-2 transition-colors",
                                        value.trim()
                                            ? "bg-green-900/60 text-[var(--accent-color)]"
                                            : "bg-gray-800/50 text-gray-500 cursor-not-allowed",
                                        "disabled:opacity-50"
                                    )}
                                    aria-label="Send message"
                                >
                                    <SendIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            {micError && <p className="text-xs text-red-400 mt-2 text-center">{micError}</p>}
        </div>
    );
}