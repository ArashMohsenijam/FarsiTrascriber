import React, { useState } from 'react';
import { DropZone } from './components/DropZone';
import { FileList } from './components/FileList';
import { TranscriptionResult } from './components/TranscriptionResult';
import { transcribeAudio } from './lib/api';
import { AudioFile } from './types';
import { saveTranscription } from './lib/fileUtils';

export function App() {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [combinedTranscription, setCombinedTranscription] = useState<string | null>(null);

  const handleFilesAccepted = (newFiles: AudioFile[]) => {
    setFiles(prevFiles => [...prevFiles, ...newFiles].sort((a, b) => a.order - b.order));
    setCombinedTranscription(null); // Reset transcription when new files are added
  };

  const handleReorder = (reorderedFiles: AudioFile[]) => {
    setFiles(reorderedFiles);
  };

  const handleRemove = (fileId: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    setCombinedTranscription(null); // Reset transcription when a file is removed
  };

  const handleReset = () => {
    setFiles([]);
    setCombinedTranscription(null);
    setError(null);
  };

  const processFiles = async () => {
    setIsProcessing(true);
    setError(null);
    setCombinedTranscription(null);
    
    const sortedFiles = [...files].sort((a, b) => a.order - b.order);
    const transcriptions: string[] = [];

    try {
      for (const file of sortedFiles) {
        setFiles(prevFiles =>
          prevFiles.map(f =>
            f.id === file.id ? { ...f, status: 'processing' } : f
          )
        );

        try {
          const transcription = await transcribeAudio(file.file);
          transcriptions.push(`${file.name}:\n${transcription}`);
          
          setFiles(prevFiles =>
            prevFiles.map(f =>
              f.id === file.id
                ? { ...f, status: 'completed', transcription }
                : f
            )
          );
        } catch (error) {
          setFiles(prevFiles =>
            prevFiles.map(f =>
              f.id === file.id ? { ...f, status: 'error' } : f
            )
          );
          throw error;
        }
      }

      const finalTranscription = transcriptions.join('\n\n---\n\n');
      setCombinedTranscription(finalTranscription);
    } catch (error) {
      setError('خطا در تبدیل فایل‌های صوتی. لطفاً دوباره تلاش کنید.');
      console.error('Transcription error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          تبدیل صوت فارسی به متن
        </h1>

        <div className="space-y-6">
          {!combinedTranscription && (
            <>
              <DropZone
                onFilesAccepted={handleFilesAccepted}
                existingFiles={files}
              />

              {files.length > 0 && (
                <div className="space-y-4">
                  <FileList
                    files={files}
                    onReorder={handleReorder}
                    onRemove={handleRemove}
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={processFiles}
                      disabled={isProcessing || files.length === 0}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'در حال پردازش...' : 'شروع تبدیل'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {combinedTranscription && (
            <TranscriptionResult
              text={combinedTranscription}
              onReset={handleReset}
            />
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}