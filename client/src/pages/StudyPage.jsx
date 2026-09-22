import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  RotateCw,
  HelpCircle,
  FileText,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { useSpace } from '../context/SpaceContext.jsx';
import api from '../api/client.js';

export function StudyPage() {
  const { currentSpace } = useSpace();
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [studyPack, setStudyPack] = useState(null);
  const [loading, setLoading] = useState(false);
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
        const res = await api.get('/documents');
        setDocuments(res.documents || []);
        if (res.documents?.length > 0) {
          setSelectedDocId(res.documents[0]._id || res.documents[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadDocs();
  }, [currentSpace]);

  const handleGenerate = async () => {
    if (!selectedDocId) return;
    setLoading(true);
    try {
      const res = await api.post('/study/generate', { documentId: selectedDocId });
      setStudyPack(res.studyPack);
      setCurrentCardIdx(0);
      setIsFlipped(false);
      setSelectedAnswers({});
      setShowResults(false);
    } catch (err) {
      alert(err.message || 'Failed to generate study pack.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (mcqId, optionIdx) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({ ...prev, [mcqId]: optionIdx }));
  };

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
      </div>

      {!studyPack && !loading && (
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

          {/* Tab 1: 3D Interactive Flashcards */}
          {activeTab === 'flashcards' && (
            <div className="flex flex-col items-center space-y-4">
              {studyPack.flashcards?.length > 0 ? (
                <>
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="w-full max-w-xl h-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md p-8 flex flex-col justify-between cursor-pointer hover:border-brand-500 transition text-center select-none"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Card {currentCardIdx + 1} of {studyPack.flashcards.length}</span>
                      <span className="text-[11px] font-medium text-brand-600 flex items-center gap-1">
                        <RotateCw className="w-3 h-3" /> Click to flip
                      </span>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-4">
                      {!isFlipped ? (
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-2">Term / Concept</span>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            {studyPack.flashcards[currentCardIdx].term}
                          </h3>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-2">Definition / Grounded Answer</span>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                            {studyPack.flashcards[currentCardIdx].definition}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Source: Page {studyPack.flashcards[currentCardIdx].pageNumber} ({studyPack.flashcards[currentCardIdx].documentTitle})
                    </div>
                  </div>

                  {/* Flashcard Navigation controls */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIdx(prev => Math.max(0, prev - 1));
                      }}
                      disabled={currentCardIdx === 0}
                    >
                      Previous Card
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIdx(prev => Math.min(studyPack.flashcards.length - 1, prev + 1));
                      }}
                      disabled={currentCardIdx === studyPack.flashcards.length - 1}
                    >
                      Next Card
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400">No flashcards available.</p>
              )}
            </div>
          )}

          {/* Tab 2: Practice MCQs with Live Scoring */}
          {activeTab === 'mcqs' && (
            <div className="space-y-4">
              {studyPack.mcqs?.map((mcq, idx) => {
                const userChoice = selectedAnswers[mcq.id];
                const isCorrect = userChoice === mcq.correctIndex;
                return (
                  <div key={mcq.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {idx + 1}. {mcq.question}
                      </h4>
                      <Badge variant="neutral" size="xs">Page {mcq.pageNumber}</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {mcq.options.map((opt, optIdx) => {
                        let btnStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 hover:border-slate-300';
                        if (userChoice === optIdx) {
                          btnStyle = 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-medium';
                        }
                        if (showResults) {
                          if (optIdx === mcq.correctIndex) {
                            btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold';
                          } else if (userChoice === optIdx) {
                            btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(mcq.id, optIdx)}
                            className={`p-3 rounded-xl border text-left text-xs transition flex items-start gap-2 ${btnStyle}`}
                          >
                            <span className="font-bold shrink-0">{String.fromCharCode(65 + optIdx)})</span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {showResults && (
                      <div className={`p-2.5 rounded-lg text-xs leading-relaxed ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                        <span className="font-bold block mb-0.5">
                          {isCorrect ? '✅ Correct!' : 'ℹ️ Explanation:'}
                        </span>
                        {mcq.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  onClick={() => setShowResults(!showResults)}
                >
                  {showResults ? 'Hide Answers' : 'Check Answers & Score'}
                </Button>
              </div>
            </div>
          )}

          {/* Tab 3: Exam Questions (2, 5, 10 Marks) */}
          {activeTab === 'exam' && (
            <div className="space-y-4">
              {studyPack.examQuestions?.map((q, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={q.marks >= 10 ? 'danger' : (q.marks >= 5 ? 'brand' : 'info')} size="xs">
                      {q.marks} Marks Question
                    </Badge>
                    <span className="text-[11px] text-slate-400">Page {q.pageNumber}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {q.question}
                  </h4>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">Model Answer / Key Points:</span>
                    {q.modelAnswer}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Revision Notes */}
          {activeTab === 'notes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyPack.revisionNotes?.map((note, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {note.title}
                    </h4>
                    <Badge variant="brand" size="xs">Page {note.pageNumber}</Badge>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                    {note.bullets.map((b, bIdx) => (
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
