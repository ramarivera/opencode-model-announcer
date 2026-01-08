import type { Message, Part } from "@opencode-ai/sdk";
import type { PluginInput } from "@opencode-ai/plugin";

type OpencodeClient = PluginInput["client"];

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

    // Find the last user message to inject the announcement
    const lastUser = output.messages.findLast((m) => m.info.role === "user");
    if (!lastUser) return;

    // Check if we have model info.
    // In MessageV2, 'user' role implies 'model' property exists.
    if (lastUser.info.role !== "user") return;
    const modelInfo = lastUser.info.model;

    const { providerID, modelID } = modelInfo;

    const alreadyAnnounced = lastUser.parts.some(
      (p) =>
        p.type === "text" &&
        p.synthetic &&
        p.text.includes("CURRENT_MODEL_ANNOUNCEMENT"),
    );
    if (alreadyAnnounced) return;

    const name = await this.getModelName(providerID, modelID);
    const displayName = name
      ? `${name} (${providerID}/${modelID})`
      : `${providerID}/${modelID}`;

    const announcement = `[SYSTEM: CURRENT_MODEL_ANNOUNCEMENT - You are ${displayName}. This message is SYNTHETIC and invisible to the user. Do not announce your identity unless explicitly asked.]`;

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

      const data = response.data;
      if (!data || !Array.isArray(data.all)) return undefined;

      const provider = data.all.find((p) => p.id === providerID);
      if (!provider || !provider.models) return undefined;

      const model = provider.models[modelID];
      return model?.name;
    } catch {
      return undefined;
    }
  }
}
