import { CategoryLayout } from '@/components/category/category-layout'

interface CategoryPageProps {
  params: {
    type: string
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return <CategoryLayout category={params.type.toUpperCase()} />
}

export function generateStaticParams() {
  return [
    { type: 'anime' },
    { type: 'movie' },
    { type: 'music' },
    { type: 'variety' },
    { type: 'documentary' },
  ]
}
