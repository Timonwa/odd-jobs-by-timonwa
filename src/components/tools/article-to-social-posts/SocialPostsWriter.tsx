"use client";

import { socialPostsRuntime } from "@/lib/config/social-posts-writer";
import { Writer } from "@/components/_shared/writer/Writer";

/** The Article-to-Social-Posts writer — the shared engine wired to this tool's stores, actions, and features. */
export function SocialPostsWriter() {
	return <Writer runtime={socialPostsRuntime} />;
}
