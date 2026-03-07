import { useCallback, useEffect, useRef, useState } from "react";
import type { AnimationControls, ScrambleOptions } from "../types";
import { useIntersection } from "../utils/use-intersection";

const DEFAULT_CHARS =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

function randomChar(chars: string): string {
	return chars[Math.floor(Math.random() * chars.length)] ?? "?";
}

export function useScramble(
	text: string,
	options: ScrambleOptions = {},
): AnimationControls & { ref: React.RefCallback<HTMLElement> } {
	const {
		speed = 30,
		duration = 1500,
		characters = DEFAULT_CHARS,
		triggerOnScroll = false,
		threshold = 0.1,
	} = options;

	const [isPlaying, setIsPlaying] = useState(false);
	const [isComplete, setIsComplete] = useState(false);
	const containerRef = useRef<HTMLElement | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const [intersectionRef, isVisible] = useIntersection(
		threshold,
		triggerOnScroll,
	);

	const animate = useCallback(
		(container: HTMLElement) => {
			container.setAttribute("aria-label", text);

			const textSpan = document.createElement("span");
			textSpan.setAttribute("aria-hidden", "true");
			container.textContent = "";
			container.appendChild(textSpan);

			setIsPlaying(true);
			setIsComplete(false);

			const chars = Array.from(text);
			const totalChars = chars.length;
			let revealedCount = 0;
			const startTime = Date.now();

			if (intervalRef.current) clearInterval(intervalRef.current);

			intervalRef.current = setInterval(() => {
				const elapsed = Date.now() - startTime;
				revealedCount = Math.min(
					totalChars,
					Math.floor((elapsed / duration) * totalChars),
				);

				let display = "";
				for (let i = 0; i < totalChars; i++) {
					const char = chars[i];
					if (char === undefined) continue;

					if (i < revealedCount) {
						display += char;
					} else if (char === " ") {
						display += " ";
					} else {
						display += randomChar(characters);
					}
				}

				textSpan.textContent = display;

				if (revealedCount >= totalChars) {
					if (intervalRef.current) clearInterval(intervalRef.current);
					textSpan.textContent = text;
					setIsPlaying(false);
					setIsComplete(true);
				}
			}, speed);
		},
		[text, speed, duration, characters],
	);

	const replay = useCallback(() => {
		if (intervalRef.current) clearInterval(intervalRef.current);
		if (containerRef.current) {
			animate(containerRef.current);
		}
	}, [animate]);

	const started = useRef(false);

	const refCallback = useCallback(
		(node: HTMLElement | null) => {
			containerRef.current = node;
			intersectionRef(node);

			if (!node) return;

			if (!triggerOnScroll && !started.current) {
				started.current = true;
				animate(node);
			}
		},
		[intersectionRef, triggerOnScroll, animate],
	);

	useEffect(() => {
		if (
			triggerOnScroll &&
			isVisible &&
			containerRef.current &&
			!started.current
		) {
			started.current = true;
			animate(containerRef.current);
		}
	}, [triggerOnScroll, isVisible, animate]);

	useEffect(() => {
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, []);

	return { ref: refCallback, replay, isPlaying, isComplete };
}
