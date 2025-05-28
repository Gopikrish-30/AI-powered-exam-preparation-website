import QuizPage from "@/components/quiz-page"

export default function Quiz({ params }: { params: { id: string } }) {
  return <QuizPage dayId={Number.parseInt(params.id)} />
}
