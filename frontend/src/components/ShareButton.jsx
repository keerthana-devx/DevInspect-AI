import React, { useState } from 'react';
import { Share2, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { API_ORIGIN } from '@/lib/apiConfig';

const ShareButton = ({ analysisId }) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!analysisId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('devinspect-token');
      const res = await fetch(`${API_ORIGIN}/api/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ analysisId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const fullUrl = `${window.location.origin}/shared/${data.token}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast.error(err.message || 'Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={loading || !analysisId}
      className="h-9 rounded-xl border-border/30 text-xs font-bold gap-1.5"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : copied ? (
        <Check className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <Share2 className="w-3.5 h-3.5" />
      )}
      {copied ? 'Copied!' : 'Share'}
    </Button>
  );
};

export default ShareButton;
