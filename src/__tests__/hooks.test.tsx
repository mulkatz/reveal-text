import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScramble } from "../hooks/use-scramble";
import { useTextReveal } from "../hooks/use-text-reveal";
import { useTypewriter } from "../hooks/use-typewriter";

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
	vi.useFakeTimers();
	global.IntersectionObserver = vi.fn(() => ({
		observe: mockObserve,
		disconnect: mockDisconnect,
		unobserve: vi.fn(),
		root: null,
		rootMargin: "",
		thresholds: [],
		takeRecords: () => [],
	}));
});

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
});

function TestReveal({
	text,
	options,
}: { text: string; options?: Parameters<typeof useTextReveal>[1] }) {
	const { ref, isPlaying, isComplete } = useTextReveal(text, options);
	return (
		<div>
			<span ref={ref} data-testid="target" />
			<span data-testid="playing">{String(isPlaying)}</span>
			<span data-testid="complete">{String(isComplete)}</span>
		</div>
	);
}

function TestTypewriter({
	text,
	options,
}: { text: string; options?: Parameters<typeof useTypewriter>[1] }) {
	const { ref, isPlaying, isComplete } = useTypewriter(text, options);
	return (
		<div>
			<span ref={ref} data-testid="target" />
			<span data-testid="playing">{String(isPlaying)}</span>
			<span data-testid="complete">{String(isComplete)}</span>
		</div>
	);
}

function TestScramble({
	text,
	options,
}: { text: string; options?: Parameters<typeof useScramble>[1] }) {
	const { ref, isPlaying, isComplete } = useScramble(text, options);
	return (
		<div>
			<span ref={ref} data-testid="target" />
			<span data-testid="playing">{String(isPlaying)}</span>
			<span data-testid="complete">{String(isComplete)}</span>
		</div>
	);
}

describe("useTextReveal", () => {
	it("renders text with aria-label for accessibility", () => {
		const { getByTestId } = render(<TestReveal text="Hello World" />);
		const target = getByTestId("target");
		expect(target.getAttribute("aria-label")).toBe("Hello World");
	});

	it("splits text into segments with aria-hidden", () => {
		const { getByTestId } = render(
			<TestReveal text="Hello World" options={{ split: "word" }} />,
		);
		const target = getByTestId("target");
		const segments = target.querySelectorAll("[data-tr-segment]");
		expect(segments.length).toBe(2);
		for (const seg of segments) {
			expect(seg.getAttribute("aria-hidden")).toBe("true");
		}
	});

	it("starts playing on mount with autoPlay", () => {
		const { getByTestId } = render(
			<TestReveal text="Hello" options={{ autoPlay: true }} />,
		);
		expect(getByTestId("playing").textContent).toBe("true");
	});

	it("applies animation delay to segments", () => {
		const { getByTestId } = render(
			<TestReveal text="Hi there" options={{ split: "word", stagger: 100 }} />,
		);

		const target = getByTestId("target");
		const segments = target.querySelectorAll("[data-tr-segment]");
		expect(segments.length).toBe(2);
		expect((segments[0] as HTMLElement).style.animationDelay).toBe("0ms");
		expect((segments[1] as HTMLElement).style.animationDelay).toBe("100ms");
	});
});

describe("useTypewriter", () => {
	it("renders with aria-label", () => {
		const { getByTestId } = render(
			<TestTypewriter text="Hello" options={{ speed: 50, delay: 0 }} />,
		);
		const target = getByTestId("target");
		expect(target.getAttribute("aria-label")).toBe("Hello");
	});

	it("types out text and completes", () => {
		const { getByTestId } = render(
			<TestTypewriter text="Hi" options={{ speed: 50, delay: 0 }} />,
		);

		// Advance past all characters (delay=0, 2 chars * 50ms = 100ms)
		act(() => {
			vi.advanceTimersByTime(150);
		});

		const target = getByTestId("target");
		const textSpan = target.querySelector("span[aria-hidden]");
		expect(textSpan?.textContent).toBe("Hi");
		expect(getByTestId("complete").textContent).toBe("true");
	});

	it("shows cursor when enabled", () => {
		const { getByTestId } = render(
			<TestTypewriter text="Hi" options={{ cursor: true, cursorChar: "|" }} />,
		);
		const target = getByTestId("target");
		const cursor = target.querySelector("[data-tw-cursor]");
		expect(cursor).not.toBeNull();
		expect(cursor?.textContent).toBe("|");
	});
});

describe("useScramble", () => {
	it("renders with aria-label", () => {
		const { getByTestId } = render(
			<TestScramble text="Hello" options={{ speed: 30, duration: 300 }} />,
		);
		const target = getByTestId("target");
		expect(target.getAttribute("aria-label")).toBe("Hello");
	});

	it("completes with correct text", () => {
		const { getByTestId } = render(
			<TestScramble text="Hello" options={{ speed: 30, duration: 300 }} />,
		);

		act(() => {
			vi.advanceTimersByTime(400);
		});

		const target = getByTestId("target");
		const textSpan = target.querySelector("span[aria-hidden]");
		expect(textSpan?.textContent).toBe("Hello");
		expect(getByTestId("complete").textContent).toBe("true");
	});
});
