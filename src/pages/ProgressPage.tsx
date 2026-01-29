import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, Brain, CheckSquare, Target } from 'lucide-react';
interface AnalyticsData {
  masteryData: { subject: string; mastered: number; total: number; percentage: number }[];
  retentionRate: number;
  heatmap: { date: string; count: number }[];
  totalReviews: number;
}
export function ProgressPage() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: () => api('/api/analytics')
  });
  if (isLoading) return <div className="flex items-center justify-center min-h-screen font-serif italic text-lg">Reviewing Progress...</div>;
  const colors = ['#0f172a', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#f1f5f9'];
  return (
    <AppLayout container>
      <div className="space-y-10">
        <header>
          <h1 className="text-5xl font-black tracking-tighter">Performance Metrics</h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium">Your progress toward legal mastery, quantified.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" /> Retention Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{analytics?.retentionRate}%</div>
              <p className="text-[10px] text-muted-foreground mt-1">Memory decay probability low</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" /> Total Recall Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{analytics?.totalReviews}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Active recall iterations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-500" /> Mastered Provisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">
                {analytics?.masteryData.reduce((acc, curr) => acc + curr.mastered, 0)}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Permanent knowledge bank</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" /> 30D Intensity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">
                {Math.round((analytics?.totalReviews || 0) / 30)}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Avg sessions per day</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Mastery by Subject</CardTitle>
              <CardDescription>Percentage of codal provisions mastered per Bar subject area.</CardDescription>
            </CardHeader>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.masteryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="subject" 
                    type="category" 
                    width={120} 
                    fontSize={10} 
                    fontWeight="bold"
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={24}>
                    {analytics?.masteryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Consistency Heatmap</CardTitle>
              <CardDescription>Review intensity over the last 30 days.</CardDescription>
            </CardHeader>
            <div className="mt-8">
               <div className="flex flex-wrap gap-2 justify-center">
                  {analytics?.heatmap.map((day, i) => (
                    <div 
                      key={day.date} 
                      className="group relative h-8 w-8 rounded-md border"
                      style={{ 
                        backgroundColor: day.count > 0 
                          ? `rgba(15, 23, 42, ${Math.min(0.1 + day.count * 0.2, 1)})` 
                          : 'transparent' 
                      }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50">
                        {new Date(day.date).toLocaleDateString()}: {day.count} reviews
                      </div>
                    </div>
                  ))}
               </div>
               <div className="mt-8 grid grid-cols-2 gap-4">
                 <div className="p-4 bg-muted/30 rounded-2xl">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Peak Performance</h4>
                    <p className="text-lg font-black">{Math.max(...(analytics?.heatmap.map(d => d.count) || [0]))} Reviews</p>
                 </div>
                 <div className="p-4 bg-muted/30 rounded-2xl">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1">Status</h4>
                    <p className="text-lg font-black">Highly Retained</p>
                 </div>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}