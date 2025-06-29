import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { ImprovementSuggestion } from '../../../../packages/agents/src/modules/ai/schemas/ai.schemas'; // Adjust path

interface AIImprovementSuggestionsPanelProps {
  suggestions: ImprovementSuggestion[];
  onApplySuggestion: (suggestionId: string, suggestedChange: string) => void;
  onDismissSuggestion?: (suggestionId: string) => void; // Optional dismiss functionality
  isLoading?: boolean; // To show a loading state if suggestions are being fetched by parent
}

const AIImprovementSuggestionsPanel: React.FC<AIImprovementSuggestionsPanelProps> = ({
  suggestions,
  onApplySuggestion,
  onDismissSuggestion,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 2, mt: 2, borderRadius: '12px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 150 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading suggestions...</Typography>
        </Box>
      </Paper>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, mt: 2, textAlign: 'center', borderRadius: '12px' }}>
        <Typography variant="subtitle1" color="text.secondary">
          No improvement suggestions available at the moment.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2, borderRadius: '12px', maxHeight: '400px', overflowY: 'auto' }}>
      <Typography variant="h6" component="h3" gutterBottom sx={{ mb: 1.5 }}>
        AI Improvement Suggestions
      </Typography>
      <List disablePadding>
        {suggestions.map((suggestion, index) => (
          <React.Fragment key={suggestion.id}>
            <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1.5, px: 0 }}>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Chip label={suggestion.suggestionType || 'Suggestion'} size="small" color="info" variant="outlined" />
                {onDismissSuggestion && (
                  <IconButton
                    aria-label="Dismiss suggestion"
                    onClick={() => onDismissSuggestion(suggestion.id)}
                    size="small"
                    sx={{color: 'text.secondary'}}
                  >
                    <HighlightOffIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              {suggestion.originalTextSegment && (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', mb: 0.5, ml:1 }}>
                  Original: "{suggestion.originalTextSegment}"
                </Typography>
              )}
              <ListItemText
                primary={
                    <Typography variant="body2" sx={{fontWeight: 500}}>
                        {suggestion.suggestedChange}
                    </Typography>
                }
                secondary={suggestion.explanation}
                sx={{mb:1, ml:1}}
              />
              <Button
                variant="outlined"
                size="small"
                color="primary"
                startIcon={<CheckCircleOutlineIcon />}
                onClick={() => onApplySuggestion(suggestion.id, suggestion.suggestedChange)}
                sx={{ textTransform: 'none', alignSelf: 'flex-end' }}
              >
                Apply Suggestion
              </Button>
            </ListItem>
            {index < suggestions.length - 1 && <Divider component="li" sx={{my: 1}} />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default AIImprovementSuggestionsPanel;

// Example Usage (conceptual):
/*
const sampleSuggestions: ImprovementSuggestion[] = [
  { id: '1', suggestionType: 'Clarity', suggestedChange: "Rephrase to 'Orchestrated project execution...'", explanation: "Uses a stronger action verb." },
  { id: '2', suggestionType: 'Keyword', suggestedChange: "Consider adding 'Agile Methodologies'.", originalTextSegment: "Managed project tasks." },
  { id: '3', suggestionType: 'Conciseness', suggestedChange: "Shorten sentence to improve readability.", explanation: "Too verbose." },
];

const MyEditor = () => {
  const handleApply = (id: string, change: string) => console.log(`Applied suggestion ${id}: ${change}`);
  const handleDismiss = (id: string) => console.log(`Dismissed suggestion ${id}`);

  return (
    <AIImprovementSuggestionsPanel
      suggestions={sampleSuggestions}
      onApplySuggestion={handleApply}
      onDismissSuggestion={handleDismiss}
    />
  );
}
*/

console.log("AIImprovementSuggestionsPanel.tsx created in apps/web/src/features/aiAssistant/components/");
