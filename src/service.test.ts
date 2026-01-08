import { describe, it, expect, vi } from "vitest";
import { ModelAnnouncerService } from "./service";
import type { Message, OpencodeClient, Part } from "@opencode-ai/sdk";

describe("ModelAnnouncerService", () => {
  it("injects model announcement with friendly name", async () => {
    const mockClient = {
      provider: {
        list: vi.fn().mockResolvedValue({
          data: {
            all: [
              {
                id: "test-provider",
                models: {
                  "test-model": { name: "Test Model Friendly Name" },
                },
              },
            ],
          },
        }),
      },
    } as unknown as OpencodeClient;

    const service = new ModelAnnouncerService(mockClient);

    const message = {
      role: "user",
      id: "msg-1",
      sessionID: "sess-1",
      agent: "test",
      model: { providerID: "test-provider", modelID: "test-model" },
      time: { created: Date.now() },
    } as unknown as Message;

    const output = {
      messages: [
        {
          info: message,
          parts: [],
        },
      ],
    };

    await service.transform({}, output);

    expect(output.messages[0].parts).toHaveLength(1);
    const textPart = output.messages[0].parts[0];
    if (textPart.type !== "text") throw new Error("Expected text part");

    expect(textPart.text).toContain("Test Model Friendly Name");
    expect(textPart.text).toContain("CURRENT_MODEL_ANNOUNCEMENT");
    expect(textPart.synthetic).toBe(true);
  });

  it("falls back to IDs if name not found", async () => {
    const mockClient = {
      provider: {
        list: vi.fn().mockResolvedValue({ data: {} }),
      },
    } as unknown as OpencodeClient;

    const service = new ModelAnnouncerService(mockClient);

    const output = {
      messages: [
        {
          info: {
            role: "user",
            id: "1",
            sessionID: "1",
            model: { providerID: "provider-x", modelID: "model-y" },
          } as unknown as Message,
          parts: [],
        },
      ],
    };

    await service.transform({}, output);

    expect(output.messages[0].parts).toHaveLength(1);
    const textPart = output.messages[0].parts[0];
    if (textPart.type !== "text") throw new Error("Expected text part");
    expect(textPart.text).toContain("provider-x/model-y");
  });

  it("skips if already announced", async () => {
    const mockClient = {
      provider: {
        list: vi.fn(),
      },
    } as unknown as OpencodeClient;
    const service = new ModelAnnouncerService(mockClient);

    const output = {
      messages: [
        {
          info: {
            role: "user",
            model: { providerID: "p", modelID: "m" },
          } as unknown as Message,
          parts: [
            {
              type: "text",
              synthetic: true,
              text: "...CURRENT_MODEL_ANNOUNCEMENT...",
              id: "p1",
              sessionID: "s1",
              messageID: "m1",
            } as unknown as Part,
          ],
        },
      ],
    };

    await service.transform({}, output);
    expect(output.messages[0].parts).toHaveLength(1); // No new part added
  });
});
