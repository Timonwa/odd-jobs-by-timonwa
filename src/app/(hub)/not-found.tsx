import { NotFoundContent } from "@/components/errors/not-found";

// The group's own boundary, so an unknown blog/newsletter/shop slug renders
// inside this layout's navbar instead of adding a second one.
export default function HubNotFound() {
	return <NotFoundContent withNavbar={false} />;
}
