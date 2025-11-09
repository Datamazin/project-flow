import WorkspaceScreen from "@/components/workspace/workspace-screen";

export const dynamic = "force-static";
export const revalidate = false;

export default function Home() {
  return <WorkspaceScreen />;
}
