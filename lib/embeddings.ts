// eslint-disable-next-line @typescript-eslint/no-explicit-any
let embeddingPipeline: any = null
let loadPromise: Promise<void> | null = null

async function loadPipeline(): Promise<void> {
  const { pipeline, env } = await import('@xenova/transformers')
  // Allow remote model download; disable local model path check
  env.allowRemoteModels = true
  env.allowLocalModels = false
  embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    quantized: true,
  })
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!embeddingPipeline) {
    if (!loadPromise) {
      loadPromise = loadPipeline().catch((err) => {
        // Reset so next request retries
        loadPromise = null
        embeddingPipeline = null
        throw err
      })
    }
    await loadPromise
  }
  const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data as Float32Array)
}
