import QuizPage from "@/components/quiz-page"

export default async function Quiz({ params }: { params: { id: string } }) {
  await params
  return <QuizPage dayId={Number.parseInt(params.id)} />
