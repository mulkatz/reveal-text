import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { AnimationControls, TypewriterOptions } from "../types";
import { useIntersection } from "../utils/use-intersection";

export function useTypewriter(
	text: string | string[],
	options: TypewriterOptions = {},
): AnimationControls & { ref: React.RefCallback<HTMLElement> } {
	const {
		speed = 50,
		delay = 0,
		cursor = true,
		cursorChar = "|",
		loop = false,
		pauseAtEnd = 1500,
		deleteSpeed = 30,
		triggerOnScroll = false,
		threshold = 0.1,
	} = options;

	const texts = Array.isArray(text) ? text : [text];
	const fullText = texts.join("");
	const reactId = useId().replace(/:/g, "");

	const [isPlaying, setIsPlaying] = useState(false);
	const [isComplete, setIsComplete] = useState(false);
	const containerRef = useRef<HTMLElement | null>(null);
	const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const styleRef = useRef<HTMLStyleElement | null>(null);

	const [intersectionRef, isVisible] = useIntersection(
		threshold,
		triggerOnScroll,
	);

	const injectCursorStyle = useCallback(() => {
		if (styleRef.current || !cursor) return;
		const style = document.createElement("style");
		style.id = `tw-cursor-${reactId}`;
		style.textContent = `
@keyframes tw-blink-${reactId} {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
[data-tw-id="${reactId}"] [data-tw-cursor] {
  animation: tw-blink-${reactId} 0.8s step-end infinite;
  margin-left: 1px;
  font-weight: 100;
}`;
		document.head.appendChild(style);
		styleRef.current = style;
	}, [reactId, cursor]);

	const animate = useCallback(
		(container: HTMLElement) => {
			container.setAttribute("data-tw-id", reactId);
			container.setAttribute("aria-label", fullText);

			injectCursorStyle();

			const textSpan = document.createElement("span");
			textSpan.setAttribute("aria-hidden", "true");
			container.textContent = "";
			container.appendChild(textSpan);

			let cursorSpan: HTMLSpanElement | null = null;
			if (cursor) {
				cursorSpan = document.createElement("span");
				cursorSpan.setAttribute("data-tw-cursor", "");
				cursorSpan.setAttribute("aria-hidden", "true");
				cursorSpan.textContent = cursorChar;
				container.appendChild(cursorSpan);
			}

			setIsPlaying(true);
			setIsComplete(false);

			let textIndex = 0;
			let charIndex = 0;
			let isDeleting = false;

			const tick = () => {
				const currentText = texts[textIndex];
				if (!currentText) return;

				if (!isDeleting) {
					textSpan.textContent = currentText.slice(0, charIndex + 1);
					charIndex++;

					if (charIndex >= currentText.length) {
						const isLastText = textIndex >= texts.length - 1;

						if (!loop && isLastText) {
							setIsPlaying(false);
							setIsComplete(true);
							return;
						}

						rafRef.current = setTimeout(() => {
							isDeleting = true;
							tick();
						}, pauseAtEnd);
						return;
					}

					rafRef.current = setTimeout(tick, speed);
				} else {
					textSpan.textContent = currentText.slice(0, charIndex - 1);
					charIndex--;

					if (charIndex <= 0) {
						isDeleting = false;
						textIndex = (textIndex + 1) % texts.length;

						if (!loop && textIndex === 0) {
							setIsPlaying(false);
							setIsComplete(true);
							return;
						}

						rafRef.current = setTimeout(tick, speed);
						return;
					}

					rafRef.current = setTimeout(tick, deleteSpeed);
				}
			};

			rafRef.current = setTimeout(tick, delay);
		},
		[
			reactId,
			texts,
			fullText,
			speed,
			delay,
			cursor,
			cursorChar,
			loop,
			pauseAtEnd,
			deleteSpeed,
			injectCursorStyle,
		],
	);

	const replay = useCallback(() => {
		if (rafRef.current) clearTimeout(rafRef.current);
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
			if (rafRef.current) clearTimeout(rafRef.current);
			styleRef.current?.remove();
		};
	}, []);

	return { ref: refCallback, replay, isPlaying, isComplete };
}
