import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useToast } from '../context/ToastContext';
import { storage } from '../utils/storage';
import { CustomPassage, TestResult } from '../types/typing';
import { TypingEngine } from '../components/typing/TypingEngine';
import { ResultsView } from '../components/typing/ResultsView';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  FileText,
  Plus,
  Play,
  Copy,
  Check,
  Trash2,
  Sparkles,
  ArrowLeft,
  Clock,
  AlignLeft,
  Search,
} from 'lucide-react';

export const CustomTextPage: React.FC = () => {
  const { addTestResult } = useProgress();
  const { toast } = useToast();

  const [passages, setPassages] = useState<CustomPassage[]>(() => storage.getCustomPassages());
  const [activePassage, setActivePassage] = useState<CustomPassage | null>(null);
  const [activeResult, setActiveResult] = useState<TestResult | null>(null);
  const [engineKey, setEngineKey] = useState(0);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Personal');
  const [newText, setNewText] = useState('');
  const [formError, setFormError] = useState('');

  // Delete Confirmation Modal State
  const [deleteCandidate, setDeleteCandidate] = useState<CustomPassage | null>(null);

  // Copy indicator state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['all', ...Array.from(new Set(passages.map((p) => p.category)))];

  const filteredPassages = passages.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.text.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreatePassage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Please enter a title for this passage.');
      return;
    }
    const cleanedText = newText.replace(/\s+/g, ' ').trim();
    const wordCount = cleanedText.split(' ').filter(Boolean).length;
    if (wordCount < 5) {
      setFormError('Passage is too short. Please provide at least 5 words.');
      return;
    }
    if (cleanedText.length > 5000) {
      setFormError('Passage exceeds maximum limit of 5,000 characters.');
      return;
    }

    const passage: CustomPassage = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory.trim() || 'Personal',
      text: cleanedText,
      createdAt: Date.now(),
    };

    storage.saveCustomPassage(passage);
    setPassages(storage.getCustomPassages());
    setModalOpen(false);
    setNewTitle('');
    setNewText('');
    setFormError('');
    toast.success(`"${passage.title}" added to your custom library!`);
  };

  const handleDeletePassage = () => {
    if (!deleteCandidate) return;
    storage.deleteCustomPassage(deleteCandidate.id);
    setPassages(storage.getCustomPassages());
    if (activePassage?.id === deleteCandidate.id) {
      setActivePassage(null);
    }
    toast.info(`Deleted "${deleteCandidate.title}"`);
    setDeleteCandidate(null);
  };

  const handleCopyText = async (passage: CustomPassage) => {
    try {
      await navigator.clipboard.writeText(passage.text);
      setCopiedId(passage.id);
      toast.success('Passage copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy text');
    }
  };

  const startPractice = (passage: CustomPassage) => {
    setActivePassage(passage);
    setActiveResult(null);
    setEngineKey((k) => k + 1);
  };

  const handleTestComplete = (rawResult: Omit<TestResult, 'isPersonalBest'>) => {
    const { result, isPersonalBest } = addTestResult(rawResult);
    setActiveResult(result);
    if (isPersonalBest) {
      toast.success('New Personal Best speed achieved on custom passage!');
    } else {
      toast.info('Custom text practice completed!');
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 animate-fadeIn pb-12">
      {/* If actively typing or viewing results */}
      {activePassage ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActivePassage(null)}
              className="flex items-center gap-1.5 text-xs font-mono text-[#989A92] hover:text-[#ECEBE4] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Custom Library</span>
            </button>

            <div className="flex items-center gap-2">
              <Badge variant="amber" size="xs">
                {activePassage.category}
              </Badge>
              <span className="text-xs font-mono font-bold text-[#ECEBE4]">
                {activePassage.title}
              </span>
            </div>
          </div>

          <div className="bg-[#272824]/60 border border-[#353630] rounded-2xl p-6 sm:p-8">
            {activeResult ? (
              <ResultsView
                result={activeResult}
                onRetry={() => {
                  setActiveResult(null);
                  setEngineKey((k) => k + 1);
                }}
                onNextTest={() => {
                  setActiveResult(null);
                  setEngineKey((k) => k + 1);
                }}
              />
            ) : (
              <TypingEngine
                key={engineKey}
                initialText={activePassage.text}
                mode="custom"
                onComplete={handleTestComplete}
                onRestart={() => {
                  setActiveResult(null);
                  setEngineKey((k) => k + 1);
                }}
              />
            )}
          </div>
        </div>
      ) : (
        /* Library View */
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="amber" size="sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Custom Studio
                </Badge>
                <span className="text-xs font-mono text-[#989A92]">
                  {passages.length} Saved Passages
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#ECEBE4] flex items-center gap-3">
                <FileText className="w-7 h-7 text-[#E6C76B]" />
                <span>Custom Text Library</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#989A92] mt-1 max-w-2xl">
                Type your own essays, code snippets, study notes, or favorite book excerpts with real-time speed metrics and error tracking.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Custom Text
            </Button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition-all ${
                    selectedCategory === c
                      ? 'bg-[#E6C76B] text-[#20211D] font-bold shadow-xs'
                      : 'bg-[#272824] text-[#989A92] hover:text-[#ECEBE4] border border-[#353630]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#7E8079]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search passages..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#272824] border border-[#353630] text-xs font-mono text-[#ECEBE4] focus:outline-none focus:border-[#E6C76B]"
              />
            </div>
          </div>

          {/* Passage Cards Grid */}
          {filteredPassages.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#272824] border border-[#353630] text-xs font-mono text-[#989A92]">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#ECEBE4]" />
              <p>No custom texts match your query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPassages.map((passage) => {
                const words = passage.text.split(' ').filter(Boolean).length;
                const estSeconds = Math.round((words / 60) * 60);

                return (
                  <div
                    key={passage.id}
                    className="p-5 rounded-2xl bg-[#272824] border border-[#353630] hover:border-[#7E8079] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="amber" size="xs">
                          {passage.category}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#7E8079]">
                          <span className="flex items-center gap-1">
                            <AlignLeft className="w-3 h-3" />
                            {words} words
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            ~{estSeconds}s
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-[#ECEBE4] mb-2">{passage.title}</h3>
                      <p className="text-xs text-[#989A92] font-mono line-clamp-3 leading-relaxed mb-4">
                        {passage.text}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#353630]">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyText(passage)}
                          className="p-1.5 rounded-lg text-[#989A92] hover:text-[#ECEBE4] hover:bg-[#20211D] transition-colors"
                          title="Copy text"
                        >
                          {copiedId === passage.id ? (
                            <Check className="w-3.5 h-3.5 text-[#5DBE76]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(passage)}
                          className="p-1.5 rounded-lg text-[#989A92] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete passage"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => startPractice(passage)}
                        leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                      >
                        Practice
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Add Passage Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Custom Passage"
      >
        <form onSubmit={handleCreatePassage} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-[#989A92] mb-1 font-semibold uppercase">Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Gettysburg Address or My TypeScript Notes"
              className="w-full p-2.5 rounded-xl bg-[#20211D] border border-[#353630] text-[#ECEBE4] focus:outline-none focus:border-[#E6C76B]"
            />
          </div>

          <div>
            <label className="block text-[#989A92] mb-1 font-semibold uppercase">Category</label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Coding, Literature, Speech, Study"
              className="w-full p-2.5 rounded-xl bg-[#20211D] border border-[#353630] text-[#ECEBE4] focus:outline-none focus:border-[#E6C76B]"
            />
          </div>

          <div>
            <label className="block text-[#989A92] mb-1 font-semibold uppercase">Passage Content</label>
            <textarea
              required
              rows={5}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Type or paste the passage content here..."
              className="w-full p-3 rounded-xl bg-[#20211D] border border-[#353630] text-[#ECEBE4] focus:outline-none focus:border-[#E6C76B] resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between text-[11px] text-[#7E8079] mt-1">
              <span>{newText.split(/\s+/).filter(Boolean).length} words</span>
              <span>{newText.length} / 5000 characters</span>
            </div>
          </div>

          {formError && (
            <p className="text-xs text-red-400 font-mono">{formError}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#353630]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Save Passage
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteCandidate)}
        onClose={() => setDeleteCandidate(null)}
        title="Delete Custom Passage"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#989A92]">
            Are you sure you want to remove <strong className="text-[#ECEBE4]">"{deleteCandidate?.title}"</strong> from your library?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteCandidate(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeletePassage}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
