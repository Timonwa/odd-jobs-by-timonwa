import { WholeWordIcon } from "lucide-react";

import { ClientToolPage } from "@/components/_shared/page";
import { WordCounterTool } from "./WordCounterTool";

export function WordCounterPageContent() {
	return (
		<ClientToolPage
			slug="word-counter"
			name="Word & Character Counter"
			icon={WholeWordIcon}
			eyebrowLabel="Word & character counter"
			title={
				<>
					Count every <span className="hero-gradient-text">word</span> as you
					type
				</>
			}
			subtitle="Live word, character, sentence, and paragraph counts — plus reading time and the character limits that matter for SEO and social. Counted on this page, never uploaded."
		>
			<WordCounterTool />
		</ClientToolPage>
	);
}
