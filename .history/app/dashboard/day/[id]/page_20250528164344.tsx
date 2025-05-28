import DayView from "@/components/day-view"

export default function DayPage({ params }: { params: { id: string } }) {
  return <DayView dayId={Number.parseInt(params.id)} />
}
