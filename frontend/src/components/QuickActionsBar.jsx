import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, RefreshCw, RotateCcw, MessageSquare, Zap, BookOpen, Shield, TestTube, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { copyToClipboard, downloadTextFile } from '@/lib/downloadFile';
import ShareButton from '@/components/ShareButton';

/**
 * QuickActionsBar — compact toolbar injected below result header
 * Props: result, resultId, onRetry, onExplainDeeper, onAskFollowup, onConvert
 */
const QuickActionsBar = memo(({ result, resultId, onRetry, onAskFollowup }) => {
  if (!result) return null;

  const handleCopyFixed = async () => {
    if (!result.correctedCode) return toast.error('No fixed code available');
    await copyToClipboard(result.correctedCode);
    toast.success('Fixed code copied!');
  };

  const handleExportMd = () => {
    const md = `# DevInspectAI Review\n**Score:** ${result.aiScore}/100 | **Mode:** ${result.mode} | **Lang:** ${result.language}\n\n## Summary\n${result.explanation}\n\n## Issues (${result.errors?.length || 0})\n${(result.errors || []).map((e, i) => `${i + 1}. [${e.severity}] ${e.message}`).join('\n')}\n\n## Fixed Code\n\`\`\`${result.language}\n${result.correctedCode}\n\`\`\``;
    downloadTextFile(md, `review_${Date.now()}.md`);
    toast.success('Markdown exported!');
  };

  const actions = [
    { icon: Copy,        label: 'Copy Fix',   onClick: handleCopyFixed,  show: !!result.correctedCode },
    { icon: Download,    label: 'Export MD',  onClick: handleExportMd,   show: true },
    { icon: RefreshCw,   label: 'Retry',      onClick: onRetry,          show: !!onRetry },
    { icon: MessageSquare, label: 'Ask AI',   onClick: onAskFollowup,    show: !!onAskFollowup },
  ].filter(a => a.show);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1.5 flex-wrap"
    >
      {actions.map(({ icon: Icon, label, onClick }) => (
        <button key={label} onClick={onClick} title={label}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-muted/50 hover:bg-muted border border-border/20 text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95">
          <Icon className="w-3 h-3" />
          {label}
        </button>
      ))}
      <ShareButton analysisId={resultId} />
    </motion.div>
  );
});

QuickActionsBar.displayName = 'QuickActionsBar';
export default QuickActionsBar;
