
import React, { useState } from 'react';
import { compareDocuments, testApiKey } from '../services/geminiService';
import type { ComparisonResult } from '../types';
import { FileUpload } from '../components/ui/file-upload';
import ErrorMessage from '../components/ErrorMessage';
import AnalysisLoader from '../components/AnalysisLoader';
import { GradientButton } from '@/components/ui/GradientButton';
import { CornerBorderContainer } from '@/components/ui/corner-border-container';
import { CheckCircle2, AlertTriangle, Scale, FileDiff } from 'lucide-react';

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const parts = result.split(',');
      if (parts.length < 2 || !parts[1]) {
        reject(new Error("Could not parse file content as a valid base64 data URL."));
        return;
      }
      resolve(parts[1]);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const ComparePage: React.FC = () => {
    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
    const [isTestingApiKey, setIsTestingApiKey] = useState(false);

    const handleFileSelect = (fileSetter: React.Dispatch<React.SetStateAction<File | null>>) => (files: File[]) => {
        if (files.length > 0) {
            fileSetter(files[0]);
            setError(null); // Clear error on new selection
        } else {
             fileSetter(null);
        }
    };

    const handleRunDiagnostic = async () => {
        setIsTestingApiKey(true);
        const result = await testApiKey();
        alert(`Diagnostic Result:\n\n${result}`);
        setIsTestingApiKey(false);
    };

    const handleCompare = async () => {
        if (!file1 || !file2) {
            setError("Please upload two documents to compare.");
            return;
        }

        setLoading(true);
        setError(null);
        setComparisonResult(null);

        try {
            const [content1, content2] = await Promise.all([
                file1.type.startsWith('text/') ? file1.text() : readFileAsBase64(file1),
                file2.type.startsWith('text/') ? file2.text() : readFileAsBase64(file2)
            ]);

            const result = await compareDocuments(
                { content: content1, mimeType: file1.type },
                { content: content2, mimeType: file2.type }
            );

            setComparisonResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred during comparison.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setFile1(null);
        setFile2(null);
        setComparisonResult(null);
        setError(null);
    };

    const getSignificanceColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'high': return 'text-red-400 bg-red-900/20 border-red-900';
            case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-900';
            case 'low': return 'text-green-400 bg-green-900/20 border-green-900';
            default: return 'text-gray-400 bg-gray-800 border-gray-700';
        }
    };

    return (
        <div className="w-full h-full">
             <AnalysisLoader file={file1 || file2} loading={loading} />

            {!comparisonResult && !loading ? (
                <div className="animate-fade-in-up">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white font-heading mb-3">Compare Documents</h2>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            Upload two versions of a document (e.g., Original vs. Revised) to spot differences, missing clauses, and new risks.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <CornerBorderContainer className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[var(--accent-color)] text-black flex items-center justify-center text-xs font-bold">1</span>
                                Document Version 1
                            </h3>
                            <FileUpload id="compare-doc-1" onChange={handleFileSelect(setFile1)} />
                            {file1 && <p className="mt-2 text-sm text-green-400 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1"/> {file1.name} selected</p>}
                        </CornerBorderContainer>

                        <CornerBorderContainer className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[var(--accent-color)] text-black flex items-center justify-center text-xs font-bold">2</span>
                                Document Version 2
                            </h3>
                            <FileUpload id="compare-doc-2" onChange={handleFileSelect(setFile2)} />
                            {file2 && <p className="mt-2 text-sm text-green-400 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1"/> {file2.name} selected</p>}
                        </CornerBorderContainer>
                    </div>

                    {error && <div className="mb-6"><ErrorMessage message={error} onRunDiagnostic={handleRunDiagnostic} isTesting={isTestingApiKey} /></div>}

                    <div className="flex justify-center">
                        <GradientButton onClick={handleCompare} disabled={!file1 || !file2} className="min-w-[200px]">
                            COMPARE DOCUMENTS
                        </GradientButton>
                    </div>
                </div>
            ) : comparisonResult ? (
                <div className="animate-fade-in-up space-y-8">
                     {/* Header & Summary */}
                     <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                         <div className="flex items-start justify-between mb-4">
                             <div>
                                <h3 className="text-xl font-bold text-white font-heading mb-1">Comparison Analysis</h3>
                                <p className="text-gray-400 text-sm">Comparing <strong>{file1?.name}</strong> vs <strong>{file2?.name}</strong></p>
                             </div>
                             <button onClick={reset} className="px-4 py-2 text-sm font-medium text-black bg-[var(--accent-color)] rounded-lg hover:opacity-90">
                                New Comparison
                             </button>
                         </div>
                         <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                            <h4 className="text-sm font-bold text-[var(--accent-color)] mb-2 uppercase tracking-wide">Summary of Differences</h4>
                            <p className="text-gray-300 leading-relaxed">{comparisonResult.summary}</p>
                         </div>
                     </div>

                     {/* Comparison Result Cards */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Risk Assessment */}
                        <CornerBorderContainer className="p-6 h-full">
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" /> Risk Assessment
                            </h4>
                            <p className="text-gray-300 mb-4">{comparisonResult.riskAssessment}</p>
                            <div className="mt-auto p-4 bg-gray-800 rounded-lg flex items-center justify-between">
                                <span className="text-gray-400 font-medium">Better Option:</span>
                                <span className={`font-bold px-3 py-1 rounded-full ${
                                    comparisonResult.betterOption === 'Neutral' ? 'bg-gray-600 text-white' : 'bg-[var(--accent-color)] text-black'
                                }`}>
                                    {comparisonResult.betterOption}
                                </span>
                            </div>
                        </CornerBorderContainer>

                        {/* Missing Clauses */}
                        <CornerBorderContainer className="p-6 h-full">
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                                <FileDiff className="w-5 h-5 mr-2 text-red-400" /> Missing in Doc 2
                            </h4>
                            {comparisonResult.missingInDoc2.length > 0 ? (
                                <ul className="space-y-2">
                                    {comparisonResult.missingInDoc2.map((clause, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm bg-red-900/10 p-2 rounded">
                                            <span className="text-red-500 mt-0.5">•</span>
                                            {clause}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-400 italic">No significant clauses found missing in the second document.</p>
                            )}
                        </CornerBorderContainer>
                     </div>

                     {/* Detailed Differences Table */}
                     <div className="bg-gray-900/30 border border-gray-800 rounded-xl overflow-hidden">
                         <div className="p-4 border-b border-gray-800 bg-gray-900/50">
                             <h4 className="font-bold text-white flex items-center">
                                 <Scale className="w-5 h-5 mr-2 text-[var(--accent-color)]" /> Detailed Differences
                             </h4>
                         </div>
                         <div className="overflow-x-auto">
                             <table className="w-full text-left border-collapse">
                                 <thead>
                                     <tr className="bg-gray-900 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-800">
                                         <th className="p-4 font-bold">Category</th>
                                         <th className="p-4 font-bold w-1/4">Doc 1 (Original)</th>
                                         <th className="p-4 font-bold w-1/4">Doc 2 (Comparison)</th>
                                         <th className="p-4 font-bold">Significance</th>
                                         <th className="p-4 font-bold">Analysis</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-800">
                                     {comparisonResult.differences.map((diff, idx) => (
                                         <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                                             <td className="p-4 text-sm font-bold text-[var(--accent-color)]">{diff.category}</td>
                                             <td className="p-4 text-sm text-gray-400 font-mono text-xs leading-relaxed bg-black/20">{diff.doc1 || <span className="italic opacity-50">Not present</span>}</td>
                                             <td className="p-4 text-sm text-gray-400 font-mono text-xs leading-relaxed bg-black/20">{diff.doc2 || <span className="italic opacity-50">Not present</span>}</td>
                                             <td className="p-4">
                                                 <span className={`inline-block px-2 py-1 rounded text-xs font-bold border ${getSignificanceColor(diff.significance)}`}>
                                                     {diff.significance}
                                                 </span>
                                             </td>
                                             <td className="p-4 text-sm text-gray-300">{diff.explanation}</td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         </div>
                     </div>
                </div>
            ) : null}
        </div>
    );
};

export default ComparePage;
