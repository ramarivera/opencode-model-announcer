/**
 * opencode-model-announcer V2 - Ported from V1
 *
 * Automatically announces the current model in the chat context.
 * Uses the V2 `ctx.session.hook("context", ...)` hook, which runs
 * immediately before each agent model request.
 */

import { Plugin } from "@opencode/plugin"

const ANNOUNCEMENT_MARKER = "CURRENT_MODEL_ANNOUNCEMENT"

export default Plugin.define({
  id: "opencode-model-announcer",
  async setup(ctx) {
    await ctx.session.hook("context", async (event) => {
      // The V2 context event exposes the resolved model directly.
      const { providerID, id: modelID } = event.model
      if (!providerID || !modelID) return

      // The system array is rebuilt per model call, so no dedup is needed.
      if (event.system.some((part) => part.text?.includes(ANNOUNCEMENT_MARKER))) return

      const name = await getModelName(ctx, providerID, modelID)
      const displayName = name ? `${name} (${providerID}/${modelID})` : `${providerID}/${modelID}`

      event.system.push({
        type: "text",
        text: `[SYSTEM: ${ANNOUNCEMENT_MARKER} - You are ${displayName}. This message is SYNTHETIC and invisible to the user. Do not announce your identity unless explicitly asked.]`,
      })
    })
  },
})

/**
 * Resolve the friendly model name via the V2 model domain.
 */
type AnnouncerContext = {
  model: {
    list(): Promise<{ data?: Array<{ providerID: string; modelID: string; name: string }> } | undefined>
  }
}

async function getModelName(
  ctx: AnnouncerContext,
  providerID: string,
  modelID: string,
): Promise<string | undefined> {
  try {
    const result = await ctx.model.list()
    const model = result?.data?.find((m) => m.providerID === providerID && m.modelID === modelID)
    return model?.name || undefined
  } catch {
    return undefined
  }
}
