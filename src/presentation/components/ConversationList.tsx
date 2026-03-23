/**
 * ConversationList 组件
 *
 * 会话列表，显示会话列表和未读数
 */

interface Conversation {
  id: string;
  name: string;
  lastMessage?: string;
  unreadCount?: number;
  isPinned?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  onSelect?: (id: string) => void;
  selectedId?: string | null;
}

export function ConversationList({
  conversations,
  onSelect,
  selectedId,
}: ConversationListProps) {
  const sortedConversations = [...conversations].sort((a, b) => {
    // 置顶优先
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col h-full bg-slate-800 border-r border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-slate-100">会话</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelect?.(conversation.id)}
            className={`w-full p-4 text-left border-b border-slate-700 transition-colors ${
              selectedId === conversation.id
                ? 'bg-slate-700'
                : 'hover:bg-slate-700/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {conversation.isPinned && (
                    <span className="text-cyan-400">📌</span>
                  )}
                  <span className="font-medium text-slate-100 truncate">
                    {conversation.name}
                  </span>
                </div>
                {conversation.lastMessage && (
                  <p className="text-sm text-slate-400 truncate mt-1">
                    {conversation.lastMessage}
                  </p>
                )}
              </div>
              {conversation.unreadCount && conversation.unreadCount > 0 ? (
                <span className="ml-2 px-2 py-0.5 bg-cyan-600 text-white text-xs rounded-full">
                  {conversation.unreadCount}
                </span>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
