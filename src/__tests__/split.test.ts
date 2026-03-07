import { describe, expect, it } from "vitest";
import { splitText } from "../utils/split";

describe("splitText", () => {
	describe("char mode", () => {
		it("splits into individual characters", () => {
			expect(splitText("Hello", "char")).toEqual(["H", "e", "l", "l", "o"]);
		});

		it("preserves spaces as characters", () => {
			expect(splitText("Hi there", "char")).toEqual([
				"H",
				"i",
				" ",
				"t",
				"h",
				"e",
				"r",
				"e",
			]);
		});

		it("handles emoji correctly", () => {
			const result = splitText("Hi 👋", "char");
			expect(result).toEqual(["H", "i", " ", "👋"]);
		});

		it("handles empty string", () => {
			expect(splitText("", "char")).toEqual([]);
		});
	});

	describe("word mode", () => {
		it("splits by words with space attached", () => {
			const result = splitText("Hello beautiful world", "word");
			expect(result).toEqual(["Hello ", "beautiful ", "world"]);
		});

		it("handles single word", () => {
			expect(splitText("Hello", "word")).toEqual(["Hello"]);
		});

		it("handles empty string", () => {
			expect(splitText("", "word")).toEqual([]);
		});
	});

	describe("line mode", () => {
		it("splits by newlines", () => {
			expect(splitText("Line 1\nLine 2\nLine 3", "line")).toEqual([
				"Line 1",
				"Line 2",
				"Line 3",
			]);
		});

		it("handles single line", () => {
			expect(splitText("Single line", "line")).toEqual(["Single line"]);
		});
	});
});
