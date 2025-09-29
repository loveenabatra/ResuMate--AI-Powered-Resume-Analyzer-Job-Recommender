import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { FloatingShapes } from '@/components/FloatingShapes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Briefcase, 
  Lightbulb,
  ArrowLeft,
  Award
} from 'lucide-react';

interface Analysis {
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  recommended_roles: Array<{
    title: string;
    match_score: number;
    reason: string;
  }>;
  skill_suggestions: string[];
  keyword_analysis: {
    present: string[];
    missing: string[];
  };
}

const Results = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (resumeId && user) {
      fetchAnalysis();
    }
  }, [resumeId, user]);

  const fetchAnalysis = async () => {
    try {
      const { data, error } = await supabase
        .from('resume_analyses')
        .select('*')
        .eq('resume_id', resumeId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      // Cast the data to the correct type
      const typedAnalysis: Analysis = {
        overall_score: data.overall_score,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        recommended_roles: data.recommended_roles as Array<{
          title: string;
          match_score: number;
          reason: string;
        }>,
        skill_suggestions: data.skill_suggestions,
        keyword_analysis: data.keyword_analysis as {
          present: string[];
          missing: string[];
        }
      };
      
      setAnalysis(typedAnalysis);
    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--gradient-hero)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[var(--gradient-hero)]">
        <Navbar />
        <div className="container mx-auto px-6 pt-24">
          <Card className="p-12 text-center max-w-2xl mx-auto">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Analysis Not Found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find the analysis results for this resume.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const scoreColor = 
    analysis.overall_score >= 80 ? 'text-success' :
    analysis.overall_score >= 60 ? 'text-secondary' :
    'text-destructive';

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)]">
      <Navbar />
      <FloatingShapes />
      
      <div className="container mx-auto px-6 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Score Overview */}
          <Card className="p-8 mb-6 bg-card/50 backdrop-blur-sm animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Resume Analysis Results</h1>
                <p className="text-muted-foreground">
                  AI-powered insights to improve your resume
                </p>
              </div>
              <div className="text-center">
                <Award className="w-12 h-12 text-primary mx-auto mb-2" />
                <div className={`text-5xl font-bold ${scoreColor}`}>
                  {analysis.overall_score}
                </div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>
            </div>
            <Progress value={analysis.overall_score} className="h-3" />
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-success" />
                <h2 className="text-2xl font-bold">Strengths</h2>
              </div>
              <ul className="space-y-3">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-success mt-1">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Weaknesses */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-6 h-6 text-destructive" />
                <h2 className="text-2xl font-bold">Areas for Improvement</h2>
              </div>
              <ul className="space-y-3">
                {analysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-destructive mt-1">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Recommended Roles */}
          <Card className="p-6 mt-6 bg-card/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Recommended Job Roles</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {analysis.recommended_roles.map((role, index) => (
                <Card key={index} className="p-4 bg-[var(--gradient-card)]">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{role.title}</h3>
                    <Badge variant="secondary">{role.match_score}% match</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{role.reason}</p>
                </Card>
              ))}
            </div>
          </Card>

          {/* Skill Suggestions */}
          <Card className="p-6 mt-6 bg-card/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-6 h-6 text-secondary" />
              <h2 className="text-2xl font-bold">Skill Suggestions</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.skill_suggestions.map((skill, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1">
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Keyword Analysis */}
          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            <Card className="p-6 bg-card/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <h3 className="font-semibold text-lg mb-3 text-success">Present Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.keyword_analysis.present.map((keyword, index) => (
                  <Badge key={index} className="bg-success/10 text-success border-success/20">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <h3 className="font-semibold text-lg mb-3 text-destructive">Missing Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.keyword_analysis.missing.map((keyword, index) => (
                  <Badge key={index} variant="destructive">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
