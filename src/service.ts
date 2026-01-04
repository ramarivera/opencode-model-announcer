import type { Message, Part, OpencodeClient } from "@opencode-ai/sdk";

export class ModelAnnouncerService {
  private client: OpencodeClient;

  constructor(client: OpencodeClient) {
    this.client = client;
  }

  async transform(
    _input: Record<string, never>,
    output: { messages: { info: Message; parts: Part[] }[] },
  ): Promise<void> {
    if (!output.messages || output.messages.length === 0) return;

    // Find the last user message
    const lastUser = output.messages.findLast((m) => m.info.role === "user");
    if (!lastUser) return;

    // Check if we have model info.
    // In MessageV2, 'user' role implies 'model' property exists.
    // We cast to access it safely or rely on discriminated union if TS is smart enough.
    if (lastUser.info.role !== "user") return;
    const modelInfo = lastUser.info.model;

    const { providerID, modelID } = modelInfo;

    // Check for existing announcement to avoid duplicates
    const alreadyAnnounced = lastUser.parts.some(
      (p) =>
        p.type === "text" &&
        p.synthetic &&
        p.text.includes("CURRENT_MODEL_ANNOUNCEMENT"),
    );
    if (alreadyAnnounced) return;

    // Get friendly name
    const name = await this.getModelName(providerID, modelID);
    const displayName = name
      ? `${name} (${providerID}/${modelID})`
      : `${providerID}/${modelID}`;

    const announcement = `[SYSTEM: CURRENT_MODEL_ANNOUNCEMENT - The current model being used is: ${displayName}. Use this information to tailor your responses if necessary.]`;

    // Inject synthetic part
    const part: Part = {
      type: "text",
      id: `synthetic-part-${Date.now()}`,
      sessionID: lastUser.info.sessionID,
      messageID: lastUser.info.id,
      text: announcement,
      synthetic: true,
    };

    lastUser.parts.unshift(part);
  }

  private async getModelName(
    providerID: string,
    modelID: string,
  ): Promise<string | undefined> {
    try {
      const response = await this.client.provider.list();

      if (!response.data) return undefined;

      // The SDK types might differ slightly from the internal representation,
      // but assuming the structure matches { [providerID]: { models: { [modelID]: { name: string } } } }
      const providers = response.data as Record<
        string,
        { models: Record<string, { name: string }> }
      >;

      const provider = providers[providerID];
      if (!provider || !provider.models) return undefined;

      const model = provider.models[modelID];
      return model?.name;
    } catch {
      return undefined;
    }
  }
}
