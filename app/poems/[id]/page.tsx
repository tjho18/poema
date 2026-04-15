import { createServerSupabaseClient } from '@/lib/supabase-server'
import GradientBackground from '@/components/GradientBackground'
import NavBar from '@/components/NavBar'
import PoemDisplay from '@/components/PoemDisplay'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('poems').select('title, content').eq('id', id).single()
  if (!data) return { title: 'Poem' }
  const excerpt = data.content.slice(0, 120).replace(/\n/g, ' ')
  return {
    title: data.title,
    description: excerpt,
    openGraph: {
      title: `${data.title} — Poema`,
      description: excerpt,
    },
  }
}

export default async function PoemPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: poem } = await supabase
    .from('poems')
    .select('*')
    .eq('id', id)
    .single()

  if (!poem) notFound()

  const date = new Date(poem.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <GradientBackground />
      <NavBar />

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-32">
        <article className="w-full max-w-xl page-enter">

          {/* Back */}
          <div className="mb-16 text-center">
            <Link
              href="/explore"
              className="font-sans text-[10px] tracking-[0.3em] uppercase text-parchment-dim/40 hover:text-parchment-muted transition-colors duration-300"
            >
              ← Back to all
            </Link>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl md:text-4xl text-parchment text-center mb-12 gold-glow leading-tight">
            {poem.title}
          </h1>

          {/* Ornament */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/30" />
            <span className="text-gold/40 text-xs">◈</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/30" />
          </div>

          {/* Content */}
          <div className="text-center">
            <PoemDisplay content={poem.content} animate typewriter={false} />
          </div>

          {/* Footer */}
          <div className="mt-16 flex flex-col items-center gap-6">
            {/* Tags */}
            {poem.tags && poem.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {poem.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/explore?tag=${encodeURIComponent(tag)}`}
                    className="tag-pill text-[10px] tracking-[0.2em] uppercase font-sans text-gold-dim border border-gold-dim/30 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Date */}
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-parchment-dim/30">
              {date}
            </p>
          </div>
        </article>
      </main>
    </>
  )
}
