import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BackButton } from "@/components/move/ui";

const router = vi.hoisted(() => ({
  history: { location: { state: { __TSR_index: 0 } }, back: vi.fn() },
  navigate: vi.fn(),
}));
vi.mock("@tanstack/react-router", () => ({ useRouter: () => router }));
afterEach(() => { cleanup(); vi.clearAllMocks(); router.history.location.state.__TSR_index = 0; });

describe("Back button", () => {
  it("returns through app history when a previous app page exists", () => {
    router.history.location.state.__TSR_index = 2;
    render(<BackButton to="/exercises" />);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(router.history.back).toHaveBeenCalledOnce();
    expect(router.navigate).not.toHaveBeenCalled();
  });
  it("falls back to the exercise category when opened from a QR link", () => {
    render(<BackButton areaId="strength" />);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(router.navigate).toHaveBeenCalledWith({ to: "/area/$areaId", params: { areaId: "strength" }, replace: true });
    expect(router.history.back).not.toHaveBeenCalled();
  });
  it("falls back to Home without app history", () => {
    render(<BackButton />);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(router.navigate).toHaveBeenCalledWith({ to: "/", replace: true });
  });
});