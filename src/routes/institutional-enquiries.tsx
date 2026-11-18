import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/institutional-enquiries")({
  beforeLoad: () => {
    throw redirect({ to: "/vantoris/enquire" });
  },
});
