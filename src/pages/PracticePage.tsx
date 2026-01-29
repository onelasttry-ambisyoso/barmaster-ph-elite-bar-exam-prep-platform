import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { diffWordsWithSpace } from 'diff';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TypingArea } from '@/components/ui/typing-area';
import { cn } from '@/lib/utils';
import type { CodalProvision } from '@shared/types';
import confetti from 'canvas-confetti';
export default function PracticePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [typed, setTyped] = useState('');
  const [isChecking, setIsChecking] = useState(false);
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
    setIsChecking(true);
    if (typed.trim().toLowerCase() === current?.content.trim().toLowerCase()) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };
  const submitGrade = (grade: number) => {
    if (!current) return;
    reviewMutation.mutate({ codalId: current.id, grade });
  };
  if (isLoading) return <div className="p-12 text-center">Loading provisions...</div>;
  if (!current) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <h2 className="text-2xl font-bold">Queue Empty!</h2>
      <p className="text-muted-foreground">You are all caught up with your reviews.</p>
      <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
    </div>
  );
  const diffResult = isChecking ? diffWordsWithSpace(current.content, typed) : [];
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Exit Session
      </Button>
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">{current.subject}</span>
        <h1 className="text-3xl font-serif font-bold">{current.title}</h1>
        <p className="text-muted-foreground">{current.reference}</p>
      </div>
      <Card className="p-1 bg-secondary/20">
        {!isChecking ? (
          <TypingArea
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Type the provision exactly..."
            autoFocus
          />
        ) : (
          <div className="p-6 font-mono text-lg leading-relaxed whitespace-pre-wrap min-h-[200px] bg-background rounded-lg border">
            {diffResult.map((part, i) => (
              <span
                key={i}
                className={cn(
                  part.added ? "bg-red-500/20 text-red-700 line-through" : 
                  part.removed ? "bg-green-500/20 text-green-700 font-bold underline" : ""
                )}
              >
                {part.value}
              </span>
            ))}
          </div>
        )}
      </Card>
      <div className="flex justify-between items-center">
        {!isChecking ? (
          <Button size="lg" className="w-full md:w-auto px-12" onClick={handleCheck}>
            Verify Recall (Enter)
          </Button>
        ) : (
          <div className="w-full space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button variant="destructive" onClick={() => submitGrade(1)}>Again (0%)</Button>
              <Button variant="outline" className="border-orange-200" onClick={() => submitGrade(2)}>Hard (50%)</Button>
              <Button variant="outline" className="border-blue-200" onClick={() => submitGrade(4)}>Good (90%)</Button>
              <Button variant="secondary" className="bg-green-100 hover:bg-green-200" onClick={() => submitGrade(5)}>Easy (100%)</Button>
            </div>
            <p className="text-center text-sm text-muted-foreground italic">Self-grade your recall based on accuracy.</p>
          </div>
        )}
      </div>
    </div>
  );
}