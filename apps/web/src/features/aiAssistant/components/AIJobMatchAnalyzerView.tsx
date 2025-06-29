import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from '@mui/material';
import { JobMatchInput, JobMatchOutput } from '../../../../packages/agents/src/modules/ai/schemas/ai.schemas'; // Adjust path

// --- Mock tRPC Hook for getJobMatchScore ---
const useMockJobMatchScoreMutation = (): {
  mutate: (input: JobMatchInput, options?: { onSuccess?: (data: JobMatchOutput) => void; onError?: (error: Error) => void; }) => void;
  isLoading: boolean;
  error: Error | null;
  data: JobMatchOutput | null;
  reset: () => void;
} => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<JobMatchOutput | null>(null);

  const mutate = (input: JobMatchInput, options?: { onSuccess?: (data: JobMatchOutput) => void; onError?: (error: Error) => void; }) => {
    setIsLoading(true);
    setError(null);
    setData(null);
    console.log("Mock JobMatchScore Mutation called with input:", input);
    setTimeout(() => {
      if (input.jobDescriptionText.toLowerCase().includes('error')) {
        const err = new Error('Simulated AI job match error.');
        setError(err);
        options?.onError?.(err);
      } else {
        const score = Math.floor(Math.random() * 60 + 40); // 40-99
        let rating: JobMatchOutput['qualitativeRating'] = 'Fair Match';
        if (score > 90) rating = 'Excellent Match';
        else if (score > 80) rating = 'Strong Match';
        else if (score > 65) rating = 'Good Match';

        const mockOutput: JobMatchOutput = {
          matchScore: score,
          qualitativeRating: rating,
          strengths: ['Adaptability (from resume)', 'Team Collaboration (from resume)', 'Python (from resume)'],
          improvements: ['Highlight more about "Cloud Technologies"', 'Quantify achievements in "Project X"'],
          missingKeywords: ['AWS', 'CI/CD', 'Microservices'],
          detailedFeedback: `This resume shows a ${rating.toLowerCase()} for the role. Key strengths include adaptability and Python. To improve, focus on cloud technologies and quantify past achievements. The job description emphasizes leadership, which could be further highlighted.`,
        };
        setData(mockOutput);
        options?.onSuccess?.(mockOutput);
      }
      setIsLoading(false);
    }, 2500);
  };
  const reset = () => { setIsLoading(false); setError(null); setData(null); };
  return { mutate, isLoading, error, data, reset };
};
// --- End of Mock tRPC Hook ---

// Mock user's resumes
const mockUserResumes = [
  { id: 'resume-uuid-1', title: 'Software Engineer Resume v1' },
  { id: 'resume-uuid-2', title: 'Product Manager CV (Draft)' },
  { id: 'resume-uuid-3', title: 'My Best Resume Yet' },
];

interface AIJobMatchAnalyzerViewProps {
  // userId: string; // To fetch user's resumes in a real scenario
}

const AIJobMatchAnalyzerView: React.FC<AIJobMatchAnalyzerViewProps> = (/*{ userId }*/) => {
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  // In a real app, resumeText would be fetched if selectedResumeId is chosen,
  // or user could paste directly. For this mock, we'll just use selectedResumeId as a trigger.
  const [jobDescriptionText, setJobDescriptionText] = useState<string>('');

  // const { mutate: analyzeJobMatch, isLoading, error, data: analysisResult, reset } = trpc.ai.getJobMatchScore.useMutation();
  const { mutate: analyzeJobMatch, isLoading, error, data: analysisResult, reset } = useMockJobMatchScoreMutation();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reset(); // Reset previous results/errors
    if (!jobDescriptionText.trim()) {
      alert("Please paste a job description."); // Simple validation
      return;
    }
    if (!selectedResumeId) { // Assuming selection is primary way for now
        alert("Please select a resume.");
        return;
    }

    // In a real app, you'd fetch the text of `selectedResumeId` here if not already available
    // For this mock, the service call will use the ID to simulate fetching if text isn't passed.
    analyzeJobMatch({
      resumeId: selectedResumeId, // Pass ID
      // resumeText: "...", // Or pass text directly
      jobDescriptionText,
    });
  };

  useEffect(() => {
      // Clear results if inputs change after a submission
      reset();
  }, [selectedResumeId, jobDescriptionText, reset])

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, margin: 'auto' }}>
      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: '12px' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          AI Job Match Analyzer
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="resume-select-label">Select Your Resume</InputLabel>
                <Select
                  labelId="resume-select-label"
                  id="resume-select"
                  value={selectedResumeId}
                  label="Select Your Resume"
                  onChange={(e) => setSelectedResumeId(e.target.value as string)}
                  required
                >
                  <MenuItem value="" disabled><em>Select a resume</em></MenuItem>
                  {mockUserResumes.map((resume) => (
                    <MenuItem key={resume.id} value={resume.id}>
                      {resume.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Optionally, allow pasting resume text directly
            <Grid item xs={12}>
              <TextField label="Or Paste Resume Text" multiline rows={8} fullWidth variant="outlined" />
            </Grid>
            */}
            <Grid item xs={12}>
              <TextField
                label="Paste Job Description Here"
                multiline
                rows={10}
                fullWidth
                variant="outlined"
                value={jobDescriptionText}
                onChange={(e) => setJobDescriptionText(e.target.value)}
                required
                placeholder="Paste the full job description text..."
              />
            </Grid>
            <Grid item xs={12} sx={{ textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isLoading || !selectedResumeId || !jobDescriptionText.trim()}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isLoading ? 'Analyzing...' : 'Analyze Match'}
              </Button>
            </Grid>
          </Grid>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }} variant="filled">
            {error.message}
          </Alert>
        )}

        {analysisResult && !isLoading && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
              Analysis Results
            </Typography>
            <Card variant="outlined" sx={{ mb: 2, borderRadius: '8px' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">Overall Match</Typography>
                <Typography variant="h3" component="p" color="primary.main" sx={{ fontWeight: 'bold', my:1 }}>
                  {analysisResult.matchScore}%
                </Typography>
                <Chip label={analysisResult.qualitativeRating} color={
                    analysisResult.matchScore > 85 ? "success" : analysisResult.matchScore > 65 ? "warning" : "error"
                } sx={{fontSize: '1rem', padding: '4px 8px'}}/>
                <Box sx={{width: '80%', margin: '16px auto 0'}}>
                    <LinearProgress variant="determinate" value={analysisResult.matchScore} sx={{height: 10, borderRadius: 5}}/>
                </Box>
              </CardContent>
            </Card>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{height: '100%', borderRadius: '8px'}}>
                  <CardHeader title="✅ Strengths / Keywords Matched" titleTypographyProps={{variant: 'h6'}}/>
                  <Divider/>
                  <CardContent>
                    <List dense>
                      {analysisResult.strengths.map((item, index) => (
                        <ListItem key={`strength-${index}`}><ListItemText primary={item} /></ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{height: '100%', borderRadius: '8px'}}>
                  <CardHeader title="💡 Areas for Improvement / Missing" titleTypographyProps={{variant: 'h6'}}/>
                  <Divider/>
                  <CardContent>
                    <List dense>
                      {analysisResult.improvements.map((item, index) => (
                        <ListItem key={`improvement-${index}`}><ListItemText primary={item} /></ListItem>
                      ))}
                       {analysisResult.missingKeywords && analysisResult.missingKeywords.length > 0 && (
                           <>
                           <Typography variant="subtitle2" sx={{mt:1, ml:2}}>Missing Keywords:</Typography>
                            {analysisResult.missingKeywords.map((item, index) => (
                                <ListItem key={`missing-${index}`} sx={{pl:3}}><ListItemText primary={item} secondary="Consider adding this from JD" /></ListItem>
                            ))}
                           </>
                       )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              {analysisResult.detailedFeedback && (
                 <Grid item xs={12}>
                    <Card variant="outlined" sx={{borderRadius: '8px'}}>
                        <CardHeader title="📝 Detailed Feedback" titleTypographyProps={{variant: 'h6'}}/>
                        <Divider/>
                        <CardContent>
                            <Typography variant="body2" sx={{whiteSpace: 'pre-line'}}>{analysisResult.detailedFeedback}</Typography>
                        </CardContent>
                    </Card>
                 </Grid>
              )}
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AIJobMatchAnalyzerView;

console.log("AIJobMatchAnalyzerView.tsx created in apps/web/src/features/aiAssistant/components/");
