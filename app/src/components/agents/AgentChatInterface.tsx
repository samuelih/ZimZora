import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, Image, Palette, Sliders } from 'lucide-react';
import { AgentInstance, ChatMessage, QuickReply, AgentId } from '../../types/agents';
import { agentDefinitions, useAgentStore } from '../../store/agentStore';
import { AgentAvatar } from './AgentAvatar';
import { cn } from '../../utils/helpers';

interface AgentChatInterfaceProps {
  instance: AgentInstance;
  className?: string;
}

// Agent-specific quick replies
const agentQuickReplies: Record<AgentId, QuickReply[]> = {
  scout: [
    { label: 'Find similar styles', value: 'find_styles', icon: 'palette' },
    { label: 'Search references', value: 'search', icon: 'search' },
    { label: 'Trending looks', value: 'trending', icon: 'sparkles' },
    { label: 'What can you find?', value: 'help', icon: 'help' },
  ],
  analyst: [
    { label: 'Analyze my image', value: 'analyze', icon: 'image' },
    { label: 'Extract colors', value: 'colors', icon: 'palette' },
    { label: 'Check composition', value: 'composition', icon: 'grid' },
    { label: 'What can you do?', value: 'help', icon: 'help' },
  ],
  composer: [
    { label: 'Optimize settings', value: 'optimize', icon: 'sliders' },
    { label: 'Check conflicts', value: 'conflicts', icon: 'alert' },
    { label: 'Balance references', value: 'balance', icon: 'scale' },
    { label: 'What can you do?', value: 'help', icon: 'help' },
  ],
  generator: [
    { label: 'Start generation', value: 'generate', icon: 'zap' },
    { label: 'Preview result', value: 'preview', icon: 'eye' },
    { label: 'Create variations', value: 'variations', icon: 'copy' },
    { label: 'What can you do?', value: 'help', icon: 'help' },
  ],
  critic: [
    { label: 'Review my work', value: 'review', icon: 'check' },
    { label: 'Suggest improvements', value: 'improve', icon: 'sparkles' },
    { label: 'Compare versions', value: 'compare', icon: 'diff' },
    { label: 'What can you do?', value: 'help', icon: 'help' },
  ],
};

// Contextual responses based on agent and user input
const generateResponse = (agentId: AgentId, userMessage: string): string => {
  const agent = agentDefinitions[agentId];
  const lowerMessage = userMessage.toLowerCase();

  // Agent-specific response logic
  const responses: Record<AgentId, Record<string, string>> = {
    scout: {
      help: `I'm your reference hunting companion! I can search for images that match your style, find trending aesthetics, and discover hidden gems that'll take your composition to the next level. What kind of vibe are you going for?`,
      find_styles: `I'd love to find similar styles for you! Upload your base image first, and I'll search through millions of references to find the perfect matches. Do you want something bold and dramatic, or subtle and refined?`,
      search: `Ready to explore! Tell me what you're looking for - a specific mood, color palette, or artistic style - and I'll scout the best references for your project.`,
      trending: `Here's what's hot right now: cinematic color grading, ethereal soft lighting, and bold geometric compositions. Want me to find some examples in any of these styles?`,
      default: `Interesting! As your Scout, I'm always on the lookout for the perfect references. ${agent.capabilities[0]} is my specialty. What direction should we explore?`,
    },
    analyst: {
      help: `I'm the Analyst - I see what others miss! I can break down any image into its core components: colors, composition, lighting, and style. Upload an image and I'll give you a complete technical breakdown.`,
      analyze: `I'm ready to analyze! Upload your image and I'll examine its color harmony, composition balance, lighting quality, and artistic style. You'll get actionable insights in seconds.`,
      colors: `Color extraction is my favorite! I can pull the exact palette from any image, identify the color harmony type, and suggest complementary colors. Just show me what you're working with.`,
      composition: `Let's talk composition! I'll analyze the rule of thirds, visual weight distribution, leading lines, and focal points. Good composition is the backbone of any great image.`,
      default: `Great question! I specialize in ${agent.capabilities.slice(0, 2).join(' and ')}. Upload an image and I'll give you detailed insights that'll help perfect your generation.`,
    },
    composer: {
      help: `I'm your composition orchestrator! I make sure all your references play nicely together. I detect conflicts, optimize strengths, and ensure your final result is harmonious. Let me see your current setup!`,
      optimize: `Ready to optimize! I'll analyze your current reference configuration and suggest the perfect strength values for each one. Balance is key to a cohesive result.`,
      conflicts: `Conflict detection mode activated! I'll check if any of your references are fighting each other - like mixing warm and cool color references, or conflicting style directions.`,
      balance: `Let's balance your composition! I'll look at how each reference contributes to the final result and adjust their influence to create perfect harmony.`,
      default: `Harmony is my mission! I see you're curious about ${userMessage.slice(0, 30)}... I can help by ${agent.capabilities[0].toLowerCase()}. What would you like me to focus on?`,
    },
    generator: {
      help: `I'm the Generator - I bring your vision to life! I orchestrate the entire generation process, provide real-time progress updates, and can create variations of any result. Ready when you are!`,
      generate: `Let's create something amazing! Make sure you have a base image and at least one reference, then I'll guide you through the generation with detailed progress updates.`,
      preview: `I can generate a quick preview to show you what the final result might look like. It's a great way to iterate fast before committing to a full generation.`,
      variations: `Variations are fantastic for exploration! After a generation, I can create multiple alternatives with slight tweaks to help you find the perfect version.`,
      default: `Exciting! I'm all about ${agent.capabilities[0].toLowerCase()}. Once your composition is ready, I'll handle the generation with precision and keep you updated every step of the way.`,
    },
    critic: {
      help: `I'm the Critic - but the constructive kind! I evaluate your results objectively, highlight what's working, and suggest specific improvements. Think of me as your honest creative partner.`,
      review: `I'd be happy to review your work! I'll look at technical quality, artistic coherence, and how well it matches your original intent. Honest feedback is the path to improvement.`,
      improve: `Let me analyze what we can enhance! I'll identify specific areas that could be stronger and give you actionable suggestions to take your result to the next level.`,
      compare: `Comparison is powerful! If you have multiple versions, I can do a detailed A/B analysis to help you understand the strengths and weaknesses of each approach.`,
      default: `Good observation about "${userMessage.slice(0, 30)}"! As your Critic, I focus on ${agent.capabilities[0].toLowerCase()}. Share your result and I'll give you thoughtful, actionable feedback.`,
    },
  };

  // Find matching response
  const agentResponses = responses[agentId];
  for (const [key, response] of Object.entries(agentResponses)) {
    if (key !== 'default' && lowerMessage.includes(key)) {
      return response;
    }
  }

  // Check for common patterns
  if (lowerMessage.includes('help') || lowerMessage.includes('what can')) {
    return agentResponses.help;
  }

  return agentResponses.default;
};

function TypingIndicator({ color }: { color: string }) {
  return (
    <div className="flex gap-1.5 py-2 px-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            y: [0, -6, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function ChatMessageBubble({
  message,
  agentColor,
  agentId,
}: {
  message: ChatMessage;
  agentColor: string;
  agentId: AgentId;
}) {
  const isAgent = message.sender === 'agent';

  return (
    <motion.div
      className={cn('flex gap-3 max-w-full', !isAgent && 'flex-row-reverse')}
      initial={{ opacity: 0, y: 10, x: isAgent ? -10 : 10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {isAgent && (
        <motion.div
          className="flex-shrink-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
        >
          <AgentAvatar
            agentId={agentId}
            status="idle"
            color={agentColor}
            size="sm"
            showStatus={false}
          />
        </motion.div>
      )}

      <motion.div
        className={cn(
          'max-w-[85%] px-4 py-3 rounded-2xl',
          isAgent
            ? 'bg-slate-700/80 text-white rounded-tl-sm'
            : 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-tr-sm'
        )}
        style={isAgent ? { borderLeft: `3px solid ${agentColor}` } : {}}
        whileHover={{ scale: 1.01 }}
      >
        {message.typing ? (
          <TypingIndicator color={agentColor} />
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        )}
      </motion.div>

      {!isAgent && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <span className="text-white text-xs font-bold">You</span>
        </div>
      )}
    </motion.div>
  );
}

function QuickReplyButton({ reply, onClick, color }: { reply: QuickReply; onClick: () => void; color: string }) {
  return (
    <motion.button
      onClick={onClick}
      className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 text-sm rounded-full transition-all border border-slate-600/50 hover:border-slate-500/50"
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      style={{
        boxShadow: `0 2px 10px ${color}10`,
      }}
    >
      {reply.label}
    </motion.button>
  );
}

export function AgentChatInterface({ instance, className }: AgentChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { addChatMessage } = useAgentStore();
  const agent = agentDefinitions[instance.agent.id];
  const quickReplies = agentQuickReplies[instance.agent.id];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [instance.chatHistory]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue;
    setInputValue('');

    // Add user message
    addChatMessage(instance.agent.id, {
      sender: 'user',
      content: userMessage,
    });

    // Show typing indicator
    setIsTyping(true);
    const typingId = addChatMessage(instance.agent.id, {
      sender: 'agent',
      agentId: instance.agent.id,
      content: '',
      typing: true,
    });

    // Simulate thinking time (varies by message length and complexity)
    const thinkTime = Math.min(800 + Math.random() * 1200 + userMessage.length * 10, 2500);
    await new Promise((resolve) => setTimeout(resolve, thinkTime));

    setIsTyping(false);

    // Generate contextual response
    const response = generateResponse(instance.agent.id, userMessage);

    // Update the typing message with actual content
    useAgentStore.setState((state) => ({
      agents: {
        ...state.agents,
        [instance.agent.id]: {
          ...state.agents[instance.agent.id],
          chatHistory: state.agents[instance.agent.id].chatHistory.map((msg) =>
            msg.id === typingId
              ? { ...msg, content: response, typing: false }
              : msg
          ),
        },
      },
    }));
  };

  const handleQuickReply = (reply: QuickReply) => {
    setInputValue(reply.label);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome message if no history */}
        {instance.chatHistory.length === 0 && (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
            >
              <AgentAvatar
                agentId={instance.agent.id}
                status={instance.status}
                color={agent.color}
                size="lg"
                className="mx-auto mb-4"
              />
            </motion.div>
            <motion.h3
              className="text-xl font-bold text-white mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Hi, I'm {agent.name}!
            </motion.h3>
            <motion.p
              className="text-sm text-slate-400 max-w-sm mx-auto mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {agent.description}
            </motion.p>

            {/* Capabilities */}
            <motion.div
              className="flex flex-wrap justify-center gap-2 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {agent.capabilities.map((cap, i) => (
                <span
                  key={cap}
                  className="px-3 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full"
                  style={{ borderLeft: `2px solid ${agent.color}` }}
                >
                  {cap}
                </span>
              ))}
            </motion.div>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {instance.chatHistory.map((message) => (
            <ChatMessageBubble
              key={message.id}
              message={message}
              agentColor={agent.color}
              agentId={instance.agent.id}
            />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      {instance.chatHistory.length === 0 && (
        <motion.div
          className="px-4 pb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-xs text-slate-500 mb-2 text-center">Quick actions</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {quickReplies.map((reply, index) => (
              <motion.div
                key={reply.value}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.05 }}
              >
                <QuickReplyButton
                  reply={reply}
                  onClick={() => handleQuickReply(reply)}
                  color={agent.color}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 bg-slate-700/50 rounded-2xl px-4 py-2 border border-slate-600/30 focus-within:border-slate-500/50 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${agent.name}...`}
            className="flex-1 bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
            disabled={isTyping}
          />

          <motion.button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className={cn(
              'p-2.5 rounded-xl transition-all',
              inputValue.trim() && !isTyping
                ? 'text-white shadow-lg'
                : 'text-slate-500'
            )}
            style={{
              background: inputValue.trim() && !isTyping
                ? `linear-gradient(135deg, ${agent.color}, ${agent.color}cc)`
                : undefined,
            }}
            whileHover={inputValue.trim() && !isTyping ? { scale: 1.05 } : {}}
            whileTap={inputValue.trim() && !isTyping ? { scale: 0.95 } : {}}
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
