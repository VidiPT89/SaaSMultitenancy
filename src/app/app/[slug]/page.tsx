import { WorkspaceDesk } from '@/components/app/WorkspaceDesk'

export default async function WorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <WorkspaceDesk slug={slug} />
}
