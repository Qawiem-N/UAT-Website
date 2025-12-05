import { ProjectDetailScreen } from "../../../../components/pages/project-detail-screen";

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  return <ProjectDetailScreen projectId={params.projectId} />;
}

