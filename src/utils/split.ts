import type { SplitMode } from "../types";

export function splitText(text: string, mode: SplitMode): string[] {
	switch (mode) {
		case "char":
			return Array.from(text);
		case "word":
			return splitByWord(text);
		case "line":
			return text.split("\n");
	}
}

/** Split by word while preserving whitespace as part of the preceding word */
function splitByWord(text: string): string[] {
	const result: string[] = [];
	let current = "";

	for (const char of text) {
		if (char === " " || char === "\t") {
			if (current) {
				result.push(current + char);
				current = "";
			} else {
				// leading whitespace — attach to next word
				current = char;
			}
		} else {
			current += char;
		}
	}

	if (current) {
		result.push(current);
	}

	return result;
}
