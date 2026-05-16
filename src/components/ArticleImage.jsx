import { useEffect, useState } from 'react'
import { DEFAULT_ARTICLE_IMAGE, resolveArticleImage } from '../lib/articleImage'

export default function ArticleImage({
  article,
  className,
  loading = 'lazy',
  width,
  alt,
}) {
  const [src, setSrc] = useState(() => resolveArticleImage(article, width))

  useEffect(() => {
    setSrc(resolveArticleImage(article, width))
  }, [article?.id, article?.category, article?.image, article?.featured, width])

  return (
    <img
      className={className}
      src={src}
      alt={alt ?? article?.title ?? ''}
      loading={loading}
      onError={() => setSrc(DEFAULT_ARTICLE_IMAGE)}
    />
  )
}
