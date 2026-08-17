import { CaseSensitiveIcon } from "lucide-react";

import { ClientToolPage } from "@/components/_shared/page/ClientToolPage";
import { CaseConverterTool } from "./CaseConverterTool";

export function CaseConverterPageContent() {
	return (
		<ClientToolPage
			slug="case-converter"
			name="Case Converter"
			icon={CaseSensitiveIcon}
			eyebrowLabel="Case converter"
			title={
				<>
					Fix the <span className="hero-gradient-text">case</span> in one click
				</>
			}
			subtitle="Switch text between UPPERCASE, Title Case, Sentence case, camelCase, snake_case, and more — instantly, then copy. Nothing leaves your browser."
		>
			<CaseConverterTool />
		</ClientToolPage>
	);
}
