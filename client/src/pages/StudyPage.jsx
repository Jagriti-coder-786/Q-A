import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  RotateCw,
  HelpCircle,
  FileText,
  ChevronRight,
  Upload,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { useSpace } from '../context/SpaceContext.jsx';
import api from '../api/client.js';

export function StudyPage() {
  const { currentSpace } = useSpace();
  const { openUploadModal } = useOutletContext();
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [studyPack, setStudyPack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('flashcards'); // 'flashcards' | 'mcqs' | 'exam' | 'notes'

  // Flashcards state
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // MCQs quiz state
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    async function loadDocs() {
      try {
        const spaceParam = currentSpace ? `?spaceId=${currentSpace._id || currentSpace.id}` : '';
        const res = await api.get(`/documents${spaceParam}`);
        const docs = res.documents || [];
        setDocuments(docs);
        if (docs.length > 0) {
          setSelectedDocId(docs[0]._id || docs[0].id);
        } else {
          setSelectedDocId('');
          setStudyPack(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadDocs();
  }, [currentSpace]);

  const handleGenerate = async () => {
    if (!selectedDocId) {
      setErrorMessage('Please select a document to generate study material.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.post('/study/generate', { documentId: selectedDocId });
      setStudyPack(res.studyPack);
      setCurrentCardIdx(0);
      setIsFlipped(false);
      setSelectedAnswers({});
      setShowResults(false);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to generate study pack.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (mcqId, optionIdx) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({ ...prev, [mcqId]: optionIdx }));
  };

  const score = studyPack?.mcqs ? Object.entries(selectedAnswers).reduce((acc, [id, idx]) => {
    const q = studyPack.mcqs.find(m => m.id === id);
    return acc + (q && q.correctIndex === idx ? 1 : 0);
  }, 0) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-brand-600" /> Study Mode
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Turn your lecture notes and syllabus into interactive flashcards, practice quizzes, and exam prep.
          </p>
        </div>

        {/* Document selector & generator */}
        {documents.length > 0 ? (
          <div className="flex items-center gap-2">
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            >
              {documents.map((d) => (
                <option key={d._id || d.id} value={d._id || d.id}>
                  {d.title}
                </option>
              ))}
            </select>
            <Button size="sm" onClick={handleGenerate} isLoading={loading} icon={Sparkles}>
              Generate Study Pack
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={openUploadModal} icon={Upload}>
            Upload Document First
          </Button>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="font-semibold underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {documents.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No documents in {currentSpace?.name || 'this space'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Upload course notes, a syllabus, or research papers to start generating flashcards and quizzes.
          </p>
          <Button size="sm" onClick={openUploadModal} icon={Upload}>
            Upload Document
          </Button>
        </div>
      )}

      {!studyPack && !loading && documents.length > 0 && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <BookOpen className="w-10 h-10 text-brand-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Ready to prepare for exams?
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Select one of your uploaded study documents above and click "Generate Study Pack".
          </p>
          <Button size="sm" onClick={handleGenerate} icon={Sparkles}>
            Generate from Current Document
          </Button>
        </div>
      )}

      {/* Tabs */}
      {studyPack && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            {[
              { id: 'flashcards', label: `Flashcards (${studyPack.flashcards?.length || 0})` },
              { id: 'mcqs', label: `Practice MCQs (${studyPack.mcqs?.length || 0})` },
              { id: 'exam', label: `Exam Questions (${studyPack.examQuestions?.length || 0})` },
              { id: 'notes', label: `Revision Notes (${studyPack.revisionNotes?.length || 0})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Flashcards View */}
          {activeTab === 'flashcards' && studyPack.flashcards && studyPack.flashcards.length > 0 && (
            <div className="max-w-lg mx-auto space-y-4">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="h-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-md transition text-center select-none"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Card {currentCardIdx + 1} of {studyPack.flashcards.length}</span>
                  <Badge variant="brand" size="xs">
                    Page {studyPack.flashcards[currentCardIdx].pageNumber}
                  </Badge>
                </div>

                <div className="my-auto">
                  {!isFlipped ? (
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Concept</span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {studyPack.flashcards[currentCardIdx].term}
                      </h3>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Definition</span>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {studyPack.flashcards[currentCardIdx].definition}
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" /> Click card to flip
                </div>
              </div>

              {/* Flashcards Navigation Controls */}
              <div className="flex items-center justify-between px-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={currentCardIdx === 0}
                  onClick={() => {
                    setCurrentCardIdx(prev => prev - 1);
                    setIsFlipped(false);
                  }}
                >
                  Previous
                </Button>
                <span className="text-xs text-slate-400">
                  {currentCardIdx + 1} / {studyPack.flashcards.length}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={currentCardIdx === studyPack.flashcards.length - 1}
                  onClick={() => {
                    setCurrentCardIdx(prev => prev + 1);
                    setIsFlipped(false);
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* MCQs Practice Quiz View */}
          {activeTab === 'mcqs' && studyPack.mcqs && (
            <div className="space-y-5 max-w-2xl mx-auto">
              {studyPack.mcqs.map((mcq, idx) => {
                const selectedOpt = selectedAnswers[mcq.id];
                const isAnswered = selectedOpt !== undefined;
                const isCorrect = isAnswered && selectedOpt === mcq.correctIndex;

                return (
                  <div
                    key={mcq.id || idx}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {idx + 1}. {mcq.question}
                      </h3>
                      <Badge variant="neutral" size="xs">Page {mcq.pageNumber}</Badge>
                    </div>

                    <div className="space-y-2 pt-1">
                      {mcq.options.map((opt, optIdx) => {
                        let btnStyle = 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300';

                        if (showResults) {
                          if (optIdx === mcq.correctIndex) {
                            btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold';
                          } else if (selectedOpt === optIdx) {
                            btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                          }
                        } else if (selectedOpt === optIdx) {
                          btnStyle = 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-800 dark:text-brand-200 font-medium';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(mcq.id, optIdx)}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                            {showResults && optIdx === mcq.correctIndex && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            {showResults && selectedOpt === optIdx && optIdx !== mcq.correctIndex && (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {showResults && (
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 text-[11px] text-slate-600 dark:text-slate-300">
                        <span className="font-bold text-slate-900 dark:text-slate-100">Explanation: </span>
                        {mcq.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex items-center justify-between pt-4">
                {showResults ? (
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Your Score: {score} / {studyPack.mcqs.length} ({Math.round((score / studyPack.mcqs.length) * 100)}%)
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">
                    {Object.keys(selectedAnswers).length} of {studyPack.mcqs.length} answered
                  </span>
                )}

                <Button
                  size="sm"
                  onClick={() => setShowResults(!showResults)}
                >
                  {showResults ? 'Hide Results & Retry' : 'Check Answers'}
                </Button>
              </div>
            </div>
          )}

          {/* Exam Questions View */}
          {activeTab === 'exam' && studyPack.examQuestions && (
            <div className="space-y-4 max-w-2xl mx-auto">
              {studyPack.examQuestions.map((eq, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="brand" size="xs">[{eq.marks} Marks]</Badge>
                      <Badge variant="neutral" size="xs">Page {eq.pageNumber}</Badge>
                    </div>
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    {eq.question}
                  </h3>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Model Answer:
                    </span>
                    {eq.modelAnswer}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Revision Notes View */}
          {activeTab === 'notes' && studyPack.revisionNotes && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {studyPack.revisionNotes.map((rn, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {rn.title}
                    </h3>
                    <Badge variant="neutral" size="xs">Page {rn.pageNumber}</Badge>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                    {rn.bullets?.map((b, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
