import { PlusIcon } from "lucide-react";
import type { ComponentType } from "react";

import { MoreTools } from "./MoreTools";
import { Newsletter } from "./Newsletter";

type ToolFaqType = { question: string; answer: string };

/** The SEO content block below a tool — MDX article, FAQ (FAQPage JSON-LD), and a "more tools" grid; copy from `content/tools/<slug>.mdx`. */
export async function ToolContent({ currentSlug }: { currentSlug: string }) {
	const mod = await import(`@/content/tools/${currentSlug}.mdx`);
	const Article = mod.default as ComponentType;
	const faq = (mod as { faq: ToolFaqType[] }).faq;

	const faqJsonLd = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faq.map((f) => ({
			"@type": "Question",
			name: f.question,
			acceptedAnswer: { "@type": "Answer", text: f.answer },
		})),
	};

	return (
		<>
			<Newsletter className="mt-16" />

			<div className="mt-16 flex flex-col gap-12 border-t border-border/60 pt-12">
				<article className="max-w-3xl">
					<Article />
				</article>

				<section
					aria-labelledby="faq-heading"
					className="max-w-3xl flex flex-col gap-4"
				>
					<h2 id="faq-heading" className="text-xl font-semibold tracking-tight">
						Frequently asked questions
					</h2>
					<div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border">
						{faq.map((item) => (
							<details key={item.question} className="group">
								<summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
									{item.question}
									<PlusIcon
										aria-hidden
										className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
									/>
								</summary>
								<p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
									{item.answer}
								</p>
							</details>
						))}
					</div>
				</section>

				<MoreTools currentSlug={currentSlug} />

				<script
					type="application/ld+json"
					// FAQPage structured data — eligible for FAQ rich results.
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
					}}
				/>
			</div>
		</>
	);
}
