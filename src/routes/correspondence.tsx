import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/correspondence")({
  beforeLoad: () => {
    throw redirect({ to: "/ashcombe/office" });
  },
});
