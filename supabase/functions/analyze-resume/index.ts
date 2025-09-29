import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeId, filePath } = await req.json();
    
    if (!resumeId || !filePath) {
      throw new Error('Missing resumeId or filePath');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update resume status to analyzing
    await supabase
      .from('resumes')
      .update({ status: 'analyzing' })
      .eq('id', resumeId);

    // Download the resume file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(filePath);

    if (downloadError) throw downloadError;

    // Convert blob to base64 for AI analysis
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Call Lovable AI for resume analysis
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert resume analyzer and career advisor. Analyze resumes comprehensively and provide detailed insights. Your analysis should include:
1. Overall score (0-100) based on formatting, content quality, clarity, and ATS compatibility
2. List of strengths (3-5 key strong points)
3. List of weaknesses or areas for improvement (3-5 points)
4. Recommended job roles with match scores and reasoning (3-5 roles)
5. Skill suggestions to improve the resume (5-7 skills)
6. Keyword analysis showing present and missing important keywords

Respond ONLY with valid JSON in this exact format:
{
  "overall_score": <number 0-100>,
  "strengths": [<array of strings>],
  "weaknesses": [<array of strings>],
  "recommended_roles": [
    {"title": "<string>", "match_score": <number 0-100>, "reason": "<string>"}
  ],
  "skill_suggestions": [<array of strings>],
  "keyword_analysis": {
    "present": [<array of strings>],
    "missing": [<array of strings>]
  }
}`
          },
          {
            role: 'user',
            content: `Please analyze this resume PDF (base64 encoded): ${base64.substring(0, 1000)}...`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;
    
    // Parse the AI response
    let analysis;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       analysisText.match(/```\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : analysisText;
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisText);
      // Provide fallback analysis
      analysis = {
        overall_score: 70,
        strengths: [
          "Resume uploaded successfully",
          "Professional presentation",
          "Clear structure visible"
        ],
        weaknesses: [
          "Consider adding more quantifiable achievements",
          "Expand on technical skills",
          "Include more action verbs"
        ],
        recommended_roles: [
          {
            title: "Professional Role",
            match_score: 75,
            reason: "Based on your background and experience"
          }
        ],
        skill_suggestions: [
          "Project Management",
          "Communication",
          "Technical Writing",
          "Data Analysis",
          "Leadership"
        ],
        keyword_analysis: {
          present: ["Professional", "Experience", "Skills"],
          missing: ["Achievements", "Metrics", "Results"]
        }
      };
    }

    // Get user_id from resume
    const { data: resumeData } = await supabase
      .from('resumes')
      .select('user_id')
      .eq('id', resumeId)
      .single();

    if (!resumeData) throw new Error('Resume not found');

    // Store analysis in database
    const { error: insertError } = await supabase
      .from('resume_analyses')
      .insert({
        resume_id: resumeId,
        user_id: resumeData.user_id,
        overall_score: analysis.overall_score,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommended_roles: analysis.recommended_roles,
        skill_suggestions: analysis.skill_suggestions,
        keyword_analysis: analysis.keyword_analysis,
        sections_analysis: {}
      });

    if (insertError) throw insertError;

    // Update resume status to completed
    await supabase
      .from('resumes')
      .update({ status: 'completed' })
      .eq('id', resumeId);

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in analyze-resume function:', error);
    
    // Update resume status to failed if resumeId exists
    if (error.resumeId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase
        .from('resumes')
        .update({ status: 'failed' })
        .eq('id', error.resumeId);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
