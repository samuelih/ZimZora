import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Lightbulb, TrendingUp, Settings } from 'lucide-react';
import { AgentInstance } from '../../types/agents';
import { agentDefinitions, useAgentStore } from '../../store/agentStore';
import { AgentAvatar } from './AgentAvatar';
import { AgentChatInterface } from './AgentChatInterface';
import { AgentInsightCard } from './AgentInsightCard';
import { AgentSuggestionCard } from './AgentSuggestionCard';
import { cn } from '../../utils/helpers';

interface AgentPanelProps {
  instance: AgentInstance;
  onClose: () => void;
  className?: string;
}

type TabType = 'chat' | 'insights' | 'suggestions';

export function AgentPanel({ instance, onClose, className }: AgentPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const agent = agentDefinitions[instance.agent.id];

  const {
    dismissInsight,
    applySuggestion,
    dismissSuggestion,
  } = useAgentStore();

  const activeInsights = instance.insights.filter((i) => !i.dismissed);
  const activeSuggestions = instance.suggestions.filter((s) => !s.dismissed && !s.applied);

  const tabs = [
    { id: 'chat' as TabType, label: 'Chat', icon: MessageCircle, count: 0 },
    { id: 'insights' as TabType, label: 'Insights', icon: TrendingUp, count: activeInsights.length },
    { id: 'suggestions' as TabType, label: 'Suggestions', icon: Lightbulb, count: activeSuggestions.length },
  ];

  return (
    <motion.div
      className={cn(
        'flex flex-col h-full bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden',
        className
      )}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-slate-700"
        style={{
          background: `linear-gradient(135deg, ${agent.color}15, transparent)`,
        }}
      >
        <div className="flex items-center gap-3">
          <AgentAvatar
            agentId={instance.agent.id}
            status={instance.status}
            color={agent.color}
            size="md"
          />
          <div>
            <h3 className="font-semibold text-white">{agent.name}</h3>
            <p className="text-xs text-slate-400">{agent.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Agent settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative',
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={cn(
                    'min-w-[18px] h-[18px] px-1 rounded-full text-xs flex items-center justify-center',
                    isActive ? 'bg-white/20' : 'bg-slate-600'
                  )}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: agent.color }}
                  layoutId="activeTab"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <AgentChatInterface instance={instance} />
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto p-4 space-y-3"
            >
              {activeInsights.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <TrendingUp className="w-12 h-12 text-slate-600 mb-4" />
                  <h4 className="text-lg font-medium text-white mb-2">No insights yet</h4>
                  <p className="text-sm text-slate-400 max-w-xs">
                    Upload an image and I'll analyze it to provide helpful insights about
                    composition, colors, and style.
                  </p>
                </div>
              ) : (
                activeInsights.map((insight) => (
                  <AgentInsightCard
                    key={insight.id}
                    insight={insight}
                    onDismiss={() => dismissInsight(instance.agent.id, insight.id)}
                  />
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'suggestions' && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto p-4 space-y-3"
            >
              {activeSuggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Lightbulb className="w-12 h-12 text-slate-600 mb-4" />
                  <h4 className="text-lg font-medium text-white mb-2">No suggestions yet</h4>
                  <p className="text-sm text-slate-400 max-w-xs">
                    As you build your composition, I'll suggest ways to improve
                    and optimize your configuration.
                  </p>
                </div>
              ) : (
                activeSuggestions.map((suggestion) => (
                  <AgentSuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onApply={() => applySuggestion(instance.agent.id, suggestion.id)}
                    onDismiss={() => dismissSuggestion(instance.agent.id, suggestion.id)}
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
