import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, TrendingUp, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface Resume {
  id: string;
  file_name: string;
  upload_date: string;
  status: string;
  resume_analyses: Array<{
    overall_score: number;
    created_at: string;
  }>;
}

export const AnalysisHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user]);

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select(`
          id,
          file_name,
          upload_date,
          status,
          resume_analyses (
            overall_score,
            created_at
          )
        `)
        .eq('user_id', user?.id)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 bg-card/50 backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your resumes...</p>
        </div>
      </Card>
    );
  }

  if (resumes.length === 0) {
    return (
      <Card className="p-12 bg-card/50 backdrop-blur-sm text-center">
        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Resumes Yet</h3>
        <p className="text-muted-foreground mb-4">
          Upload your first resume to get started with AI-powered analysis
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {resumes.map((resume) => {
        const latestAnalysis = resume.resume_analyses[0];
        return (
          <Card
            key={resume.id}
            className="p-6 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all animate-fade-in"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">{resume.file_name}</h3>
                  <Badge
                    variant={resume.status === 'completed' ? 'default' : 'secondary'}
                  >
                    {resume.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(resume.upload_date), 'MMM dd, yyyy')}
                  </div>
                  
                  {latestAnalysis && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Score: {latestAnalysis.overall_score}/100
                    </div>
                  )}
                </div>
              </div>

              {latestAnalysis && (
                <Button
                  onClick={() => navigate(`/results/${resume.id}`)}
                  variant="outline"
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Results
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
