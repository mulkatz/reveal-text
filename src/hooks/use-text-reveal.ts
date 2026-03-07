import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { AnimationControls, RevealOptions } from "../types";
import { splitText } from "../utils/split";
import { useIntersection } from "../utils/use-intersection";

const EFFECT_STYLES: Record<string, { from: string; to: string }> = {
	"fade-up": {
		from: "opacity:0;transform:translateY(0.5em)",
		to: "opacity:1;transform:translateY(0)",
	},
	"fade-down": {
		from: "opacity:0;transform:translateY(-0.5em)",
		to: "opacity:1;transform:translateY(0)",
	},
	"fade-in": {
		from: "opacity:0",
		to: "opacity:1",
	},
	"blur-in": {
		from: "opacity:0;filter:blur(8px)",
		to: "opacity:1;filter:blur(0px)",
	},
	"slide-up": {
		from: "opacity:0;transform:translateY(100%)",
		to: "opacity:1;transform:translateY(0)",
	},
	"slide-down": {
		from: "opacity:0;transform:translateY(-100%)",
		to: "opacity:1;transform:translateY(0)",
	},
};

function getStylesheetId(id: string) {
	return `text-reveal-${id}`;
}

function injectStyles(
	id: string,
	effect: string,
	duration: number,
	easing: string,
) {
	const styleId = getStylesheetId(id);
	if (document.getElementById(styleId)) return;

	const styles = EFFECT_STYLES[effect];
	if (!styles) return;

	const keyframeName = `tr-${id}`;
	const css = `
@keyframes ${keyframeName} {
  from { ${styles.from} }
  to { ${styles.to} }
}
[data-tr-id="${id}"] [data-tr-segment] {
  ${styles.from};
  animation: ${keyframeName} ${duration}ms ${easing} forwards;
}`;

	const style = document.createElement("style");
	style.id = styleId;
	style.textContent = css;
	document.head.appendChild(style);
}

function removeStyles(id: string) {
	document.getElementById(getStylesheetId(id))?.remove();
}

export function useTextReveal(
	text: string,
	options: RevealOptions = {},
): AnimationControls & { ref: React.RefCallback<HTMLElement> } {
	const {
		split = "word",
		effect = "fade-up",
		stagger = 50,
		duration = 500,
		easing = "cubic-bezier(0.22, 1, 0.36, 1)",
		triggerOnScroll = false,
		threshold = 0.1,
		autoPlay = true,
		className,
	} = options;

	const reactId = useId().replace(/:/g, "");
	const idRef = useRef(reactId);
	const id = idRef.current;
	const [isPlaying, setIsPlaying] = useState(false);
	const [isComplete, setIsComplete] = useState(false);
	const containerRef = useRef<HTMLElement | null>(null);
	const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

	const [intersectionRef, isVisible] = useIntersection(
		threshold,
		triggerOnScroll,
	);

	const segments = splitText(text, split);

	const clearTimeouts = useCallback(() => {
		for (const t of timeoutsRef.current) clearTimeout(t);
		timeoutsRef.current = [];
	}, []);

	const render = useCallback(
		(container: HTMLElement, shouldAnimate: boolean) => {
			container.setAttribute("data-tr-id", id);
			container.setAttribute("aria-label", text);

			if (shouldAnimate) {
				injectStyles(id, effect, duration, easing);
			}

			const fragment = document.createDocumentFragment();

			for (let i = 0; i < segments.length; i++) {
				const segment = segments[i];
				if (segment === undefined) continue;
				const span = document.createElement("span");
				span.setAttribute("data-tr-segment", "");
				span.setAttribute("aria-hidden", "true");
				span.style.display = split === "line" ? "block" : "inline-block";
				if (split === "char" && segment === " ") {
					span.style.whiteSpace = "pre";
				}
				if (className) {
					span.className = className;
				}
				if (shouldAnimate) {
					span.style.animationDelay = `${i * stagger}ms`;
				}
				span.textContent = segment;
				fragment.appendChild(span);
			}

			container.textContent = "";
			container.appendChild(fragment);

			if (shouldAnimate) {
				setIsPlaying(true);
				setIsComplete(false);

				const totalDuration = (segments.length - 1) * stagger + duration;
				const completionTimeout = setTimeout(() => {
					setIsPlaying(false);
					setIsComplete(true);
				}, totalDuration);
				timeoutsRef.current.push(completionTimeout);
			}
		},
		[id, text, segments, split, effect, stagger, duration, easing, className],
	);

	const replay = useCallback(() => {
		clearTimeouts();
		removeStyles(id);

		if (containerRef.current) {
			// Force reflow for animation restart
			void containerRef.current.offsetHeight;
			render(containerRef.current, true);
		}
	}, [id, clearTimeouts, render]);

	const refCallback = useCallback(
		(node: HTMLElement | null) => {
			containerRef.current = node;
			intersectionRef(node);

			if (!node) return;

			const shouldAnimate = triggerOnScroll ? false : autoPlay;
			render(node, shouldAnimate);
		},
		[intersectionRef, triggerOnScroll, autoPlay, render],
	);

	// Handle scroll trigger
	useEffect(() => {
		if (triggerOnScroll && isVisible && containerRef.current) {
			render(containerRef.current, true);
		}
	}, [triggerOnScroll, isVisible, render]);

	// Cleanup
	useEffect(() => {
		return () => {
			clearTimeouts();
			removeStyles(id);
		};
	}, [id, clearTimeouts]);

	return { ref: refCallback, replay, isPlaying, isComplete };
}
