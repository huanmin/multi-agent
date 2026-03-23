/**
 * ExpertCard 组件
 *
 * 专家卡片，显示专家信息
 */

interface ExpertCardProps {
  expert: {
    id: string;
    name: string;
    avatar?: string;
    description?: string;
    tags?: string[];
  };
  onDoubleClick?: (id: string) => void;
}

export function ExpertCard({ expert, onDoubleClick }: ExpertCardProps) {
  return (
    <div
      onDoubleClick={() => onDoubleClick?.(expert.id)}
      className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
          {expert.avatar ? (
            <img
              src={expert.avatar}
              alt={expert.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            expert.name.charAt(0)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-100 truncate">{expert.name}</h3>
          {expert.description && (
            <p className="text-sm text-slate-400 mt-0.5 line-clamp-2">
              {expert.description}
            </p>
          )}
          {expert.tags && expert.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {expert.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
