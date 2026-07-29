import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { notifyUIInteraction, setUIInteractionFeedback } from "./UIInteractionFeedback.js";

afterEach(() => {
  setUIInteractionFeedback(null);
});

describe("UIInteractionFeedback", () => {
  it("notifies the configured UI feedback listener", () => {
    const listener = vi.fn();
    setUIInteractionFeedback(listener);

    notifyUIInteraction();

    expect(listener).toHaveBeenCalledOnce();
  });

  it("accepts an empty listener when feedback is disabled", () => {
    setUIInteractionFeedback(null);

    expect(() => notifyUIInteraction()).not.toThrow();
  });
});
