import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ResumeUploadProps {
  onUploadComplete?: () => void;
}

export const ResumeUpload = ({ onUploadComplete }: ResumeUploadProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    try {
      // Upload to storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create resume record
      const { data: resumeData, error: insertError } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          status: 'uploaded'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Resume uploaded successfully!');
      
      // Start analysis
      setAnalyzing(true);
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-resume', {
        body: { resumeId: resumeData.id, filePath }
      });

      if (analysisError) throw analysisError;

      toast.success('Analysis complete!');
      setFile(null);
      onUploadComplete?.();
      
      // Navigate to results
      navigate(`/results/${resumeData.id}`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <Card className="p-8 bg-card/50 backdrop-blur-sm border-border animate-fade-in">
      <div className="text-center mb-6">
        <Upload className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Upload Your Resume</h2>
        <p className="text-muted-foreground">
          Upload your resume in PDF format for AI-powered analysis
        </p>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id="resume-upload"
            disabled={uploading || analyzing}
          />
          <label
            htmlFor="resume-upload"
            className="cursor-pointer block"
          >
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span className="font-medium">{file.name}</span>
                <span className="text-sm text-muted-foreground">
                  ({(file.size / 1024).toFixed(2)} KB)
                </span>
              </div>
            ) : (
              <>
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Click to browse or drag and drop your resume (PDF only, max 10MB)
                </p>
              </>
            )}
          </label>
        </div>

        {file && (
          <Button
            onClick={handleUpload}
            disabled={uploading || analyzing}
            className="w-full bg-gradient-to-r from-primary to-primary-dark"
            size="lg"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload & Analyze
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
};
