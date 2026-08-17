import { PilcrowIcon } from "lucide-react";

import { ClientToolPage } from "@/components/_shared/page/ClientToolPage";
import { LoremIpsumTool } from "./LoremIpsumTool";

export function LoremIpsumPageContent() {
	return (
		<ClientToolPage
			slug="lorem-ipsum"
			name="Lorem Ipsum Generator"
			icon={PilcrowIcon}
			eyebrowLabel="Lorem ipsum"
			title={
				<>
					Instant <span className="hero-gradient-text">placeholder text</span>
				</>
			}
			subtitle="Generate lorem ipsum by the paragraph, sentence, or word — choose how much, regenerate for a fresh batch, and copy it into your mockup. Runs entirely in your browser."
			constrained
		>
			<LoremIpsumTool />
		</ClientToolPage>
	);
}
