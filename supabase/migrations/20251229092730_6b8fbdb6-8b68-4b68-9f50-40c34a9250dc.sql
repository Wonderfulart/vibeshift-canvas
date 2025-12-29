-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Project',
  lyrics_text TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assets table
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('video', 'image', 'audio')),
  url TEXT NOT NULL,
  prompt_used TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- RLS policies for projects
CREATE POLICY "Users can view their own projects" 
ON public.projects FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.projects FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.projects FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.projects FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for assets (via project ownership)
CREATE POLICY "Users can view assets of their projects" 
ON public.assets FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = assets.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create assets in their projects" 
ON public.assets FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = assets.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update assets in their projects" 
ON public.assets FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = assets.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete assets in their projects" 
ON public.assets FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = assets.project_id 
  AND projects.user_id = auth.uid()
));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for projects
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_assets_project_id ON public.assets(project_id);
CREATE INDEX idx_assets_order ON public.assets(project_id, order_index);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('user-audio-uploads', 'user-audio-uploads', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('generated-videos', 'generated-videos', false);

-- Storage policies for user-audio-uploads
CREATE POLICY "Users can upload their own audio" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'user-audio-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own audio" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'user-audio-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audio" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'user-audio-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for generated-videos
CREATE POLICY "Users can view their own videos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'generated-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Service can upload generated videos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'generated-videos');