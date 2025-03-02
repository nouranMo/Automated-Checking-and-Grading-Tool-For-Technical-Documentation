import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import Navbar from "./Navbar";

function Homepage() {
  const [analyzedDocuments, setAnalyzedDocuments] = useState([]);
  const [selectedAnalyses, setSelectedAnalyses] = useState({
    srsValidation: false,
    referencesValidation: false,
    contentAnalysis: false,
    imageAnalysis: false,
    businessValueAnalysis: false,
    DiagramConvention: false,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedDocuments = localStorage.getItem("analyzedDocuments");
    if (savedDocuments) {
      setAnalyzedDocuments(JSON.parse(savedDocuments));
    }
  }, []);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const newDocument = {
      id: Date.now(),
      name: file.name,
      date: new Date().toLocaleDateString(),
      size: formatFileSize(file.size),
      status: "Pending Analysis",
      analyzed: false,
      file: file, // Store the file for later analysis
    };

    const updatedDocuments = [newDocument, ...analyzedDocuments];
    setAnalyzedDocuments(updatedDocuments);
    localStorage.setItem("analyzedDocuments", JSON.stringify(updatedDocuments));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxSize: 30 * 1024 * 1024, // 30MB
    multiple: false,
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDeleteDocument = (docId) => {
    const updatedDocs = analyzedDocuments.filter((doc) => doc.id !== docId);
    setAnalyzedDocuments(updatedDocs);
    localStorage.setItem("analyzedDocuments", JSON.stringify(updatedDocs));
  };

  const handleDocumentClick = (document) => {
    if (document.analyzed) {
      navigate("/parsing-result", {
        state: { parsingResult: document.results },
      });
    }
  };

  const handleAnalyzeClick = (document) => {
    setSelectedDocument(document);
    setShowAnalysisModal(true);
  };

  const startAnalysis = async () => {
    if (!Object.values(selectedAnalyses).some((value) => value)) {
      alert("Please select at least one type of analysis.");
      return;
    }

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("pdfFile", selectedDocument.file);
    formData.append("analyses", JSON.stringify(selectedAnalyses));

    try {
      const response = await fetch("http://localhost:5000/analyze_document", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.status === "success") {
        const updatedDocuments = analyzedDocuments.map((doc) =>
          doc.id === selectedDocument.id
            ? {
                ...doc,
                status: "Completed",
                analyzed: true,
                analyses: selectedAnalyses,
                results: result,
              }
            : doc
        );

        setAnalyzedDocuments(updatedDocuments);
        localStorage.setItem(
          "analyzedDocuments",
          JSON.stringify(updatedDocuments)
        );
        setShowAnalysisModal(false);
        navigate("/parsing-result", { state: { parsingResult: result } });
      }
    } catch (error) {
      console.error("Error analyzing document:", error);
      alert("An error occurred while analyzing the document.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            Document Dashboard
          </h1>
          <p className="text-gray-500">
            {analyzedDocuments.length} documents total
          </p>
        </div>

        <hr className="border-t border-gray-200 mb-8" />

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            w-1/2 mx-auto border-2 border-dashed rounded-lg p-16 mb-8 text-center cursor-pointer
            transition-colors duration-300 ease-in-out
            ${
              isDragActive
                ? "border-[#ff6464] bg-red-50"
                : "border-gray-300 hover:border-[#ff6464] hover:bg-red-50"
            }
            ${isAnalyzing ? "pointer-events-none opacity-50" : ""}
          `}
        >
          <input {...getInputProps()} />
          <div className="mb-3">
            <svg
              className={`mx-auto h-12 w-12 ${
                isDragActive ? "text-red-400" : "text-gray-400"
              }`}
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 12h18M12 3v18"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {isAnalyzing ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600" />
              <p className="text-red-600">Analyzing document...</p>
            </div>
          ) : isDragActive ? (
            <>
              <p className="text-red-500 mb-1">Drop the file here</p>
              <p className="text-gray-400 text-sm">PDF, DOC, DOCX (max 30MB)</p>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-1">
                Drag & drop a file here, or click to select
              </p>
              <p className="text-gray-400 text-sm">PDF, DOC, DOCX (max 30MB)</p>
            </>
          )}
        </div>

        {/* Document List */}
        <div>
          <div className="flex gap-4 mb-4">
            <select className="border rounded-md px-3 py-1.5 text-sm text-gray-600">
              <option>All ({analyzedDocuments.length})</option>
            </select>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-gray-50 text-sm font-medium text-gray-500">
            <div>DOCUMENT NAME</div>
            <div>UPLOAD DATE</div>
            <div>SIZE</div>
            <div>STATUS</div>
            <div>ACTIONS</div>
          </div>

          {/* Table Content */}
          {analyzedDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No documents uploaded yet
            </div>
          ) : (
            analyzedDocuments.map((doc) => (
              <div
                key={doc.id}
                className="grid grid-cols-5 gap-4 px-4 py-3 border-b text-sm text-gray-600 hover:bg-gray-50"
                onClick={() => handleDocumentClick(doc)}
              >
                <div>{doc.name}</div>
                <div>{doc.date}</div>
                <div>{doc.size}</div>
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      doc.analyzed
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {!doc.analyzed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnalyzeClick(doc);
                      }}
                      className="px-3 py-1 text-sm text-white bg-[#ff6464] rounded-md hover:bg-[#ff4444]"
                    >
                      Analyze
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDocument(doc.id);
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Analysis Modal */}
        {showAnalysisModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full m-4">
              <h2 className="text-xl font-semibold mb-4">
                Select Analyses to Perform
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {Object.entries(selectedAnalyses).map(([key, value]) => (
                  <label
                    key={key}
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() =>
                        setSelectedAnalyses((prev) => ({
                          ...prev,
                          [key]: !prev[key],
                        }))
                      }
                      className="w-4 h-4 text-[#FF4550]"
                    />
                    <span>{key.replace(/([A-Z])/g, " $1").trim()}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-[#ff6464] text-white rounded-md hover:bg-[#ff4444] disabled:opacity-50"
                >
                  {isAnalyzing ? "Analyzing..." : "Start Analysis"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Homepage;
