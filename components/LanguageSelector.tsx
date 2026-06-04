
import React from 'react';

export const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'ur', name: 'Urdu' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'it', name: 'Italian' },
];

interface LanguageSelectorProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange, disabled }) => {
    return (
        <div>
            <label htmlFor="language-select" className="block text-sm font-medium text-gray-400 mb-1">
                Translate To
            </label>
            <select
                id="language-select"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full p-2 border border-gray-700 rounded-md shadow-sm bg-gray-900 text-gray-100 focus:ring-2 focus:ring-[var(--accent-color)] disabled:bg-gray-800 disabled:cursor-not-allowed"
            >
                {languages.map(lang => (
                    <option key={lang.code} value={lang.name}>
                        {lang.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LanguageSelector;
