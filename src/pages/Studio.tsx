import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Upload, 
  Send, 
  Play, 
  Pause, 
  Download, 
  Music2, 
  MessageSquare,
  Sparkles,
  Layers,
  ChevronLeft,
  Volume2,
  SkipBack,
  SkipForward
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface TimelineClip {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  startTime: number;
  duration: number;
}

const Studio = () => {
  const [lyrics, setLyrics] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hey! I'm your Director AI. Upload your audio and paste your lyrics, then I'll create a stunning music video for you." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
    setAudioUrl(URL.createObjectURL(file));
    
    setChatMessages(prev => [...prev, {
      role: 'assistant',
      content: `Audio uploaded: "${file.name}". Now paste your lyrics and I'll break them into visual scenes.`
    }]);

    toast.success("Audio uploaded successfully!");
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput("");

    // If user provides lyrics, update the lyrics state
    if (userMessage.length > 50 && !lyrics) {
      setLyrics(userMessage);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: "I've captured your lyrics. Click 'Generate Video' when you're ready to create your music video."
      }]);
    } else {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: "Got it! Feel free to share your lyrics or adjust your vision. When ready, hit Generate."
      }]);
    }
  };

  const handleGenerate = async () => {
    if (!lyrics.trim()) {
      toast.error("Please add lyrics first");
      return;
    }

    setIsProcessing(true);
    setChatMessages(prev => [...prev, {
      role: 'assistant',
      content: "Starting video generation... I'll analyze your lyrics, create visuals, and stitch everything together."
    }]);

    try {
      // Create a project first
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: 'New Music Video',
          lyrics_text: lyrics,
          status: 'processing',
          user_id: (await supabase.auth.getUser()).data.user?.id || ''
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('generate-vibe-assets', {
        body: {
          project_id: project.id,
          lyrics: lyrics,
          audio_url: audioUrl
        }
      });

      if (error) throw error;

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `Generation complete! Created ${data.scenes} scenes with ${data.images_generated} images. Check the timeline below.`
      }]);

      // Fetch generated assets
      const { data: assets } = await supabase
        .from('assets')
        .select('*')
        .eq('project_id', project.id)
        .order('order_index');

      if (assets && assets.length > 0) {
        setTimelineClips(assets.map((asset, idx) => ({
          id: asset.id,
          type: asset.type as 'image' | 'video' | 'audio',
          url: asset.url,
          startTime: idx * 15,
          duration: 15
        })));
        setPreviewImage(assets[0].url);
      }

      toast.success("Video generation complete!");

    } catch (error: any) {
      console.error('Generation error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `Oops, something went wrong: ${error.message}. Please try again.`
      }]);
      toast.error("Generation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-vibe-black flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <h1 className="text-lg font-semibold text-foreground tracking-wide">VIBESHIFT STUDIO</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleGenerate}
            disabled={isProcessing || !lyrics.trim()}
            className="bg-vibe-pink hover:bg-vibe-pink/80 text-white"
          >
            {isProcessing ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Video
              </>
            )}
          </Button>
          <Button variant="outline" className="border-white/20">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Chat/Lyrics */}
        <aside className="w-80 border-r border-white/10 flex flex-col shrink-0">
          {/* Audio Upload */}
          <div className="p-4 border-b border-white/10">
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-vibe-pink/50 transition-colors">
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
              />
              {audioFile ? (
                <>
                  <Music2 className="w-8 h-8 text-vibe-pink mb-2" />
                  <span className="text-sm text-foreground truncate max-w-full">{audioFile.name}</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Upload Audio</span>
                </>
              )}
            </label>
          </div>

          {/* Lyrics Input */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Lyrics</span>
            </div>
            <Textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Paste your song lyrics here..."
              className="min-h-[120px] bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-white/10">
              <span className="text-sm font-medium text-foreground">Director AI</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm ${msg.role === 'user' 
                    ? 'bg-vibe-pink/20 ml-4 rounded-lg p-3 text-foreground' 
                    : 'bg-white/5 mr-4 rounded-lg p-3 text-muted-foreground'
                  }`}
                >
                  {msg.content}
                </motion.div>
              ))}
            </div>
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Chat with Director AI..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-vibe-pink/50"
                />
                <Button size="icon" onClick={handleSendMessage} className="bg-vibe-pink hover:bg-vibe-pink/80">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Canvas */}
        <main className="flex-1 flex flex-col">
          {/* Video Preview */}
          <div className="flex-1 flex items-center justify-center bg-black/50 relative">
            {previewImage ? (
              <motion.img
                key={previewImage}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            ) : (
              <div className="text-center">
                <Layers className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Your video preview will appear here</p>
              </div>
            )}

            {/* Playback Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-md rounded-full px-6 py-3">
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-vibe-pink flex items-center justify-center hover:bg-vibe-pink/80 transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
              <span className="text-sm text-muted-foreground ml-2">{formatTime(currentTime)}</span>
              <Volume2 className="w-4 h-4 text-muted-foreground ml-4" />
            </div>
          </div>

          {/* Timeline */}
          <div className="h-32 border-t border-white/10 bg-vibe-surface p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Timeline</span>
            </div>
            <div className="h-16 bg-black/30 rounded-lg overflow-hidden flex gap-1 p-1">
              {timelineClips.length > 0 ? (
                timelineClips.map((clip, idx) => (
                  <motion.div
                    key={clip.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setPreviewImage(clip.url)}
                    className="h-full aspect-video bg-vibe-violet/30 rounded cursor-pointer hover:ring-2 hover:ring-vibe-pink transition-all overflow-hidden"
                  >
                    {clip.type === 'image' && (
                      <img src={clip.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                  Generated clips will appear here
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Studio;
