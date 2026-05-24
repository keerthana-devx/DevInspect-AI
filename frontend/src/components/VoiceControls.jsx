import React from 'react';
import { Volume2, Square, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import useVoiceExplain from '@/hooks/useVoiceExplain';

const VoiceControls = ({ text }) => {
  const { t } = useTranslation();
  const { speak, pause, resume, stop, state, isSupported } = useVoiceExplain();

  if (!isSupported || !text) return null;

  return (
    <div className="flex items-center gap-2 mt-3 flex-wrap">
      {state === 'idle' && (
        <Button size="sm" variant="outline" onClick={() => speak(text)}
          className="h-7 px-3 text-xs rounded-xl border-primary/30 text-primary hover:bg-primary/10 gap-1.5">
          <Volume2 className="w-3 h-3" /> {t('analyzer.explainVoice')}
        </Button>
      )}
      {state === 'speaking' && (
        <>
          <Button size="sm" variant="outline" onClick={pause}
            className="h-7 px-3 text-xs rounded-xl border-amber-500/30 text-amber-500 hover:bg-amber-500/10 gap-1.5">
            <Pause className="w-3 h-3" /> {t('analyzer.pauseVoice')}
          </Button>
          <Button size="sm" variant="outline" onClick={stop}
            className="h-7 px-3 text-xs rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5">
            <Square className="w-3 h-3" /> {t('analyzer.stopVoice')}
          </Button>
        </>
      )}
      {state === 'paused' && (
        <>
          <Button size="sm" variant="outline" onClick={resume}
            className="h-7 px-3 text-xs rounded-xl border-primary/30 text-primary hover:bg-primary/10 gap-1.5">
            <Play className="w-3 h-3" /> {t('analyzer.resumeVoice')}
          </Button>
          <Button size="sm" variant="outline" onClick={stop}
            className="h-7 px-3 text-xs rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5">
            <Square className="w-3 h-3" /> {t('analyzer.stopVoice')}
          </Button>
        </>
      )}
    </div>
  );
};

export default VoiceControls;
