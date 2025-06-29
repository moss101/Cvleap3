import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
    GenerateSectionInput,
    GenerateSectionContext,
    GeneratedContentItem
} from '../../../../packages/agents/src/modules/ai/schemas/ai.schemas'; // Adjust path

// --- Mock tRPC Hook ---
// In a real application, this would be imported from your tRPC client setup.
// e.g., import { trpc } from '@/utils/trpc';
const useMockAIGenerateSectionMutation = (): {
  mutate: (input: GenerateSectionInput, options?: { onSuccess?: (data: { suggestions: GeneratedContentItem[] }) => void; onError?: (error: Error) => void; }) => void;
  isLoading: boolean;
  error: Error | null;
  data: { suggestions: GeneratedContentItem[] } | null;
  reset: () => void;
} => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<{ suggestions: GeneratedContentItem[] } | null>(null);

  const mutate = (input: GenerateSectionInput, options?: { onSuccess?: (data: { suggestions: GeneratedContentItem[] }) => void; onError?: (error: Error) => void; }) => {
    setIsLoading(true);
    setError(null);
    setData(null);
    console.log("Mock AI Mutation called with input:", input);
    setTimeout(() => {
      if (input.context.jobTitle === 'error') {
        const err = new Error('Simulated AI generation error.');
        setError(err);
        options?.onError?.(err);
      } else {
        const suggestions: GeneratedContentItem[] = Array.from({ length: input.resultCount || 1 }, (_, i) => ({
          id: crypto.randomUUID(),
          content: `This is AI suggestion ${i + 1} for ${input.sectionType} based on context: ${input.context.jobTitle || 'general info'}. It's professionally worded and relevant. ${input.userInstructions || ''}`,
          confidenceScore: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
        }));
        setData({ suggestions });
        options?.onSuccess?.({ suggestions });
      }
      setIsLoading(false);
    }, 2000);
  };

  const reset = () => {
      setIsLoading(false);
      setError(null);
      setData(null);
  }

  return { mutate, isLoading, error, data, reset };
};
// --- End of Mock tRPC Hook ---

interface AIContentGeneratorModalProps {
  open: boolean;
  onClose: () => void;
  sectionType: GenerateSectionInput['sectionType'];
  initialContext?: Partial<GenerateSectionContext>;
  onContentGenerated: (sectionType: GenerateSectionInput['sectionType'], generatedText: string) => void;
  maxSuggestions?: number;
}

const AIContentGeneratorModal: React.FC<AIContentGeneratorModalProps> = ({
  open,
  onClose,
  sectionType,
  initialContext = {},
  onContentGenerated,
  maxSuggestions = 3,
}) => {
  const [context, setContext] = useState<Partial<GenerateSectionContext>>(initialContext);
  const [userInstructions, setUserInstructions] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const { mutate: generateContent, isLoading, error: mutationError, data: mutationData, reset: resetMutation } = useMockAIGenerateSectionMutation();

  useEffect(() => {
    // Reset context when modal opens with new initialContext or sectionType changes
    setContext(initialContext);
    setUserInstructions('');
    resetMutation(); // Reset mutation state when modal re-opens or key props change
    setActiveTab(0);
  }, [open, initialContext, sectionType, resetMutation]);

  const handleContextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContext({ ...context, [event.target.name]: event.target.value });
  };

  const handleGenerate = () => {
    setActiveTab(0); // Reset to first tab on new generation
    generateContent({
      sectionType,
      context: context as GenerateSectionContext, // Assuming context will be filled enough
      userInstructions,
      resultCount: maxSuggestions,
    });
  };

  const handleUseThisContent = (content: string) => {
    onContentGenerated(sectionType, content);
    onClose(); // Close modal after selecting content
  };

  const handleCloseDialog = () => {
    resetMutation();
    onClose();
  };

  const renderContextFields = () => {
    // Customize fields based on sectionType
    switch (sectionType) {
      case 'summary':
        return (
          <>
            <TextField name="jobTitle" label="Target Role/Industry (Optional)" value={context.jobTitle || ''} onChange={handleContextChange} fullWidth margin="dense" />
            <TextField name="yearsExperience" label="Years of Experience (Optional)" value={context.yearsExperience || ''} onChange={handleContextChange} fullWidth margin="dense" type="number" />
            <TextField name="keySkillsOrResponsibilities" label="Key Skills/Responsibilities (comma-separated, Optional)" value={context.keySkillsOrResponsibilities?.join(', ') || ''} onChange={(e) => setContext({...context, keySkillsOrResponsibilities: e.target.value.split(',').map(s => s.trim())})} fullWidth margin="dense" />
          </>
        );
      case 'experience_bullets':
        return (
          <>
            <TextField name="jobTitle" label="Job Title" value={context.jobTitle || ''} onChange={handleContextChange} fullWidth margin="dense" required/>
            <TextField name="company" label="Company (Optional)" value={context.company || ''} onChange={handleContextChange} fullWidth margin="dense" />
            <TextField name="keySkillsOrResponsibilities" label="Key Responsibilities/Achievements (comma-separated)" value={context.keySkillsOrResponsibilities?.join(', ') || ''} onChange={(e) => setContext({...context, keySkillsOrResponsibilities: e.target.value.split(',').map(s => s.trim())})} fullWidth margin="dense" required/>
          </>
        );
      // Add more cases for other section types
      default:
        return <Typography color="text.secondary">Context fields for '{sectionType}' not configured.</Typography>;
    }
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { minHeight: '70vh' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        ✨ Generate {sectionType.replace(/_/g, ' ')} with AI
        <IconButton aria-label="close" onClick={handleCloseDialog} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom>Provide some context:</Typography>
        {renderContextFields()}
        <TextField
          name="userInstructions"
          label="Specific Instructions (e.g., 'make it concise', 'focus on X', Optional)"
          value={userInstructions}
          onChange={(e) => setUserInstructions(e.target.value)}
          fullWidth
          margin="dense"
          multiline
          rows={2}
        />

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>
        )}
        {mutationError && (
          <Alert severity="error" sx={{ my: 2 }}>{mutationError.message}</Alert>
        )}
        {mutationData?.suggestions && mutationData.suggestions.length > 0 && !isLoading && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>AI Suggestions ({mutationData.suggestions.length}):</Typography>
            {mutationData.suggestions.length > 1 && (
                 <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} variant="scrollable" scrollButtons="auto" sx={{mb: 1}}>
                    {mutationData.suggestions.map((_, index) => (
                        <Tab label={`Suggestion ${index + 1}`} key={index} />
                    ))}
                </Tabs>
            )}
            {mutationData.suggestions.map((suggestion, index) => (
                 <Box key={suggestion.id} role="tabpanel" hidden={activeTab !== index}>
                    {activeTab === index && (
                        <Paper variant="outlined" sx={{ p: 2, whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
                            <Typography variant="body2">{suggestion.content}</Typography>
                            <Button onClick={() => handleUseThisContent(suggestion.content)} variant="contained" size="small" sx={{ mt: 1.5 }}>
                                Use this Content
                            </Button>
                        </Paper>
                    )}
                 </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
        <Button onClick={handleGenerate} variant="contained" disabled={isLoading}>
          {isLoading ? 'Generating...' : (mutationData ? 'Regenerate' : 'Generate')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AIContentGeneratorModal;

console.log("AIContentGeneratorModal.tsx created in apps/web/src/features/aiAssistant/components/");
