import { useState } from "react";
import VersionViewer from "@/components/version/VersionViewer";
import { Search, FileText, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Mock document for initial state
const mockDocuments = [
  {
    id: "1",
    name: "Sample Term Sheet.pdf",
    status: "validated",
    type: "application/pdf",
    uploadDate: "2023-08-15T10:30:00Z",
    size: 1024 * 1024 * 2.5,
    versions: [
      {
        version: 1,
        uploadDate: "2023-08-10T10:30:00Z",
        extractedText: "Initial version text...",
        highlightedTerms: [
          { term: "Valuation", value: "$8M pre-money", position: { start: 108, end: 123 } },
          { term: "Amount", value: "$1.5M", position: { start: 131, end: 134 } }
        ],
        expectedTerms: [
          { term: "Valuation", value: "$10M pre-money" },
          { term: "Amount", value: "$2M" }
        ]
      },
      {
        version: 2,
        uploadDate: "2023-08-15T10:30:00Z",
        extractedText: "Revised term sheet text...",
        highlightedTerms: [
          { term: "Valuation", value: "$10M pre-money", position: { start: 108, end: 123 } },
          { term: "Amount", value: "$2M", position: { start: 131, end: 134 } },
          { term: "Liquidation Preference", value: "1x non-participating", position: { start: 199, end: 217 } }
        ],
        expectedTerms: [
          { term: "Valuation", value: "$10M pre-money" },
          { term: "Amount", value: "$2M" },
          { term: "Liquidation Preference", value: "1x non-participating" }
        ]
      }
    ]
  },
  {
    id: "2",
    name: "Investment Term Sheet.pdf",
    status: "pending",
    type: "application/pdf",
    uploadDate: "2023-09-10T12:00:00Z",
    size: 1024 * 1024 * 1.2,
    versions: [
      {
        version: 1,
        uploadDate: "2023-09-01T12:00:00Z",
        extractedText: "First draft of investment term sheet...",
        highlightedTerms: [
          { term: "Equity", value: "20%", position: { start: 105, end: 109 } },
          { term: "Investment Amount", value: "$5M", position: { start: 115, end: 118 } }
        ],
        expectedTerms: [
          { term: "Equity", value: "25%" },
          { term: "Investment Amount", value: "$6M" }
        ]
      },
      {
        version: 2,
        uploadDate: "2023-09-10T12:00:00Z",
        extractedText: "Updated investment term sheet...",
        highlightedTerms: [
          { term: "Equity", value: "25%", position: { start: 105, end: 109 } },
          { term: "Investment Amount", value: "$6M", position: { start: 115, end: 118 } },
          { term: "Preferred Return", value: "8%", position: { start: 160, end: 174 } }
        ],
        expectedTerms: [
          { term: "Equity", value: "25%" },
          { term: "Investment Amount", value: "$6M" },
          { term: "Preferred Return", value: "8%" }
        ]
      }
    ]
  },
  {
    id: "3",
    name: "Shareholder Agreement.pdf",
    status: "processing",
    type: "application/pdf",
    uploadDate: "2023-07-10T08:00:00Z",
    size: 1024 * 1024 * 5.0,
    versions: [
      {
        version: 1,
        uploadDate: "2023-07-01T08:00:00Z",
        extractedText: "Original shareholder agreement document...",
        highlightedTerms: [
          { term: "Voting Rights", value: "Yes", position: { start: 110, end: 122 } },
          { term: "Dividend Rights", value: "5% per annum", position: { start: 130, end: 148 } }
        ],
        expectedTerms: [
          { term: "Voting Rights", value: "Yes" },
          { term: "Dividend Rights", value: "6% per annum" }
        ]
      },
      {
        version: 2,
        uploadDate: "2023-07-10T08:00:00Z",
        extractedText: "Updated shareholder agreement terms...",
        highlightedTerms: [
          { term: "Voting Rights", value: "Yes", position: { start: 110, end: 122 } },
          { term: "Dividend Rights", value: "6% per annum", position: { start: 130, end: 148 } },
          { term: "Transfer Restrictions", value: "Yes, after 5 years", position: { start: 180, end: 210 } }
        ],
        expectedTerms: [
          { term: "Voting Rights", value: "Yes" },
          { term: "Dividend Rights", value: "6% per annum" },
          { term: "Transfer Restrictions", value: "Yes, after 5 years" }
        ]
      }
    ]
  },
  {
    id: "4",
    name: "Convertible Note Term Sheet.pdf",
    status: "error",
    type: "application/pdf",
    uploadDate: "2023-10-05T14:00:00Z",
    size: 1024 * 500,
    versions: [
      {
        version: 1,
        uploadDate: "2023-10-01T14:00:00Z",
        extractedText: "Initial convertible note agreement...",
        highlightedTerms: [
          { term: "Interest Rate", value: "5%", position: { start: 105, end: 115 } },
          { term: "Maturity Date", value: "2025-10-01", position: { start: 120, end: 131 } }
        ],
        expectedTerms: [
          { term: "Interest Rate", value: "6%" },
          { term: "Maturity Date", value: "2025-10-01" }
        ]
      },
      {
        version: 2,
        uploadDate: "2023-10-05T14:00:00Z",
        extractedText: "Updated convertible note agreement...",
        highlightedTerms: [
          { term: "Interest Rate", value: "6%", position: { start: 105, end: 115 } },
          { term: "Maturity Date", value: "2025-10-01", position: { start: 120, end: 131 } },
          { term: "Conversion Discount", value: "20%", position: { start: 145, end: 164 } }
        ],
        expectedTerms: [
          { term: "Interest Rate", value: "6%" },
          { term: "Maturity Date", value: "2025-10-01" },
          { term: "Conversion Discount", value: "20%" }
        ]
      }
    ]
  }
];

type DocumentType = typeof mockDocuments[0];

function Versions() {
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = mockDocuments.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 px-4">
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight"
          >
            Document <span className="text-white/40">Versions</span>
          </motion.h1>
          <p className="text-lg text-white/40 font-medium max-w-2xl">
            Track and compare semantic changes across document iteration cycles.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {!selectedDocument && (
          <div className="flex flex-col md:flex-row justify-between gap-8 items-center px-8 py-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl mx-4">
            <div className="relative w-full group">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                placeholder="Search repository versions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-white/10 text-white"
              />
            </div>
          </div>
        )}

        <div className="grid gap-6 px-4">
          {!selectedDocument && filteredDocuments.map(doc => (
            <div
              key={doc.id}
              onClick={() => setSelectedDocument(doc)}
              className="group relative cursor-pointer"
            >
              <div className="sleek-card p-10 bg-white/[0.01] border border-white/5 flex items-center justify-between hover:bg-white/[0.03] hover:border-white/10 transition-all duration-500">
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
                    <FileText className="h-7 w-7 text-white/40 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-white transition-colors">{doc.name}</h3>
                    <div className="flex items-center gap-6 mt-3">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-2 group-hover:text-white/40 transition-colors">
                        <Clock className="h-3 w-3" />
                        {doc.versions.length} ITERATIONS
                      </span>
                      <span className="text-[10px] font-bold text-white/10 uppercase tracking-[0.2em] italic">
                        SYNC: {new Date(doc.versions[doc.versions.length - 1].uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/10 group-hover:text-white group-hover:bg-white/10 transition-all transform group-hover:translate-x-1">
                  <ChevronRight className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}

          {!selectedDocument && filteredDocuments.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center border border-white/5 border-dashed rounded-[3rem] bg-white/[0.01]">
              <FileText className="h-12 w-12 text-white/5 mb-6" strokeWidth={1} />
              <p className="text-white/20 font-bold uppercase tracking-[0.3em] text-xs">No matching artifacts found within registry</p>
            </div>
          )}

          {selectedDocument && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="px-4">
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all font-bold text-[10px] uppercase tracking-widest"
                >
                  Return to Registry
                </button>
              </div>
              <VersionViewer document={selectedDocument} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Versions;
