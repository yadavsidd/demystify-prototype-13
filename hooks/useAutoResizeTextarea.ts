import { useRef } from 'react';

interface AutoResizeTextareaProps {
    minHeight?: number;
    maxHeight?: number;
}

export const useAutoResizeTextarea = ({ minHeight = 52, maxHeight = 200 }: AutoResizeTextareaProps = {}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = (reset = false) => {
        if (textareaRef.current) {
            if (reset) {
                textareaRef.current.style.height = `${minHeight}px`;
                return;
            }
            // Temporarily shrink to get the real scrollHeight, then set the new height
            textareaRef.current.style.height = 'auto'; 
            const scrollHeight = textareaRef.current.scrollHeight;
            const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    };

    return { textareaRef, adjustHeight };
};