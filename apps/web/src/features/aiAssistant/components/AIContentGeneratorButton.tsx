import React from 'react';
import { Button, IconButton } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; // Example icon (Sparkle)
import EditNoteIcon from '@mui/icons-material/EditNote'; // Example icon for 'improve'
// import ScienceIcon from '@mui/icons-material/Science'; // Another option for 'generate'

interface AIContentGeneratorButtonProps {
  onClick: () => void;
  sectionType: 'summary' | 'experience_bullets' | 'skills_list' | string; // string for extensibility
  variant?: 'button' | 'icon';
  disabled?: boolean;
  label?: string; // Optional custom label
}

const AIContentGeneratorButton: React.FC<AIContentGeneratorButtonProps> = ({
  onClick,
  sectionType, // sectionType can be used to customize the label or icon if needed
  variant = 'button',
  disabled = false,
  label
}) => {
  const defaultLabel = `✨ Generate ${sectionType.replace('_', ' ')} with AI`;
  const displayLabel = label || defaultLabel;

  if (variant === 'icon') {
    return (
      <IconButton
        aria-label={displayLabel}
        onClick={onClick}
        disabled={disabled}
        color="primary" // Or "default" based on theme preference
        size="small" // Icons often look better smaller in context
      >
        <AutoAwesomeIcon fontSize="small" />
      </IconButton>
    );
  }

  return (
    <Button
      variant="outlined" // Or "contained" / "text" based on desired emphasis
      color="primary"    // Or "secondary"
      startIcon={<AutoAwesomeIcon />}
      onClick={onClick}
      disabled={disabled}
      size="small" // Typically these buttons are not overly large
      sx={{ textTransform: 'none', my: 0.5 }} // Keep casing, add some margin if inline
    >
      {displayLabel}
    </Button>
  );
};

export default AIContentGeneratorButton;

// Example Usage (conceptual):
/*
const MyResumeSection = () => {
  const handleGenerateSummary = () => {
    console.log("Opening AI Summary Generator Modal for section: summary");
    // Logic to open AIContentGeneratorModal
  };

  const handleGenerateExperience = () => {
    console.log("Opening AI Experience Generator Modal for section: experience_bullets");
  }

  return (
    <div>
      <h3>Professional Summary</h3>
      <AIContentGeneratorButton sectionType="summary" onClick={handleGenerateSummary} />
      <textarea placeholder="Your summary here..." style={{ width: '100%', minHeight: '80px' }}/>

      <h3>Work Experience</h3>
      <AIContentGeneratorButton sectionType="experience_bullets" onClick={handleGenerateExperience} label="✨ Get Bullet Ideas" />
      <textarea placeholder="Your experience here..." style={{ width: '100%', minHeight: '80px' }}/>

      <AIContentGeneratorButton sectionType="skills_list" onClick={() => {}} variant="icon" />
       <input type="text" placeholder="Skills..." />
    </div>
  );
};
*/

console.log("AIContentGeneratorButton.tsx created in apps/web/src/features/aiAssistant/components/");
