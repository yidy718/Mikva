'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MessageCircle, ThumbsUp, Send, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'

const questionSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters'),
})

const answerSchema = z.object({
  answer: z.string().min(10, 'Answer must be at least 10 characters'),
})

type QuestionFormData = z.infer<typeof questionSchema>
type AnswerFormData = z.infer<typeof answerSchema>

interface Question {
  id: string
  question: string
  is_answered: boolean
  created_at: string
  answers?: Answer[]
}

interface Answer {
  id: string
  answer: string
  is_helpful_count: number
  is_from_admin: boolean
  created_at: string
}

interface QASectionProps {
  mikvahId: string
}

export function QASection({ mikvahId }: QASectionProps) {
  const { t } = useTranslation()
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null)
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({})
  const supabase = createClient()

  const {
    register: registerQuestion,
    handleSubmit: handleSubmitQuestion,
    formState: { errors: questionErrors },
    reset: resetQuestion,
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
  })

  const {
    register: registerAnswer,
    handleSubmit: handleSubmitAnswer,
    formState: { errors: answerErrors },
    reset: resetAnswer,
  } = useForm<AnswerFormData>({
    resolver: zodResolver(answerSchema),
  })

  useEffect(() => {
    loadQuestions()
    loadUserVotes()
  }, [mikvahId])

  const loadQuestions = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('mikvah_questions')
      .select(`
        *,
        answers:mikvah_answers(*)
      `)
      .eq('mikvah_id', mikvahId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setQuestions(data as any)
    }
    setIsLoading(false)
  }

  const loadUserVotes = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('answer_votes')
      .select('answer_id, is_helpful')
      .eq('user_id', user.id)

    if (data) {
      const votes: Record<string, boolean> = {}
      data.forEach(vote => {
        votes[vote.answer_id] = vote.is_helpful
      })
      setUserVotes(votes)
    }
  }

  const onSubmitQuestion = async (data: QuestionFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please login to ask questions')
        return
      }

      const { error } = await supabase.from('mikvah_questions').insert({
        mikvah_id: mikvahId,
        user_id: user.id,
        question: data.question,
      })

      if (error) throw error

      toast.success('Question posted!')
      resetQuestion()
      setShowQuestionForm(false)
      await loadQuestions()
    } catch (error) {
      console.error('Error posting question:', error)
      toast.error('Failed to post question')
    }
  }

  const onSubmitAnswer = async (questionId: string, data: AnswerFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please login to answer questions')
        return
      }

      const { error } = await supabase.from('mikvah_answers').insert({
        question_id: questionId,
        user_id: user.id,
        answer: data.answer,
      })

      if (error) throw error

      toast.success('Answer posted!')
      resetAnswer()
      setAnsweringQuestionId(null)
      await loadQuestions()
    } catch (error) {
      console.error('Error posting answer:', error)
      toast.error('Failed to post answer')
    }
  }

  const handleVote = async (answerId: string, isHelpful: boolean) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please login to vote')
      return
    }

    const existingVote = userVotes[answerId]

    if (existingVote === isHelpful) {
      // Remove vote
      await supabase
        .from('answer_votes')
        .delete()
        .eq('answer_id', answerId)
        .eq('user_id', user.id)

      const newVotes = { ...userVotes }
      delete newVotes[answerId]
      setUserVotes(newVotes)
    } else {
      // Add or update vote
      await supabase
        .from('answer_votes')
        .upsert({
          answer_id: answerId,
          user_id: user.id,
          is_helpful: isHelpful,
        })

      setUserVotes({ ...userVotes, [answerId]: isHelpful })
    }

    await loadQuestions()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Questions & Answers
        </h3>
        <Button size="sm" onClick={() => setShowQuestionForm(!showQuestionForm)}>
          Ask Question
        </Button>
      </div>

      {/* Question Form */}
      {showQuestionForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmitQuestion(onSubmitQuestion)} className="space-y-3">
              <Textarea
                placeholder="What would you like to know about this mikvah?"
                rows={3}
                {...registerQuestion('question')}
              />
              {questionErrors.question && (
                <p className="text-sm text-destructive">{questionErrors.question.message}</p>
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowQuestionForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Post Question
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No questions yet. Be the first to ask!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-medium">
                    {question.question}
                  </CardTitle>
                  {question.is_answered && (
                    <Badge variant="secondary" className="ml-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Answered
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(question.created_at).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Answers */}
                {question.answers && question.answers.length > 0 && (
                  <div className="space-y-3 pl-4 border-l-2">
                    {question.answers.map((answer) => (
                      <div key={answer.id} className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm">{answer.answer}</p>
                          {answer.is_from_admin && (
                            <Badge variant="default" className="text-xs">Admin</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={userVotes[answer.id] === true ? 'default' : 'ghost'}
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleVote(answer.id, true)}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {answer.is_helpful_count > 0 && answer.is_helpful_count}
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {new Date(answer.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer Form */}
                {answeringQuestionId === question.id ? (
                  <form onSubmit={handleSubmitAnswer((data) => onSubmitAnswer(question.id, data))} className="space-y-2">
                    <Textarea
                      placeholder="Write your answer..."
                      rows={3}
                      {...registerAnswer('answer')}
                    />
                    {answerErrors.answer && (
                      <p className="text-sm text-destructive">{answerErrors.answer.message}</p>
                    )}
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => {
                        setAnsweringQuestionId(null)
                        resetAnswer()
                      }}>
                        Cancel
                      </Button>
                      <Button type="submit" size="sm">Post Answer</Button>
                    </div>
                  </form>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAnsweringQuestionId(question.id)}
                  >
                    Answer this question
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
