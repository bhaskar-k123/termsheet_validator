import { useState } from "react";
import DocumentUploader from "@/components/documents/DocumentUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, FileIcon, ShieldCheck, Zap } from "lucide-react";
import Alldocs from "./Alldocs";
import { useAuthUser } from "@/lib/auth-hooks";
import { ScannedDocument } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import DocumentList from "@/components/documents/DocumentList";

// Mock document for initial state
const mockSelectedDocument: ScannedDocument = {
  id: "1",
  name: "Sample Term Sheet.pdf",
  uploadDate: "2023-08-15T10:30:00Z",
  status: "validated",
  extractedText: "This Term Sheet outlines the principal terms and conditions...",
  highlightedTerms: [],
  expectedTerms: []
};

export default function Documents() {
  const [documents, setDocuments] = useState<ScannedDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<ScannedDocument | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const { user } = useAuthUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress || "";

  const handleFileUpload = (files: File[]) => {
    const newDocs: ScannedDocument[] = files.map((file, index) => ({
      id: (Date.now() + index).toString(),
      name: file.name,
      uploadDate: new Date().toISOString(),
      status: "processing",
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      extractedText: "Extracting text...",
      highlightedTerms: []
    }));

    setTimeout(() => {
      const processedDocs = newDocs.map(doc => ({
        ...doc,
        status: "validated",
        extractedText: mockSelectedDocument.extractedText,
        highlightedTerms: mockSelectedDocument.highlightedTerms,
        expectedTerms: mockSelectedDocument.expectedTerms
      }));

      setDocuments(prev => [...processedDocs, ...prev]);

      if (processedDocs.length > 0) {
        setSelectedDocument(processedDocs[0]);
        setActiveTab("view");
      }
    }, 2000);
  };

  const handleSelectDocument = (doc: ScannedDocument) => {
    setSelectedDocument(doc);
    setActiveTab("view");
  };

  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 px-4">
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight"
          >
            Internal <span className="text-white/40">Registry</span>
          </motion.h1>
          <p className="text-lg text-white/40 font-medium max-w-2xl">
            Centralized document processing and heuristic audit infrastructure.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4 mb-12">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14 inline-flex">
            <TabsTrigger
              value="upload"
              className="rounded-xl px-10 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg text-[10px] font-bold tracking-[0.2em] transition-all duration-300"
            >
              INGESTION PIPELINE
            </TabsTrigger>
            <TabsTrigger
              value="view"
              className="rounded-xl px-10 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg text-[10px] font-bold tracking-[0.2em] transition-all duration-300"
            >
              CORE REPOSITORY
            </TabsTrigger>
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="upload" className="space-y-12 outline-none p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="sleek-card p-10 bg-white/[0.01] border border-white/5 flex flex-col group hover:bg-white/[0.03] hover:border-white/10 transition-all duration-500">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 mb-8">
                    <Mail className="h-7 w-7 text-white/40 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Gmail Integration</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-10">Automated capture from communication layers</p>

                  <div className="mt-auto">
                    {userEmail !== "" ? (
                      <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 truncate">{userEmail}</span>
                      </div>
                    ) : (
                      <button className="w-full py-4 rounded-2xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:scale-[1.02] transition-all">
                        AUTHORIZE ACCESS
                      </button>
                    )}
                  </div>
                </div>

                <div className="sleek-card p-10 bg-white/[0.01] border border-white/5 flex flex-col group hover:bg-white/[0.03] hover:border-white/10 transition-all duration-500">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 mb-8">
                    <ShieldCheck className="h-7 w-7 text-white/40 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Enterprise Sync</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-10">Internal infrastructure synchronization</p>

                  <div className="mt-auto">
                    <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold text-xs uppercase tracking-widest transition-all">
                      SYNC REPOSITORY
                    </button>
                  </div>
                </div>
              </div>

              <div className="sleek-card bg-white/[0.01] border border-white/5 p-12 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                <DocumentUploader onUpload={handleFileUpload} />
              </div>

              {documents.length > 0 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-white tracking-tight">Active Pipeline</h2>
                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">{documents.length} Artifacts</span>
                    </div>
                  </div>
                  <div className="sleek-card bg-white/[0.01] border border-white/5 overflow-hidden">
                    <DocumentList
                      documents={documents}
                      onSelectDocument={handleSelectDocument}
                      selectedDocumentId={selectedDocument?.id}
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="view" className="outline-none p-4">
              <div className="sleek-card bg-white/[0.01] border border-white/5 p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                <Alldocs />
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
