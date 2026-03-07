import { createElement } from "react";
import { useScramble } from "../hooks/use-scramble";
import { useTextReveal } from "../hooks/use-text-reveal";
import { useTypewriter } from "../hooks/use-typewriter";
import type {
	RevealOptions,
	ScrambleOptions,
	TypewriterOptions,
} from "../types";

type Preset =
	| "fade-up-word"
	| "fade-up-char"
	| "fade-down-word"
	| "fade-in-word"
	| "fade-in-char"
	| "blur-in-word"
	| "blur-in-char"
	| "slide-up-word"
	| "slide-up-line"
	| "typewriter"
	| "scramble";

const PRESETS: Record<
	Preset,
	| { type: "reveal"; options: RevealOptions }
	| { type: "typewriter"; options: TypewriterOptions }
	| { type: "scramble"; options: ScrambleOptions }
> = {
	"fade-up-word": {
		type: "reveal",
		options: { split: "word", effect: "fade-up" },
	},
	"fade-up-char": {
		type: "reveal",
		options: { split: "char", effect: "fade-up", stagger: 20 },
	},
	"fade-down-word": {
		type: "reveal",
		options: { split: "word", effect: "fade-down" },
	},
	"fade-in-word": {
		type: "reveal",
		options: { split: "word", effect: "fade-in" },
	},
	"fade-in-char": {
		type: "reveal",
		options: { split: "char", effect: "fade-in", stagger: 20 },
	},
	"blur-in-word": {
		type: "reveal",
		options: { split: "word", effect: "blur-in", stagger: 60, duration: 600 },
	},
	"blur-in-char": {
		type: "reveal",
		options: { split: "char", effect: "blur-in", stagger: 25, duration: 400 },
	},
	"slide-up-word": {
		type: "reveal",
		options: { split: "word", effect: "slide-up" },
	},
	"slide-up-line": {
		type: "reveal",
		options: { split: "line", effect: "slide-up", stagger: 100 },
	},
	typewriter: { type: "typewriter", options: {} },
	scramble: { type: "scramble", options: {} },
};

interface TextRevealProps
	extends RevealOptions,
		TypewriterOptions,
		ScrambleOptions {
	children: string;
	as?: string;
	preset?: Preset;
	className?: string;
	style?: React.CSSProperties;
}

function RevealInner({
	text,
	options,
	as,
	className,
	style,
}: {
	text: string;
	options: RevealOptions;
	as: string;
	className?: string;
	style?: React.CSSProperties;
}) {
	const { ref } = useTextReveal(text, options);
	return createElement(as, { ref, className, style });
}

function TypewriterInner({
	text,
	options,
	as,
	className,
	style,
}: {
	text: string;
	options: TypewriterOptions;
	as: string;
	className?: string;
	style?: React.CSSProperties;
}) {
	const { ref } = useTypewriter(text, options);
	return createElement(as, { ref, className, style });
}

function ScrambleInner({
	text,
	options,
	as,
	className,
	style,
}: {
	text: string;
	options: ScrambleOptions;
	as: string;
	className?: string;
	style?: React.CSSProperties;
}) {
	const { ref } = useScramble(text, options);
	return createElement(as, { ref, className, style });
}

export function TextReveal({
	children,
	as = "span",
	preset = "fade-up-word",
	className,
	style,
	...rest
}: TextRevealProps) {
	const presetConfig = PRESETS[preset];

	if (presetConfig.type === "typewriter") {
		const options = { ...presetConfig.options, ...rest } as TypewriterOptions;
		return (
			<TypewriterInner
				text={children}
				options={options}
				as={as}
				className={className}
				style={style}
			/>
		);
	}

	if (presetConfig.type === "scramble") {
		const options = { ...presetConfig.options, ...rest } as ScrambleOptions;
		return (
			<ScrambleInner
				text={children}
				options={options}
				as={as}
				className={className}
				style={style}
			/>
		);
	}

	const options = { ...presetConfig.options, ...rest } as RevealOptions;
	return (
		<RevealInner
			text={children}
			options={options}
			as={as}
			className={className}
			style={style}
		/>
	);
}
