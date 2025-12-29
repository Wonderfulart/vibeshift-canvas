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

const FALLBACK_SCENES: SceneDescription[] = [
  { scene_number: 1, visual_prompt: "Cinematic opening shot, neon lights reflecting on wet streets at night, moody urban landscape", mood: "mysterious", duration_seconds: 15 },
  { scene_number: 2, visual_prompt: "Close-up portrait shot with dramatic lighting, silhouette against colorful backdrop, emotional expression", mood: "intense", duration_seconds: 15 },
  { scene_number: 3, visual_prompt: "Wide landscape shot, golden hour lighting, ethereal atmosphere, dreamy clouds", mood: "hopeful", duration_seconds: 15 },
  { scene_number: 4, visual_prompt: "Abstract visual finale, particles and light trails, cosmic energy, vibrant colors", mood: "triumphant", duration_seconds: 15 }
]

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
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
    
    let scenes: SceneDescription[] = []
    
    try {
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

      console.log(`[Step 1] Gemini response status: ${geminiResponse.status}`)
      
      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text()
        console.error(`[Step 1] Gemini API error: ${errorText}`)
        throw new Error(`Gemini API failed: ${geminiResponse.status}`)
      }

      const geminiData = await geminiResponse.json()
      console.log('[Step 1] Gemini response received')
      console.log(`[Step 1] Response preview: ${JSON.stringify(geminiData).slice(0, 300)}`)

      const textContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
      // Extract JSON from potential markdown code blocks
      const jsonMatch = textContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        scenes = parsed.scenes || []
      }
    } catch (parseError) {
      console.error('[Step 1] Failed to get/parse Gemini response:', parseError)
    }

    // Use fallback if no scenes were parsed
    if (scenes.length === 0) {
      console.log('[Step 1] No scenes parsed, using fallback scenes')
      scenes = FALLBACK_SCENES
    }

    console.log(`[Step 1] Using ${scenes.length} scenes`)

    // ========================================
    // STEP 2: Generate Images with Lovable AI
    // ========================================
    console.log('[Step 2] Generating images with Lovable AI (gemini-3-pro-image-preview)...')
    
    const generatedImages: string[] = []
    
    if (!lovableApiKey) {
      console.error('[Step 2] LOVABLE_API_KEY not configured!')
    }

    for (const scene of scenes) {
      try {
        const imagePrompt = `${scene.visual_prompt}, cinematic 4K, professional music video still, ${scene.mood} mood, high quality, detailed`
        
        console.log(`[Step 2] Generating image for scene ${scene.scene_number}...`)
        
        const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${lovableApiKey}`
          },
          body: JSON.stringify({
            model: 'google/gemini-3-pro-image-preview',
            messages: [
              {
                role: 'user',
                content: `Generate a cinematic image: ${imagePrompt}`
              }
            ]
          })
        })

        console.log(`[Step 2] Image response status for scene ${scene.scene_number}: ${imageResponse.status}`)

        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          console.log(`[Step 2] Image response preview: ${JSON.stringify(imageData).slice(0, 300)}`)
          
          // Check for image in response - Gemini image models return base64 in content
          const content = imageData.choices?.[0]?.message?.content
          
          // Check if there's inline image data
          const inlineData = imageData.choices?.[0]?.message?.inline_data
          if (inlineData?.data) {
            const mimeType = inlineData.mime_type || 'image/png'
            generatedImages.push(`data:${mimeType};base64,${inlineData.data}`)
            console.log(`[Step 2] Generated base64 image for scene ${scene.scene_number}`)
          } else if (content && content.startsWith('data:image')) {
            generatedImages.push(content)
            console.log(`[Step 2] Got data URL for scene ${scene.scene_number}`)
          } else {
            // Fallback to placeholder
            console.log(`[Step 2] No image data in response for scene ${scene.scene_number}, using placeholder`)
            generatedImages.push(`https://picsum.photos/seed/${scene.scene_number + Date.now()}/1920/1080`)
          }
        } else {
          const errorText = await imageResponse.text()
          console.error(`[Step 2] Image generation failed for scene ${scene.scene_number}: ${errorText}`)
          generatedImages.push(`https://picsum.photos/seed/${scene.scene_number + Date.now()}/1920/1080`)
        }
      } catch (imgError) {
        console.error(`[Step 2] Error generating image for scene ${scene.scene_number}:`, imgError)
        generatedImages.push(`https://picsum.photos/seed/${scene.scene_number + Date.now()}/1920/1080`)
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

        console.log(`[Step 3] Sync.so response status: ${syncResponse.status}`)

        if (syncResponse.ok) {
          const syncData = await syncResponse.json()
          syncedClips = syncData.output?.clips || []
          console.log(`[Step 3] Sync.so generated ${syncedClips.length} clips`)
        } else {
          const errorText = await syncResponse.text()
          console.log(`[Step 3] Sync.so request failed: ${errorText}`)
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

        console.log(`[Step 4] Shotstack response status: ${shotstackResponse.status}`)

        if (shotstackResponse.ok) {
          const shotstackData = await shotstackResponse.json()
          const renderId = shotstackData.response?.id

          if (renderId) {
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
          const errorText = await shotstackResponse.text()
          console.log(`[Step 4] Shotstack render failed: ${errorText}`)
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
