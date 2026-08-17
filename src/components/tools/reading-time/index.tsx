import { ClockIcon } from "lucide-react";

import { ClientToolPage } from "@/components/_shared/page/ClientToolPage";
import { ReadingTimeTool } from "./ReadingTimeTool";

export function ReadingTimePageContent() {
	return (
		<ClientToolPage
			slug="reading-time"
			name="Reading Time Estimator"
			icon={ClockIcon}
			eyebrowLabel="Reading time estimator"
			title={
				<>
					How long is your <span className="hero-gradient-text">read</span>?
				</>
			}
			subtitle="Paste an article to see reading and speaking time at your chosen pace — and grab a copy-ready “X min read” label for the top of your post. Nothing leaves your browser."
		>
			<ReadingTimeTool />
		</ClientToolPage>
	);
}
