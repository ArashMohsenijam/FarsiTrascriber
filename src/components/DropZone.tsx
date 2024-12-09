import React from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '../lib/utils';
import { AudioFile } from '../types';

interface DropZoneProps {
  onFilesAccepted: (files: AudioFile[]) => void;
  existingFiles: AudioFile[];
}

export function DropZone({ onFilesAccepted, existingFiles }: DropZoneProps) {
  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        file,
        name: file.name,
        order: existingFiles.length + index,
        status: 'pending' as const,
      }));
      onFilesAccepted(newFiles);
    },
    [existingFiles.length, onFilesAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/x-m4a': ['.m4a'],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
      )}
    >
      <input {...getInputProps()} />
      <p className="text-gray-600">
        {isDragActive
          ? 'Drop the audio files here...'
          : 'Drag & drop audio files here, or click to select files'}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Supported formats: MP3, WAV, M4A (Max size: 25MB per file)
      </p>
    </div>
  );
}