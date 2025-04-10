import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpIcon, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  id: string;
  label: string;
  accept?: string;
  maxSize?: number;
  className?: string;
  onChange: (file: File | null) => void;
  error?: string;
}

export function FileUpload({
  id,
  label,
  accept = ".pdf,.doc,.docx",
  maxSize = 5, // in MB
  className,
  onChange,
  error,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setFileError(null);
      onChange(null);
      return;
    }

    // Check file size
    const fileSize = file.size / (1024 * 1024); // convert to MB
    if (fileSize > maxSize) {
      setFileError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Check file type if accept is provided
    if (accept) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const acceptedTypes = accept.split(",").map(type => 
        type.trim().replace(".", "").toLowerCase()
      );
      
      if (fileExtension && !acceptedTypes.includes(fileExtension)) {
        setFileError(`Only ${accept} files are accepted`);
        return;
      }
    }

    setSelectedFile(file);
    setFileError(null);
    onChange(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files[0]);
    }
  };

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div
        className={cn(
          "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md",
          isDragging ? "border-primary-500 bg-primary-50" : "border-gray-300",
          fileError || error ? "border-red-300" : "",
          "cursor-pointer"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <div className="space-y-1 text-center">
          <Input
            id={id}
            ref={inputRef}
            type="file"
            className="sr-only"
            accept={accept}
            onChange={handleInputChange}
          />
          
          {selectedFile ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <p className="text-sm text-gray-600 mt-2">{selectedFile.name}</p>
              <span className="text-xs text-gray-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileChange(null);
                }}
              >
                Remove
              </Button>
            </div>
          ) : (
            <>
              <FileUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex flex-col text-center">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-primary-600 hover:text-primary-500">
                    Upload a file
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  {accept.replace(/\./g, "").toUpperCase()} up to {maxSize}MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      
      {(fileError || error) && (
        <div className="flex items-center text-red-500 mt-2 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>{fileError || error}</span>
        </div>
      )}
    </div>
  );
}
