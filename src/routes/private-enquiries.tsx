import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/private-enquiries")({
  beforeLoad: () => {
    throw redirect({ to: "/ashcombe/enquire" });
  },
});
