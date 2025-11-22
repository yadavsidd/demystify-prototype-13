import React, { useState, useEffect } from 'react';
import { MultiStepLoader } from './ui/multi-step-loader';

interface AnalysisLoaderProps {
  file: File | null;
  loading: boolean;
}

const AnalysisLoader: React.FC<AnalysisLoaderProps> = ({ file, loading }) => {
    const [loadingStates, setLoadingStates] = useState<{text: string}[]>([]);

    useEffect(() => {
        if (!file) return;

        const generateSteps = (): {text: string}[] => {
            const steps: string[] = [];
            const fileType = file.type;
            const fileSize = file.size;

            if (fileType === 'application/pdf') {
                steps.push("Verifying PDF integrity");
                steps.push("Parsing document structure");
                steps.push("Extracting text layer");
            } else if (fileType.startsWith('image/')) {
                steps.push("Enhancing image for text recognition");
                steps.push("Extracting text from image");
            } else {
                steps.push("Reading document contents");
            }

            if (fileSize > 1024 * 1024) {
                steps.push("Chunking large document for analysis");
            }
            
            steps.push("Identifying key clauses & entities");
            steps.push("Analyzing for potential red flags");
            steps.push("Cross-referencing with standard practices");
            steps.push("Calculating fairness & acceptance score");
            steps.push("Assembling your final report");
            
            return steps.map(text => ({ text }));
        };

        setLoadingStates(generateSteps());
    }, [file]);

  return (
    <MultiStepLoader 
        loadingStates={loadingStates} 
        loading={loading} 
        duration={1200}
        loop={false}
    />
  );
};

export default AnalysisLoader;
