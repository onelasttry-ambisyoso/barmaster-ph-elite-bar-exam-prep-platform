import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Sparkles, GraduationCap, Flame, Calendar, BookOpen } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { DashboardStats } from '@shared/types';
export function HomePage() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: () => api('/api/dashboard')
  });
  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">BarMaster.PH</h1>
            <p className="text-muted-foreground">Welcome back, Counselor.</p>
          </div>
          <ThemeToggle className="relative top-0 right-0" />
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Due for Review</CardTitle>
              <GraduationCap className="h-4 w-4 opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.dueCount || 0}</div>
              <p className="text-xs opacity-70">Provisions waiting for recall</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.streak || 0} days</div>
              <p className="text-xs text-muted-foreground">Consistency is key</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Mastered</CardTitle>
              <BookOpen className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalMastered || 0}</div>
              <p className="text-xs text-muted-foreground">Long-term retention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Exam Countdown</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.nextExamDays || 0} days</div>
              <p className="text-xs text-muted-foreground">Until September 2026</p>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col items-center justify-center space-y-4 py-12 bg-accent/30 rounded-3xl border border-dashed">
          <Sparkles className="h-12 w-12 text-primary animate-pulse" />
          <div className="text-center">
            <h2 className="text-2xl font-bold">Ready for active recall?</h2>
            <p className="text-muted-foreground max-w-md mx-auto mt-2">
              Typing out provisions exactly as they appear in the codals is the fastest way to legal mastery.
            </p>
          </div>
          <Button size="lg" onClick={() => navigate('/practice')} className="px-12 py-6 text-lg">
            Start Review Session
          </Button>
        </div>
      </div>
    </div>
  );
}