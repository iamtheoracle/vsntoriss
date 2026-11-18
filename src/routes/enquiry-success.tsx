import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/enquiry-success")({
  beforeLoad: () => {
    throw redirect({ to: "/ashcombe/enquire" });
  },
});
