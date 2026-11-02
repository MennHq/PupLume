import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Droplet, 
  Utensils, 
  Moon, 
  DollarSign, 
  Activity,
  Trash2,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { useUser } from '@clerk/react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { PuppyProfile, AIMessage, AIActionSuggestion } from '../types';
import { storage } from '../lib/storage';
import { Button } from '../components/ui/Button';
import { PupLumeLogo } from '../components/common/PupLumeLogo';

interface AIAssistantViewProps {
  puppy: PuppyProfile;
  onActionTriggered?: (msg: string) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ puppy, onActionTriggered }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<AIMessage[]>(storage.getAIMessages());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [executedActions, setExecutedActions] = useState<Record<string, boolean>>({});

  const saveMemory = useMutation(api.ai.saveMemory);
  const cloudData = useQuery(api.app.getUserAppData, user?.id ? { userId: user.id } : 'skip');
  const memoriesList = (cloudData?.memories || []).map((m: any) => m.fact);

  const starterPrompts = [
    `Why is ${puppy.name} biting so much?`,
    `What should ${puppy.name} do today?`,
    `When is ${puppy.name}’s next vaccine?`,
    'Create a potty-training plan.',
    `Why won’t ${puppy.name} settle in the crate?`,
    `Summarize ${puppy.name}’s progress this week.`
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setMessages(storage.getAIMessages());
    });
    return unsub;
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setInput('');

    const userMsg: AIMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    storage.saveAIMessages(updated);
    localStorage.setItem('puplume_asked_ai', 'true');
    window.dispatchEvent(new CustomEvent('puplume-action-completed', { detail: { action: 'ai' } }));
    setIsLoading(true);

    try {
      const birthDate = new Date(puppy.birthDate);
      const ageWeeks = Math.max(1, Math.floor((new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7)));

      const pLogs = storage.getPottyLogs(puppy.id);
      const outdoorCount = pLogs.filter(l => l.location === 'outdoor' || l.location === 'pad').length;
      const recentPottySummary = pLogs.length > 0 
        ? `${Math.round((outdoorCount / pLogs.length) * 100)}% outdoor reliability, ${pLogs.length} logs recorded`
        : 'No potty logs recorded yet';

      const pupTasks = storage.getTasks(puppy.id);
      const pendingTasks = pupTasks.filter(t => !t.completed && !t.skipped);
      const upcomingTasks = pendingTasks.length > 0
        ? pendingTasks.slice(0, 3).map(t => `${t.title} (${t.time})`).join(', ')
        : 'All today tasks completed';

      const apts = storage.getAppointments(puppy.id);
      const nextApt = apts.find(a => a.status === 'scheduled');
      const vacs = storage.getVaccinations(puppy.id);
      const nextVac = vacs.find(v => v.status === 'due_soon');
      const upcomingVet = nextApt
        ? `${nextApt.title} on ${nextApt.date} at ${nextApt.clinic}`
        : nextVac
        ? `Vaccine due: ${nextVac.vaccineName} (${nextVac.nextDueDate})`
        : `${puppy.vetClinic || 'No upcoming vet appointments'}`;

      const payload = {
        userId: user?.id,
        message: text,
        puppyContext: {
          name: puppy.name,
          breed: puppy.breed,
          ageWeeks,
          birthDate: puppy.birthDate,
          weightLbs: puppy.weightLbs,
          temperament: puppy.temperament,
          recentPottySummary,
          recentSleepSummary: 'Normal puppy sleep schedule',
          upcomingTasks,
          upcomingVet,
          longTermMemories: memoriesList
        }
      };

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('AI request failed');

      const data = await res.json();

      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now(),
        suggestedActions: data.suggestedActions
      };

      const finalMessages = [...updated, aiMsg];
      setMessages(finalMessages);
      storage.saveAIMessages(finalMessages);
    } catch (err) {
      console.error('Error calling AI endpoint:', err);
      // Fallback message
      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: `I've analyzed ${puppy.name}'s daily schedule. For a ${puppy.breed} at this stage, focusing on positive reinforcement and short 5-minute drills works best. Let me know if you'd like to log a potty event or adjust today's nap windows.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now(),
      };
      const finalMessages = [...updated, aiMsg];
      setMessages(finalMessages);
      storage.saveAIMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = (action: AIActionSuggestion) => {
      const p = action.payload || {};

    if (action.type === 'NAVIGATE') {
      const tab = p.tab;
      if (tab) {
        const event = new CustomEvent('navigate', { detail: { view: tab } });
        window.dispatchEvent(event);
      }
      setExecutedActions(prev => ({ ...prev, [action.id]: true }));
      if (onActionTriggered) onActionTriggered(`Navigating to ${tab}...`);
      return;
    }


    if (action.type === 'CREATE_TASK') {
      // Navigate to tasks view
      window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'tasks' } }));
      // Tell TasksView to open the Add modal with prefilled data
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-add-task', { 
          detail: { 
            title: p.title || action.title,
            category: p.category,
            time: p.time,
            durationMin: p.durationMin
          } 
        }));
      }, 100);
    } else if (action.type === 'CREATE_APPOINTMENT') {
      storage.addAppointment({
        puppyId: puppy.id,
        title: p.title || action.title,
        clinic: p.clinic || puppy.vetClinic || 'City Vet Animal Hospital',
        date: p.date || new Date().toISOString().split('T')[0],
        time: p.time || '11:00 AM',
        reason: p.reason || 'Veterinary checkup',
        status: 'scheduled'
      });
    } else if (action.type === 'LOG_POTTY') {
      storage.addPottyLog({
        puppyId: puppy.id,
        type: p.type || 'pee',
        location: p.location || 'outdoor',
        timestamp: new Date().toISOString(),
        notes: 'Logged via AI Assistant'
      });
    } else if (action.type === 'LOG_FEEDING') {
      storage.addFeedingLog({
        puppyId: puppy.id,
        mealType: p.mealType || 'lunch',
        amountCups: p.amountCups || 0.75,
        foodBrand: puppy.dietaryRestrictions || 'Puppy kibble',
        timestamp: new Date().toISOString()
      });
    } else if (action.type === 'LOG_SLEEP') {
      const dur = p.durationMin || 60;
      storage.addSleepLog({
        puppyId: puppy.id,
        type: p.type || 'nap',
        startTime: new Date(Date.now() - dur * 60000).toISOString(),
        endTime: new Date().toISOString(),
        durationMin: dur,
        notes: 'Logged via AI'
      });
    } else if (action.type === 'ADD_EXPENSE') {
      storage.addExpense({
        puppyId: puppy.id,
        title: p.title || action.title,
        category: p.category || 'other',
        amount: p.amount || 25.00,
        date: new Date().toISOString().split('T')[0],
        vendor: 'Local Store'
      });
    } else if (action.type === 'SAVE_MEMORY') {
      saveMemory({
        puppyId: puppy.id,
        fact: p.fact || action.title,
        category: p.category || 'preference'
      });
    }

    setExecutedActions(prev => ({ ...prev, [action.id]: true }));
    if (onActionTriggered) {
      onActionTriggered(`Executed: ${action.title}`);
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear chat history with PupLume?')) {
      const reset = [
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant' as const,
          text: `Chat reset. I'm ready to help with ${puppy.name}'s training, schedule, or potty rhythm!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(reset);
      storage.saveAIMessages(reset);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-120px)] max-w-4xl mx-auto">
      

            {/* Sleek Professional Chat Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E8DDD3] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#8B5E3C]/20 to-[#8B5E3C]/5 border border-[#8B5E3C]/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#8B5E3C]" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-[#2C211B] flex items-center gap-2 leading-none">
              PupLume AI
              <span className="text-[9px] font-bold uppercase tracking-wider bg-[#F3E7DA] text-[#5F3E29] px-1.5 py-0.5 rounded-sm">
                Context: {puppy.name}
              </span>
            </h2>
            <span className="text-[10px] text-[#766A63] flex items-center gap-1 mt-1 leading-none" title="PupLume provides educational advice. Always consult a vet for medical emergencies.">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Veterinary safety guardrails active
            </span>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 text-[#766A63] hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
          title="Clear chat history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-1 space-y-3.5 pr-2">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center my-auto min-h-[320px]">
            <div className="w-14 h-14 rounded-3xl bg-[#FFF9F2] border-2 border-[#E8DDD3] flex items-center justify-center text-[#8B5E3C] mb-3 shadow-xs">
              <PupLumeLogo variant="icon" size="md" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#2C211B] mb-1">
              PupLume AI Coach for {puppy.name}
            </h3>
            <p className="text-xs text-[#766A63] max-w-sm mb-5 leading-relaxed">
              Ask any puppy question, generate personalized training drills, or log routines with veterinary safety guardrails.
            </p>

            {/* Quick Starter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-md text-left">
              {[
                { icon: '🚽', title: 'Potty Schedule', query: `When should ${puppy.name} go out for potty next?` },
                { icon: '🦷', title: 'Teething & Mouthing', query: `How do I stop ${puppy.name} from nipping hands?` },
                { icon: '🌙', title: 'Crate & Sleep', query: `Why won't ${puppy.name} settle in the crate at night?` },
                { icon: '📋', title: 'Daily Routine', query: `Create a custom daily schedule for ${puppy.name}.` },
              ].map((card) => (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => handleSend(card.query)}
                  className="p-3 rounded-2xl border border-[#E8DDD3] bg-white hover:bg-[#FFF9F2] hover:border-[#8B5E3C]/40 text-left transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{card.icon}</span>
                    <span className="text-xs font-bold text-[#2C211B] group-hover:text-[#8B5E3C] transition-colors">{card.title}</span>
                  </div>
                  <p className="text-[11px] text-[#766A63] line-clamp-1">{card.query}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-[#FFF9F2] border border-[#E8DDD3] flex items-center justify-center text-[#8B5E3C] flex-shrink-0 shadow-xs">
                <PupLumeLogo variant="icon" size="sm" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-[#8B5E3C] text-white rounded-tr-xs'
                  : 'bg-white border border-[#E8DDD3] text-[#2C211B] rounded-tl-xs'
              }`}
            >
              <div className="prose prose-sm max-w-none text-current prose-p:my-2 prose-ul:my-2 prose-strong:font-bold prose-strong:text-current leading-relaxed"><ReactMarkdown>{msg.text}</ReactMarkdown></div>

              {/* Action Proposal Cards */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-[#E8DDD3] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Proposed Action
                  </span>

                  {msg.suggestedActions.map((action) => {
                    const isDone = executedActions[action.id];
                    return (
                      <div
                        key={action.id}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                          isDone
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-[#FFF9F2] border-[#8B5E3C]/30 text-[#2C211B]'
                        }`}
                      >
                        <div>
                          <h5 className="text-xs font-bold flex items-center gap-1.5">
                            {action.title}
                          </h5>
                          <p className="text-[11px] text-[#766A63] mt-0.5">{action.summary}</p>
                        </div>

                        {isDone ? (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Added to PupLume
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleExecuteAction(action)}
                            className="text-xs"
                          >
                            Confirm Action
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <span
                className={`text-[10px] mt-1.5 block text-right ${
                  msg.sender === 'user' ? 'text-white/70' : 'text-[#766A63]'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === 'user' && (
              user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName || 'User'}
                  className="w-8 h-8 rounded-xl object-cover border border-[#E8DDD3] shadow-xs shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-[#5F3E29] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user?.firstName ? user.firstName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
              )
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[#766A63] p-2">
            <PupLumeLogo variant="icon" size="sm" />
            <span className="animate-pulse font-medium">PupLume is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts Pills */}
      <div className="py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 flex-nowrap">
        {starterPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#FFF9F2] hover:bg-[#F3E7DA] text-[#5F3E29] border border-[#E8DDD3] whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center gap-2 mt-1"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask anything about ${puppy.name}... (e.g. "Create potty plan", "Why is ${puppy.name} biting?")`}
          className="w-full pl-4 pr-12 py-3 rounded-2xl border border-[#E8DDD3] bg-white text-sm text-[#2C211B] shadow-xs focus:outline-none focus:border-[#8B5E3C]"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute right-2 p-2 rounded-xl bg-[#8B5E3C] hover:bg-[#5F3E29] disabled:opacity-40 text-white transition-colors cursor-pointer"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
