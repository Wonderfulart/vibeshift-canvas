import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SceneDescription {
  scene_number: number
  visual_prompt: string
  mood: string
  duration_seconds: number
}

interface GenerationRequest {
  project_id: string
  lyrics: string
  audio_url: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const vertexApiKey = Deno.env.get('VERTEX_API_KEY')
    const syncApiKey = Deno.env.get('SYNC_SO_API_KEY')
    const shotstackApiKey = Deno.env.get('SHOTSTACK_API_KEY')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { project_id, lyrics, audio_url }: GenerationRequest = await req.json()

    console.log(`[generate-vibe-assets] Starting generation for project: ${project_id}`)

    // Update project status to processing
    await supabase
      .from('projects')
      .update({ status: 'processing' })
      .eq('id', project_id)

    // ========================================
    // STEP 1: Analyze Lyrics with Gemini
    // ========================================
    console.log('[Step 1] Analyzing lyrics with Gemini...')
    
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${vertexApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a music video director. Analyze these song lyrics and create exactly 4 visual scene descriptions for a music video.

LYRICS:
${lyrics}

Return ONLY valid JSON in this exact format, no markdown:
{
  "scenes": [
    {
      "scene_number": 1,
      "visual_prompt": "A detailed visual description for AI image generation, cinematic style",
      "mood": "emotional tone",
      "duration_seconds": 15
    }
  ]
}

Make each visual_prompt vivid, cinematic, and suitable for AI image generation. Include lighting, colors, camera angles.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      }
    )

    const geminiData = await geminiResponse.json()
    console.log('[Step 1] Gemini response received')

    let scenes: SceneDescription[] = []
    try {
      const textContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
      // Extract JSON from potential markdown code blocks
      const jsonMatch = textContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        scenes = parsed.scenes || []
      }
    } catch (parseError) {
      console.error('[Step 1] Failed to parse Gemini response:', parseError)
      // Fallback to default scenes
      scenes = [
        { scene_number: 1, visual_prompt: "Cinematic opening shot, neon lights reflecting on wet streets at night", mood: "mysterious", duration_seconds: 15 },
        { scene_number: 2, visual_prompt: "Close-up portrait shot with dramatic lighting, silhouette against colorful backdrop", mood: "intense", duration_seconds: 15 },
        { scene_number: 3, visual_prompt: "Wide landscape shot, golden hour lighting, ethereal atmosphere", mood: "hopeful", duration_seconds: 15 },
        { scene_number: 4, visual_prompt: "Abstract visual finale, particles and light trails, cosmic energy", mood: "triumphant", duration_seconds: 15 }
      ]
    }

    console.log(`[Step 1] Parsed ${scenes.length} scenes`)

    // ========================================
    // STEP 2: Generate Images with Imagen 3
    // ========================================
    console.log('[Step 2] Generating images with Imagen 3...')
    
    const generatedImages: string[] = []
    
    for (const scene of scenes) {
      try {
        // Using Gemini's image generation capability (Imagen 3 via Vertex AI)
        const imageResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${vertexApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              instances: [{
                prompt: `${scene.visual_prompt}, cinematic 4K, professional music video still, ${scene.mood} mood`
              }],
              parameters: {
                sampleCount: 1,
                aspectRatio: "16:9"
              }
            })
          }
        )

        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          const imageBase64 = imageData.predictions?.[0]?.bytesBase64Encoded
          if (imageBase64) {
            // For now, store the base64 data URL (in production, upload to storage)
            generatedImages.push(`data:image/png;base64,${imageBase64}`)
            console.log(`[Step 2] Generated image for scene ${scene.scene_number}`)
          }
        } else {
          console.log(`[Step 2] Image generation failed for scene ${scene.scene_number}, using placeholder`)
          generatedImages.push(`https://picsum.photos/seed/${scene.scene_number}/1920/1080`)
        }
      } catch (imgError) {
        console.error(`[Step 2] Error generating image for scene ${scene.scene_number}:`, imgError)
        generatedImages.push(`https://picsum.photos/seed/${scene.scene_number}/1920/1080`)
      }
    }

    // Store generated images as assets
    for (let i = 0; i < generatedImages.length; i++) {
      await supabase.from('assets').insert({
        project_id,
        type: 'image',
        url: generatedImages[i],
        prompt_used: scenes[i]?.visual_prompt || '',
        order_index: i
      })
    }

    console.log(`[Step 2] Stored ${generatedImages.length} image assets`)

    // ========================================
    // STEP 3: Animate with Sync.so
    // ========================================
    console.log('[Step 3] Animating with Sync.so...')
    
    let syncedClips: string[] = []

    if (syncApiKey && audio_url) {
      try {
        const syncResponse = await fetch('https://api.sync.so/v2/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': syncApiKey
          },
          body: JSON.stringify({
            model: 'lipsync-2',
            input: generatedImages.map((img, idx) => ({
              type: 'image',
              url: img,
              start: idx * 15,
              end: (idx + 1) * 15
            })),
            audio_url: audio_url,
            options: {
              output_format: 'mp4',
              sync_audio: true
            }
          })
        })

        if (syncResponse.ok) {
          const syncData = await syncResponse.json()
          syncedClips = syncData.output?.clips || []
          console.log(`[Step 3] Sync.so generated ${syncedClips.length} clips`)
        } else {
          console.log('[Step 3] Sync.so request failed, using static images')
        }
      } catch (syncError) {
        console.error('[Step 3] Sync.so error:', syncError)
      }
    } else {
      console.log('[Step 3] Skipping Sync.so (no API key or audio URL)')
    }

    // ========================================
    // STEP 4: Stitch with Shotstack
    // ========================================
    console.log('[Step 4] Stitching final video with Shotstack...')
    
    let finalVideoUrl = ''

    if (shotstackApiKey) {
      try {
        // Build timeline from clips or images
        const clips = (syncedClips.length > 0 ? syncedClips : generatedImages).map((url, idx) => ({
          asset: {
            type: syncedClips.length > 0 ? 'video' : 'image',
            src: url
          },
          start: idx * 15,
          length: 15,
          effect: 'fadeIn'
        }))

        const shotstackResponse = await fetch('https://api.shotstack.io/edit/v1/render', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': shotstackApiKey
          },
          body: JSON.stringify({
            timeline: {
              background: '#000000',
              tracks: [{
                clips
              }]
            },
            output: {
              format: 'mp4',
              resolution: 'hd',
              fps: 30
            }
          })
        })

        if (shotstackResponse.ok) {
          const shotstackData = await shotstackResponse.json()
          const renderId = shotstackData.response?.id

          if (renderId) {
            // Poll for completion (simplified - in production use webhooks)
            console.log(`[Step 4] Shotstack render started: ${renderId}`)
            
            // Store render ID for later polling
            await supabase.from('assets').insert({
              project_id,
              type: 'video',
              url: `pending:${renderId}`,
              prompt_used: 'Final stitched video',
              order_index: 100
            })

            finalVideoUrl = `pending:${renderId}`
          }
        } else {
          console.log('[Step 4] Shotstack render failed')
        }
      } catch (shotstackError) {
        console.error('[Step 4] Shotstack error:', shotstackError)
      }
    } else {
      console.log('[Step 4] Skipping Shotstack (no API key)')
    }

    // Update project status to completed
    await supabase
      .from('projects')
      .update({ status: finalVideoUrl ? 'rendering' : 'completed' })
      .eq('id', project_id)

    console.log(`[generate-vibe-assets] Generation complete for project: ${project_id}`)

    return new Response(
      JSON.stringify({
        success: true,
        project_id,
        scenes: scenes.length,
        images_generated: generatedImages.length,
        synced_clips: syncedClips.length,
        final_video: finalVideoUrl || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[generate-vibe-assets] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
