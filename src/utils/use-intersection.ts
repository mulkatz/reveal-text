import { useEffect, useRef, useState } from "react";

export function useIntersection(
	threshold: number,
	enabled: boolean,
): [React.RefCallback<HTMLElement>, boolean] {
	const [isVisible, setIsVisible] = useState(false);
	const observerRef = useRef<IntersectionObserver | null>(null);
	const hasTriggered = useRef(false);

	useEffect(() => {
		return () => {
			observerRef.current?.disconnect();
		};
	}, []);

	const refCallback = (node: HTMLElement | null) => {
		observerRef.current?.disconnect();

		if (!node || !enabled || hasTriggered.current) return;

		if (typeof IntersectionObserver === "undefined") {
			setIsVisible(true);
			hasTriggered.current = true;
			return;
		}

		observerRef.current = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setIsVisible(true);
					hasTriggered.current = true;
					observerRef.current?.disconnect();
				}
			},
			{ threshold },
		);

		observerRef.current.observe(node);
	};

	return [refCallback, isVisible];
}
