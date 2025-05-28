import DayView from "@/components/day-view"

export default async function DayPage({ params }: { params: { id: string } }) {
  await params
  return <DayView dayId={Number.parseInt(params.id)} />
