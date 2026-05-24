// Generate LLMs configuration for DevInspectAI
// This is a placeholder script for the build process

console.log('Generating LLM configurations...');

// Export empty configuration for now
const llmConfig = {
  providers: ['openai', 'gemini'],
  models: {
    openai: ['gpt-4o-mini', 'gpt-4'],
    gemini: ['gemini-2.0-flash', 'gemini-pro']
  }
};

console.log('LLM configuration generated successfully');
console.log(JSON.stringify(llmConfig, null, 2));