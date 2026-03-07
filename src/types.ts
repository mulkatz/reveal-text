export type SplitMode = "char" | "word" | "line";

export type RevealEffect =
	| "fade-up"
	| "fade-down"
	| "fade-in"
	| "blur-in"
	| "slide-up"
	| "slide-down";

export interface RevealOptions {
	/** How to split the text for staggered animation */
	split?: SplitMode;
	/** Animation effect to apply */
	effect?: RevealEffect;
	/** Delay between each element in ms */
	stagger?: number;
	/** Animation duration in ms */
	duration?: number;
	/** Easing function (CSS easing string) */
	easing?: string;
	/** Trigger animation when element enters viewport */
	triggerOnScroll?: boolean;
	/** IntersectionObserver threshold (0-1) */
	threshold?: number;
	/** Start animation on mount (if not scroll-triggered) */
	autoPlay?: boolean;
	/** Custom class to add to each animated segment */
	className?: string;
}

export interface TypewriterOptions {
	/** Speed in ms per character */
	speed?: number;
	/** Delay before starting in ms */
	delay?: number;
	/** Show blinking cursor */
	cursor?: boolean;
	/** Custom cursor character */
	cursorChar?: string;
	/** Loop the animation */
	loop?: boolean;
	/** Pause at end before looping in ms */
	pauseAtEnd?: number;
	/** Delete speed when looping in ms */
	deleteSpeed?: number;
	/** Trigger on scroll into view */
	triggerOnScroll?: boolean;
	/** IntersectionObserver threshold */
	threshold?: number;
}

export interface ScrambleOptions {
	/** Speed of scramble iterations in ms */
	speed?: number;
	/** Duration of the scramble effect in ms */
	duration?: number;
	/** Characters to use for scrambling */
	characters?: string;
	/** Trigger on scroll into view */
	triggerOnScroll?: boolean;
	/** IntersectionObserver threshold */
	threshold?: number;
}

export interface AnimationControls {
	/** Replay the animation from the beginning */
	replay: () => void;
	/** Whether the animation is currently playing */
	isPlaying: boolean;
	/** Whether the animation has completed */
	isComplete: boolean;
}
