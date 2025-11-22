import React, { useRef, useState, useCallback } from 'react';
import { UploadIcon, DocumentCheckIcon } from './icons';

interface FileInputProps {
  onFileSelect: (file: File | null) => void;
  disabled: boolean;
  onError: (message: string) => void;
}

const FileInput: React.FC<FileInputProps> = ({ onFileSelect, disabled, onError }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File | undefined) => {
    if (file) {
        const allowedMimeTypes = ['text/plain', 'text/markdown', 'application/pdf', 'image/jpeg'];
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        const allowedExtensions = ['txt', 'md', 'pdf', 'jpg', 'jpeg'];
        
        if (!allowedMimeTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            onError(`Unsupported file type. Please upload a TXT, MD, PDF, or JPG file.`);
            setFileName(null);
            if(inputRef.current) {
                inputRef.current.value = "";
            }
            onFileSelect(null);
            return;
        }

        onError('');
        setFileName(file.name);
        onFileSelect(file);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0]);
  };

  const handleClick = () => {
    if (!disabled) {
        inputRef.current?.click();
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) setIsDraggingOver(true);
  }, [disabled]);
  
  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
    if (disabled) return;
    processFile(event.dataTransfer.files?.[0]);
  }, [disabled]);

  const borderClass = isDraggingOver ? 'border-[var(--accent-color)]' : 'border-gray-700';

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full p-1 rounded-lg cursor-pointer transition-all duration-300 ${disabled ? 'cursor-not-allowed' : ''}`}
      aria-disabled={disabled}
      role="button"
      tabIndex={0}
    >
      <div className={`relative w-full border-2 border-dashed ${borderClass} rounded-lg bg-gray-900 hover:border-[var(--accent-color)] transition-all duration-300`}>
        <div className={`w-full py-10 flex flex-col items-center justify-center text-center rounded-md transition-colors duration-300 min-h-[220px] ${disabled ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}>
            <input
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.md,.pdf,.jpg,.jpeg,text/plain,text/markdown,application/pdf,image/jpeg"
            disabled={disabled}
            aria-label="File upload"
            />
            {fileName ? (
                <>
                    <DocumentCheckIcon className="w-16 h-16 text-[var(--accent-color)] mb-4" />
                    <p className="text-gray-300 font-semibold">Ready to analyze:</p>
                    <p className="text-sm text-gray-400 px-4 break-words">{fileName}</p>
                </>
            ) : (
                <>
                    <UploadIcon className={`w-16 h-16 text-gray-500 mb-4 transition-transform duration-300 ${isDraggingOver ? 'scale-110 text-[var(--accent-color)]' : ''}`} />
                    <p className="text-gray-300 font-semibold">Click to upload or drag & drop</p>
                    <p className="text-sm text-gray-400">TXT, MD, PDF, or JPG</p>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default FileInput;