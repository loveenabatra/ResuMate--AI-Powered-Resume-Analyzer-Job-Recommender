import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { FloatingShapes } from '@/components/FloatingShapes';
import { Upload, Brain, Target, TrendingUp, CheckCircle, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <Upload className="w-8 h-8 text-primary" />,
      title: "Upload Resume",
      description: "Simply upload your PDF resume and let our AI analyze it"
    },
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: "AI Analysis",
      description: "Advanced NLP algorithms parse and understand your resume content"
    },
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: "Job Matching",
      description: "Get personalized job role recommendations based on your skills"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      title: "Improvement Tips",
      description: "Receive actionable suggestions to enhance your resume"
    }
  ];

  const benefits = [
    "Comprehensive resume scoring",
    "Keyword density analysis",
    "ATS optimization insights",
    "Skill gap identification",
    "Industry-specific recommendations",
    "Track analysis history"
  ];

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)]">
      <Navbar />
      <FloatingShapes />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                AI-Powered Resume
              </span>
              <br />
              <span className="text-foreground">Analysis & Optimization</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform your resume with intelligent AI analysis. Get personalized job recommendations 
              and actionable insights to land your dream job.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate(user ? '/dashboard' : '/auth?mode=signup')}
                className="bg-gradient-to-r from-primary to-primary-dark text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              >
                {user ? 'Go to Dashboard' : 'Start Free Analysis'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Four simple steps to optimize your resume
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="p-6 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Why Choose ResuMate?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our AI-powered platform provides comprehensive insights to make your resume 
                stand out in today's competitive job market.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="p-8 bg-[var(--gradient-card)] backdrop-blur-sm border-border shadow-xl">
              <Award className="w-16 h-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of job seekers who have improved their resumes with ResuMate.
              </p>
              <Button
                size="lg"
                onClick={() => navigate(user ? '/dashboard' : '/auth?mode=signup')}
                className="w-full bg-gradient-to-r from-primary to-primary-dark"
              >
                {user ? 'Go to Dashboard' : 'Create Free Account'}
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl text-center text-muted-foreground">
          <p>&copy; 2025 ResuMate. AI-Powered Resume Analysis.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
