import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { diffWordsWithSpace } from 'diff';
import { ArrowLeft, CheckCircle2, XCircle, Keyboard, Eye, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TypingArea } from '@/components/ui/typing-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CodalProvision } from '@shared/types';
import confetti from 'canvas-confetti';
import { useHotkeys } from 'react-hotkeys-hook';
export default function PracticePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [typed, setTyped] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const typingRef = useRef<HTMLTextAreaElement>(null);
  const { data: queue, isLoading } = useQuery<CodalProvision[]>({
    queryKey: ['practice-queue'],
    queryFn: () => api('/api/practice/queue')
  });
  const reviewMutation = useMutation({
    mutationFn: (data: { codalId: string; grade: number }) => api('/api/review', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-queue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setTyped('');
      setIsChecking(false);
    }
  });
  const current = queue?.[0];
  const handleCheck = () => {
    if (!typed.trim()) return;
    setIsChecking(true);
    if (typed.trim().toLowerCase() === current?.content.trim().toLowerCase()) {
      confetti({ 
        particleCount: 150, 
        spread: 80, 
        origin: { y: 0.7 }, 
        colors: ['#fbbf24', '#1e40af', '#ffffff'] 
      });
    }
  };
  const submitGrade = (grade: number) => {
    if (!current) return;
    reviewMutation.mutate({ codalId: current.id, grade });
  };
  const revealAnswer = () => {
    setIsChecking(true);
    setTyped(''); 
  };
  useHotkeys('enter', () => !isChecking && handleCheck(), { enableOnFormTags: true }, [isChecking]);
  useHotkeys('1', () => isChecking && submitGrade(1), {}, [isChecking]);
  useHotkeys('2', () => isChecking && submitGrade(2), {}, [isChecking]);
  useHotkeys('3', () => isChecking && submitGrade(4), {}, [isChecking]);
  useHotkeys('4', () => isChecking && submitGrade(5), {}, [isChecking]);
  useEffect(() => {
    if (!isChecking && typingRef.current) {
      typingRef.current.focus();
    }
  }, [isChecking, current]);
  if (isLoading) return <div className="flex h-screen items-center justify-center font-bold animate-pulse">Initializing Arena...</div>;
  if (!current) return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6 text-center px-4">
      <div className="bg-primary/10 p-6 rounded-full">
        <CheckCircle2 className="h-16 w-16 text-primary" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight">Docket Cleared!</h2>
        <p className="text-muted-foreground max-w-sm">Your memory is sharp. You've completed all due reviews for today.</p>
      </div>
      <Button size="lg" onClick={() => navigate('/')} className="px-10 rounded-full font-bold">
        Return to Chambers
      </Button>
    </div>
  );
  const diffResult = isChecking ? diffWordsWithSpace(current.content, typed) : [];
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/')} className="hover:bg-accent rounded-full text-muted-foreground font-bold">
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit
        </Button>
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-accent/50 px-3 py-1 rounded-full">
          <Keyboard className="h-3 w-3" /> Shortcuts Active
        </div>
      </div>
      <div className="space-y-3 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-baseline gap-2">
          <Badge variant="secondary" className="w-fit self-center md:self-auto font-black uppercase text-[10px] tracking-widest bg-primary/10 text-primary border-none">
            {current.subject}
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">{current.reference}</span>
        </div>
        <h1 className="text-4xl font-serif font-black leading-tight tracking-tight">{current.title}</h1>
      </div>
      <Card className="relative overflow-hidden border-2 shadow-lg bg-card ring-offset-background">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        {!isChecking ? (
          <TypingArea
            ref={typingRef}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Recall and type the provision verbatim..."
            className="border-none shadow-none focus-visible:ring-0 min-h-[250px] p-8 text-xl"
            autoFocus
          />
        ) : (
          <div className="p-8 font-mono text-xl leading-relaxed whitespace-pre-wrap min-h-[250px] bg-background selection:bg-primary selection:text-primary-foreground">
            {diffResult.map((part, i) => (
              <span
                key={i}
                className={cn(
                  part.added ? "bg-red-500/30 text-red-900 dark:text-red-100 line-through rounded-sm" :
                  part.removed ? "bg-green-500/30 text-green-900 dark:text-green-100 font-bold decoration-2 underline rounded-sm" : ""
                )}
              >
                {part.value}
              </span>
            ))}
            {typed === '' && <p className="text-muted-foreground/50 italic text-base">Provision revealed.</p>}
          </div>
        )}
      </Card>
      <div className="flex flex-col gap-6">
        {!isChecking ? (
          <div className="flex flex-col md:flex-row gap-4">
            <Button size="lg" className="flex-1 h-14 text-lg font-bold rounded-2xl shadow-primary/20 shadow-lg" onClick={handleCheck}>
              Verify Recall (Enter)
            </Button>
            <Button variant="outline" size="lg" className="h-14 font-bold rounded-2xl border-2" onClick={revealAnswer}>
              <Eye className="mr-2 h-5 w-5" /> Reveal
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center space-y-1">
                <h3 className="font-bold">Self-Grade Performance</h3>
                <p className="text-xs text-muted-foreground">Be honest—the algorithm works better with accurate feedback.</p>
             </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-16 border-2 border-red-200 hover:bg-red-50 flex flex-col gap-1 rounded-2xl" onClick={() => submitGrade(1)}>
                <span className="font-black text-red-600">Again</span>
                <span className="text-[10px] text-muted-foreground">Fail (1)</span>
              </Button>
              <Button variant="outline" className="h-16 border-2 border-orange-200 hover:bg-orange-50 flex flex-col gap-1 rounded-2xl" onClick={() => submitGrade(2)}>
                <span className="font-black text-orange-600">Hard</span>
                <span className="text-[10px] text-muted-foreground">Hesitant (2)</span>
              </Button>
              <Button variant="outline" className="h-16 border-2 border-blue-200 hover:bg-blue-50 flex flex-col gap-1 rounded-2xl" onClick={() => submitGrade(4)}>
                <span className="font-black text-blue-600">Good</span>
                <span className="text-[10px] text-muted-foreground">Correct (3)</span>
              </Button>
              <Button variant="outline" className="h-16 border-2 border-green-200 hover:bg-green-50 flex flex-col gap-1 rounded-2xl" onClick={() => submitGrade(5)}>
                <span className="font-black text-green-600">Easy</span>
                <span className="text-[10px] text-muted-foreground">Perfect (4)</span>
              </Button>
            </div>
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setIsChecking(false)}>
              <RefreshCw className="mr-2 h-4 w-4" /> Try typing again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}