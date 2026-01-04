import type { Plugin, PluginInput } from "@opencode-ai/plugin";
import { ModelAnnouncerService } from "./service";

export const ModelAnnouncerPlugin: Plugin = async (input: PluginInput) => {
  const service = new ModelAnnouncerService(input.client);

  return {
    "experimental.chat.messages.transform": service.transform.bind(service),
  };
};
