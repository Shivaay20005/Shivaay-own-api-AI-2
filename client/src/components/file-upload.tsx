import { useState, useRef } from "react";
import { Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatFileSize, validateFile } from "@/lib/file-utils";

interface FileUploadProps {
  attachedFiles: File[];
  onFilesChange: (files: File[]) => void;
}

export default function FileUpload({ attachedFiles, onFilesChange }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDropZone, setShowDropZone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const validFiles: File[] = [];
    
    Array.from(files).forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        alert(validation.error);
      }
    });

    if (validFiles.length > 0) {
      onFilesChange([...attachedFiles, ...validFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setShowDropZone(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    setShowDropZone(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setShowDropZone(false);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = attachedFiles.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".png,.jpg,.jpeg,.gif,.webp,.pdf"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Drop Zone */}
      {showDropZone && (
        <div className={cn(
          "mx-4 mb-4 p-6 border-2 border-dashed rounded-xl bg-dark-secondary transition-all duration-200",
          isDragOver ? "border-purple-primary bg-purple-primary bg-opacity-10" : "border-gray-600"
        )}>
          <div className="text-center">
            <svg className="w-12 h-12 text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-white font-semibold mb-2">Drop files here or click to upload</p>
            <p className="text-sm text-muted">Supports images (PNG, JPG, JPEG, GIF, WebP) and PDFs</p>
          </div>
        </div>
      )}

      {/* Attached Files */}
      {attachedFiles.length > 0 && (
        <div className="mx-4 mb-4">
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-dark-tertiary p-2 rounded-lg border border-gray-600"
              >
                <div className="w-8 h-8 bg-purple-primary rounded-lg flex items-center justify-center">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4 text-white" />
                  ) : (
                    <FileText className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{file.name}</p>
                  <p className="text-xs text-muted">{formatFileSize(file.size)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="p-1 text-muted hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attach Button */}
      <div className="px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={openFileDialog}
          className="text-muted hover:text-white transition-colors"
        >
          <Paperclip className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
