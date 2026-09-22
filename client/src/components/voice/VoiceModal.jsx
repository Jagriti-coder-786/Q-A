import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Square, RotateCcw, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Badge } from '../common/Badge.jsx';
import api from '../../api/client.js';
import { useSpace } from '../../context/SpaceContext.jsx';

export function VoiceModal({ isOpen, onClose }) {
  const { currentSpace } = useSpace();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState('en-US'); // 'en-US' or 'hi-IN'

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onresult = (event) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not natively supported in your current browser. You can type queries directly in the Chat view.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResponse('');
      stopSpeaking();
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleAsk = async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    try {
      const res = await api.post('/chat/message', {
        spaceId: currentSpace?._id || currentSpace?.id,
        content: transcript.trim(),
        mode: 'ask'
      });

      const answerText = res.assistantMessage?.content || 'No response generated.';
      setResponse(answerText);
      speakAnswer(answerText);
    } catch (err) {
      setResponse('Sorry, an error occurred while processing your voice query.');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakAnswer = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Strip markdown hashes and stars for clean speech
      const cleanText = text.replace(/[#*`_]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopSpeaking();
        if (isListening && recognitionRef.current) recognitionRef.current.stop();
        onClose();
      }}
      title="Voice Assistant"
      description="Ask questions in English, Hindi, or Hinglish with live grounding."
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center space-y-5">
        {/* Language selector badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage('en-US')}
            className={`text-xs px-3 py-1 rounded-full border transition-all duration-150 ${
              language === 'en-US'
                ? 'bg-brand-500/20 border-brand-500/40 text-brand-300 font-medium shadow-xs shadow-brand-500/20'
                : 'border-midnight-border bg-midnight-surface text-slate-400 hover:text-slate-200'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi-IN')}
            className={`text-xs px-3 py-1 rounded-full border transition-all duration-150 ${
              language === 'hi-IN'
                ? 'bg-brand-500/20 border-brand-500/40 text-brand-300 font-medium shadow-xs shadow-brand-500/20'
                : 'border-midnight-border bg-midnight-surface text-slate-400 hover:text-slate-200'
            }`}
          >
            Hindi / Hinglish
          </button>
        </div>

        {/* Microphone Pulse Circle */}
        <div className="relative my-3">
          {isListening && (
            <div className="absolute -inset-3 rounded-full bg-rose-500/20 animate-ping" />
          )}
          <button
            onClick={toggleListening}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl ${
              isListening
                ? 'bg-rose-500 text-white ring-4 ring-rose-400/40 shadow-rose-500/30'
                : 'bg-gradient-to-tr from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white shadow-brand-500/30 ring-4 ring-brand-500/20'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
        </div>

        <p className="text-xs text-slate-400 font-sans">
          {isListening ? 'Listening to your question... Tap to finish' : 'Tap the microphone and speak your query'}
        </p>

        {/* Live Transcript Box */}
        <div className="w-full min-h-[70px] max-h-28 overflow-y-auto p-3.5 rounded-xl bg-midnight-surface border border-midnight-border text-left text-xs shadow-inner custom-scrollbar">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block mb-1">Your Query:</span>
          {transcript ? (
            <span className="text-slate-200 font-medium font-sans">{transcript}</span>
          ) : (
            <span className="text-slate-500 italic">"Explain deadlock according to my notes" or "Is document ka simple explanation do"</span>
          )}
        </div>

        {transcript && !isListening && (
          <Button
            onClick={handleAsk}
            isLoading={isProcessing}
            size="sm"
            className="w-full"
            icon={Sparkles}
          >
            Process Query
          </Button>
        )}

        {/* Answer Box */}
        {response && (
          <div className="w-full text-left p-4 rounded-xl bg-midnight-surface/90 border border-midnight-border text-xs space-y-2 max-h-48 overflow-y-auto custom-scrollbar shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-brand-300 font-mono text-[11px] uppercase tracking-wider">Grounded Answer:</span>
              <div className="flex items-center gap-1.5">
                {isSpeaking ? (
                  <button onClick={stopSpeaking} className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-midnight-card transition" title="Stop speaking">
                    <Square className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button onClick={() => speakAnswer(response)} className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-midnight-card transition" title="Play audio">
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-slate-200 whitespace-pre-line leading-relaxed font-sans">
              {response}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
