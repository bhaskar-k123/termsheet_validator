import React, { useState, useCallback } from 'react';
import { Upload, Shield, File, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RefinedUploaderProps {
    onUpload?: (files: File[]) => void;
}

export const RefinedUploader: React.FC<RefinedUploaderProps> = ({ onUpload }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(prev => [...prev, ...droppedFiles]);
        onUpload?.(droppedFiles);
    }, [onUpload]);

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <motion.div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    "relative group cursor-pointer transition-all duration-500",
                    "h-[400px] flex flex-col items-center justify-center gap-6",
                    "rounded-[3rem] border-2 border-dashed border-white/5 bg-black/40 backdrop-blur-2xl shadow-2xl",
                    isDragging ? "border-white/20 bg-white/5 scale-[1.02]" : "hover:border-white/10 hover:bg-white/[0.02]"
                )}
            >
                <div className="relative">
                    <motion.div
                        animate={isDragging ? { scale: 1.1, y: -10 } : { scale: 1, y: 0 }}
                        className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center shadow-2xl group-hover:bg-white/10 transition-colors duration-500"
                    >
                        <Upload className="w-10 h-10 text-white/80 group-hover:text-white transition-colors" />
                    </motion.div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
                        <Shield className="w-4 h-4 text-green-500" />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                        Drag & Drop Documents
                    </h2>
                    <p className="text-white/40 font-medium">
                        Secure transmission to heuristic analysis engines
                    </p>
                </div>

                <div className="flex gap-3">
                    {["PDF", "DOCX"].map((ext) => (
                        <span key={ext} className="px-5 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-widest text-white/40 group-hover:text-white/60 transition-colors">
                            {ext}
                        </span>
                    ))}
                </div>

                {/* Decorative background gradients */}
                <div className="absolute inset-0 rounded-[3rem] overflow-hidden -z-10 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/20 blur-[100px] rounded-full" />
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 blur-[100px] rounded-full" />
                </div>
            </motion.div>

            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {files.map((file, idx) => (
                            <motion.div
                                key={`${file.name}-${idx}`}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-3xl group transition-all hover:bg-white/10"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                        <File className="w-5 h-5 text-white/60" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-white truncate max-w-[200px]">{file.name}</span>
                                        <span className="text-[10px] text-white/30 font-medium uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFile(idx)}
                                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-colors text-white/20"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
