import { FingerprintIcon } from "lucide-react";

import { ClientToolPage } from "@/components/_shared/page/ClientToolPage";
import { HashGeneratorTool } from "./HashGeneratorTool";

export function HashGeneratorPageContent() {
	return (
		<ClientToolPage
			slug="hash-generator"
			name="Hash Generator"
			icon={FingerprintIcon}
			eyebrowLabel="Hash generator"
			title={
				<>
					Hash text <span className="hero-gradient-text">in your browser</span>
				</>
			}
			subtitle="Type or paste text and get its SHA-1, SHA-256, SHA-384, and SHA-512 digests instantly — computed locally with the Web Crypto API, so nothing is ever uploaded."
			constrained
		>
			<HashGeneratorTool />
		</ClientToolPage>
	);
}
