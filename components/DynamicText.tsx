
import React, { useEffect, useState } from "react";

const greetings = [
    { text: "English: Hello", language: "English" },
    { text: "Hindi: नमस्ते", language: "Hindi" },
    { text: "Spanish: Hola", language: "Spanish" },
    { text: "French: Bonjour", language: "French" },
    { text: "German: Hallo", language: "German" },
    { text: "Italian: Ciao", language: "Italian" },
    { text: "Japanese: こんにちは", language: "Japanese" },
    { text: "Chinese: 你好", language: "Chinese" },
    { text: "Portuguese: Olá", language: "Portuguese" },
    { text: "Arabic: مرحبا", language: "Arabic" },
    { text: "Russian: Здравствуйте", language: "Russian" },
    { text: "Korean: 안녕하세요", language: "Korean" },
];

const DynamicText = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % greetings.length);
        }, 3000); 

        return () => clearInterval(interval);
    }, []);

    return (
        <section
            className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-4"
            aria-label="Translating document text"
        >
            <div className="relative h-16 w-full flex items-center justify-center overflow-hidden">
                <div
                    key={currentIndex}
                    className="absolute flex items-center gap-2 text-2xl font-medium text-gray-200 animate-dynamic-text"
                >
                    <div
                        className="h-2 w-2 rounded-full bg-white shrink-0"
                        aria-hidden="true"
                    />
                    <span className="whitespace-nowrap">{greetings[currentIndex].text}</span>
                </div>
            </div>
            <p className="text-sm text-gray-400">Please wait while we translate your document...</p>
        </section>
    );
};

export default DynamicText;
