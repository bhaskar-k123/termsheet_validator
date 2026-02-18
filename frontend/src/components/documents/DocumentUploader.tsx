
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, X, Shield, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

interface DocumentUploaderProps {
  onUpload: (files: File[]) => void;
}

export default function DocumentUploader({ onUpload }: DocumentUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<
    Array<{ file: File; progress: number, status: 'uploading' | 'processing' | 'done' | 'error' }>
  >([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const newFiles = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: 'uploading' as const,
      }));

      setUploadingFiles(prev => [...prev, ...newFiles]);

      for (const fileItem of newFiles) {
        try {
          // Simulate upload progress for UI feel
          const interval = setInterval(() => {
            setUploadingFiles(prev => prev.map(f =>
              f.file === fileItem.file && f.progress < 90
                ? { ...f, progress: f.progress + 10 }
                : f
            ));
          }, 100);

          setUploadingFiles(prev => prev.map(f =>
            f.file === fileItem.file ? { ...f, status: 'processing' as const, progress: 90 } : f
          ));

          await api.extractTermsheet(fileItem.file);

          clearInterval(interval);
          setUploadingFiles(prev => prev.map(f =>
            f.file === fileItem.file ? { ...f, progress: 100, status: 'done' as const } : f
          ));

          toast.success(`${fileItem.file.name} processed successfully`);
        } catch (error: any) {
          toast.error(`Error processing ${fileItem.file.name}: ${error.message}`);
          setUploadingFiles(prev => prev.map(f =>
            f.file === fileItem.file ? { ...f, status: 'error' as const } : f
          ));
        }
      }

      onUpload(acceptedFiles); // Still trigger onUpload if needed for local state
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  const cancelUpload = (index: number) => {
    setUploadingFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      <div
        {...getRootProps()}
        className={`relative group border-2 border-dashed rounded-[2rem] p-16 text-center cursor-pointer transition-all duration-500 overflow-hidden ${isDragActive
          ? "border-primary bg-primary/5 shadow-[0_0_50px_rgba(59,130,246,0.1)] scale-[0.99]"
          : "border-white/10 hover:border-primary/40 hover:bg-white/[0.02]"
          }`}
      >
        <input {...getInputProps()} />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-500">
              <Upload size={32} className="text-primary" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-background border border-white/10 flex items-center justify-center shadow-xl">
              <Shield className="h-4 w-4 text-emerald-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight text-white/90">
              {isDragActive ? "Injest Assets" : "Drag & Drop Documents"}
            </h3>
            <p className="text-sm text-muted-foreground/60 font-medium">
              Secure transmission to heuristic analysis engines
            </p>
          </div>

          <div className="flex gap-4">
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
              PDF
            </div>
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
              DOCX
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {uploadingFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary">In-Flight Ingestion</h3>
              <span className="text-[10px] font-bold text-muted-foreground/40">{uploadingFiles.length} Operations</span>
            </div>
            {uploadingFiles.map((fileData, index) => (
              <Card key={index} className="bg-card/40 border-white/5 shadow-xl rounded-2xl overflow-hidden group">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4 max-w-[70%]">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                        <FileText size={18} className="text-primary/70" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white/90 truncate max-w-[200px]">
                          {fileData.file.name}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground/40">
                          {(fileData.file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black tabular-nums text-primary">
                          {fileData.progress}%
                        </span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg hover:bg-white/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelUpload(index);
                        }}
                      >
                        <X size={14} className="text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${fileData.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

