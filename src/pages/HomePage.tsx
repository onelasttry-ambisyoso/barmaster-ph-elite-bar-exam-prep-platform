import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Sparkles, GraduationCap, Flame, Calendar, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import type { DashboardStats } from '@shared/types';
import { Badge } from '@/components/ui/badge';
export function HomePage() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: () => api('/api/dashboard')
  });
  if (isLoading) return <div className="flex items-center justify-center min-h-screen font-serif italic text-lg">Preparing Docket...</div>;
  return (
    <AppLayout container>
      <div className="space-y-10">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Active Session
          </div>
          <h1 className="text-5xl font-black tracking-tighter">Welcome back, Counselor.</h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium">Your daily review is ready. Consistent active recall is the path to the 2026 Bar Exam.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none bg-primary text-primary-foreground shadow-2xl shadow-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80">Due Today</CardTitle>
              <GraduationCap className="h-5 w-5 opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">{stats?.dueCount || 0}</div>
              <p className="text-xs opacity-60 mt-1">Legal provisions for recall</p>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Study Streak</CardTitle>
              <Flame className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">{stats?.streak || 0} Days</div>
              <p className="text-xs text-muted-foreground mt-1">Peak consistency</p>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Mastered</CardTitle>
              <BookOpen className="h-5 w-5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">{stats?.totalMastered || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Permanent retention</p>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Bar Exam</CardTitle>
              <Calendar className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">{stats?.nextExamDays || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Days to September 2026</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 relative overflow-hidden flex flex-col items-center justify-center p-12 bg-gradient-mesh border border-white/20 rounded-[3rem] shadow-inner min-h-[400px]">
            <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-sm -z-10" />
            <div className="text-center space-y-6 max-w-md">
              <div className="mx-auto w-16 h-16 bg-white shadow-xl rounded-2xl flex items-center justify-center rotate-3">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">Arena Awaits</h2>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  The most efficient way to learn legal text is by writing it. Start your spaced-repetition session now.
                </p>
              </div>
              <Button size="lg" onClick={() => navigate('/practice')} className="h-16 px-12 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Enter Practice Arena
              </Button>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Recently Studied
            </h3>
            <div className="space-y-3">
              {[
                { title: 'Art. III, Sec 1 (Constitution)', time: '2h ago', status: 'Mastered' },
                { title: 'Art. 2 (Civil Code)', time: 'Yesterday', status: 'Reviewing' },
                { title: 'Art. 1 (RPC)', time: '3d ago', status: 'Needs Review' }
              ].map((item, i) => (
                <Card key={i} className="group cursor-pointer hover:bg-accent transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm group-hover:text-primary transition-colors">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{item.time}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold">{item.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button variant="ghost" className="w-full justify-between font-bold text-sm h-12 hover:bg-accent" onClick={() => navigate('/subjects')}>
              Browse Full Library <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}