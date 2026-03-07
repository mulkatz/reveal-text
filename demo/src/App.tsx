import { useState, useCallback } from "react";
import { useTextReveal, useTypewriter, useScramble, TextReveal } from "reveal-text";

function DemoSection({
	title,
	children,
	code,
}: {
	title: string;
	children: React.ReactNode;
	code: string;
}) {
	return (
		<section className="py-16 border-b border-white/5">
			<div className="max-w-3xl mx-auto px-6">
				<p className="text-xs uppercase tracking-[0.2em] text-white/30 mb-8 font-mono">
					{title}
				</p>
				<div className="mb-8 min-h-[80px] flex items-center">{children}</div>
				<pre className="text-xs text-white/20 font-mono overflow-x-auto">
					<code>{code}</code>
				</pre>
			</div>
		</section>
	);
}

function FadeUpWordDemo() {
	const [key, setKey] = useState(0);
	const { ref } = useTextReveal("Every word appears with a gentle upward fade.", {
		split: "word",
		effect: "fade-up",
		stagger: 60,
		duration: 500,
	});

	return (
		<div>
			<p
				ref={ref}
				key={key}
				className="text-2xl md:text-3xl font-light leading-relaxed tracking-tight cursor-pointer"
				onClick={() => setKey((k) => k + 1)}
			/>
		</div>
	);
}

function FadeUpCharDemo() {
	const [key, setKey] = useState(0);
	const { ref } = useTextReveal("Character by character.", {
		split: "char",
		effect: "fade-up",
		stagger: 25,
		duration: 400,
	});

	return (
		<p
			ref={ref}
			key={key}
			className="text-2xl md:text-3xl font-light tracking-tight cursor-pointer"
			onClick={() => setKey((k) => k + 1)}
		/>
	);
}

function BlurInDemo() {
	const [key, setKey] = useState(0);
	const { ref } = useTextReveal("Emerging from the blur into clarity.", {
		split: "word",
		effect: "blur-in",
		stagger: 70,
		duration: 600,
	});

	return (
		<p
			ref={ref}
			key={key}
			className="text-2xl md:text-3xl font-light tracking-tight cursor-pointer"
			onClick={() => setKey((k) => k + 1)}
		/>
	);
}

function SlideUpDemo() {
	const [key, setKey] = useState(0);
	const { ref } = useTextReveal("Words sliding into position.", {
		split: "word",
		effect: "slide-up",
		stagger: 80,
		duration: 500,
	});

	return (
		<p
			ref={ref}
			key={key}
			className="text-2xl md:text-3xl font-light tracking-tight cursor-pointer overflow-hidden"
			onClick={() => setKey((k) => k + 1)}
		/>
	);
}

function TypewriterDemo() {
	const [key, setKey] = useState(0);
	const { ref } = useTypewriter(
		["Build something beautiful.", "Ship it fast.", "Make it accessible."],
		{
			speed: 45,
			cursor: true,
			loop: true,
			pauseAtEnd: 2000,
			deleteSpeed: 25,
		},
	);

	return (
		<p
			ref={ref}
			key={key}
			className="text-2xl md:text-3xl font-light tracking-tight font-mono cursor-pointer"
			onClick={() => setKey((k) => k + 1)}
		/>
	);
}

function ScrambleDemo() {
	const [key, setKey] = useState(0);
	const { ref } = useScramble("Decrypting the message...", {
		speed: 25,
		duration: 1200,
	});

	return (
		<p
			ref={ref}
			key={key}
			className="text-2xl md:text-3xl font-light tracking-tight font-mono cursor-pointer"
			onClick={() => setKey((k) => k + 1)}
		/>
	);
}

function PresetDemo() {
	const [key, setKey] = useState(0);

	return (
		<div
			className="space-y-4 cursor-pointer"
			onClick={() => setKey((k) => k + 1)}
		>
			<TextReveal
				key={`a-${key}`}
				preset="blur-in-char"
				as="p"
				className="text-2xl md:text-3xl font-light tracking-tight"
			>
				One component. Eleven presets.
			</TextReveal>
		</div>
	);
}

function InstallBlock() {
	const [copied, setCopied] = useState(false);
	const cmd = "npm install reveal-text";

	const copy = useCallback(() => {
		navigator.clipboard.writeText(cmd);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, []);

	return (
		<button
			onClick={copy}
			className="inline-flex items-center gap-3 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-mono text-sm transition-colors cursor-pointer"
		>
			<span className="text-white/40">$</span>
			<span>{cmd}</span>
			<span className="text-white/30 text-xs ml-2">
				{copied ? "copied!" : "click to copy"}
			</span>
		</button>
	);
}

export default function App() {
	return (
		<div className="min-h-screen">
			{/* Hero */}
			<header className="pt-24 pb-16 px-6">
				<div className="max-w-3xl mx-auto">
					<p className="text-xs uppercase tracking-[0.3em] text-white/25 mb-6 font-mono">
						text-reveal
					</p>
					<h1 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.1] mb-6">
						<TextReveal preset="fade-up-word" as="span">
							Lightweight text animations for React
						</TextReveal>
					</h1>
					<p className="text-lg text-white/40 mb-10 max-w-lg leading-relaxed">
						Typewriter, reveal, scramble — all in one tiny package. Zero
						dependencies. Accessible. Under 3KB gzipped.
					</p>
					<InstallBlock />
				</div>
			</header>

			{/* Demos */}
			<DemoSection
				title="Fade Up — Words"
				code={`const { ref } = useTextReveal("Your text here", {
  split: "word", effect: "fade-up", stagger: 60
});`}
			>
				<FadeUpWordDemo />
			</DemoSection>

			<DemoSection
				title="Fade Up — Characters"
				code={`const { ref } = useTextReveal("Your text", {
  split: "char", effect: "fade-up", stagger: 25
});`}
			>
				<FadeUpCharDemo />
			</DemoSection>

			<DemoSection
				title="Blur In"
				code={`const { ref } = useTextReveal("Your text", {
  split: "word", effect: "blur-in", stagger: 70
});`}
			>
				<BlurInDemo />
			</DemoSection>

			<DemoSection
				title="Slide Up"
				code={`const { ref } = useTextReveal("Your text", {
  split: "word", effect: "slide-up", stagger: 80
});`}
			>
				<SlideUpDemo />
			</DemoSection>

			<DemoSection
				title="Typewriter"
				code={`const { ref } = useTypewriter(
  ["First text.", "Second text."],
  { speed: 45, cursor: true, loop: true }
);`}
			>
				<TypewriterDemo />
			</DemoSection>

			<DemoSection
				title="Scramble"
				code={`const { ref } = useScramble("Your text", {
  speed: 25, duration: 1200
});`}
			>
				<ScrambleDemo />
			</DemoSection>

			<DemoSection
				title="Component with Presets"
				code={`<TextReveal preset="blur-in-char" as="h1">
  One component. Eleven presets.
</TextReveal>`}
			>
				<PresetDemo />
			</DemoSection>

			{/* Click hint */}
			<div className="py-8 text-center">
				<p className="text-xs text-white/15 font-mono">
					click any demo to replay the animation
				</p>
			</div>

			{/* Footer */}
			<footer className="py-16 px-6 border-t border-white/5">
				<div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-white/20 font-mono">
					<span>text-reveal</span>
					<div className="flex gap-6">
						<a
							href="https://github.com/mulkatz/reveal-text"
							className="hover:text-white/50 transition-colors"
						>
							github
						</a>
						<a
							href="https://www.npmjs.com/package/reveal-text"
							className="hover:text-white/50 transition-colors"
						>
							npm
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
