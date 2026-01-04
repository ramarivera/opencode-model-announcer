import type { Plugin } from '@opencode-ai/plugin';

/**
 * OpenCode Model Announcer Plugin
 * 
 * Automatically injects the current model name into the chat context
 * so the LLM knows which model it is without hallucinating or asking.
 */
export const ModelAnnouncerPlugin: Plugin = async () => {
  return {
    // This hook fires right before messages are sent to the LLM
    "experimental.chat.messages.transform": async (_input: any, output: { messages: any[] }) => {
      if (!output.messages || output.messages.length === 0) return;

      // Find the last user message (the current turn)
      const lastUser = output.messages.findLast(m => m.info.role === 'user');
      if (!lastUser) return;

      const model = lastUser.info.model;
      if (!model) return;

      const modelName = `${model.providerID}/${model.modelID}`;
      
      // Check if we already injected the announcement to avoid duplicates
      const alreadyAnnounced = lastUser.parts.some(
        (p: any) => p.type === 'text' && p.synthetic && p.text.includes('CURRENT_MODEL_ANNOUNCEMENT')
      );
      if (alreadyAnnounced) return;

      // Inject a synthetic text part at the beginning of the message parts
      // This is invisible to the user in the TUI but seen by the LLM
      lastUser.parts.unshift({
        id: `synthetic-part-${Date.now()}`,
        sessionID: lastUser.info.sessionID,
        messageID: lastUser.info.id,
        type: "text",
        text: `[SYSTEM: CURRENT_MODEL_ANNOUNCEMENT - The current model being used is: ${modelName}. Use this information to tailor your responses if necessary.]`,
        synthetic: true
      });
    }
  };
};
