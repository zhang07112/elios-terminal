-- 1. Add author column to diaries
ALTER TABLE diaries ADD COLUMN IF NOT EXISTS author TEXT NOT NULL DEFAULT 'user';

-- 2. Moods
CREATE TABLE IF NOT EXISTS moods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    mood TEXT NOT NULL,
    note TEXT DEFAULT ''
);

-- 3. Study sessions
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    topic TEXT NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 25,
    note TEXT DEFAULT ''
);

-- 4. Music
CREATE TABLE IF NOT EXISTS music (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    url TEXT DEFAULT ''
);

-- 5. Photos
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    url TEXT NOT NULL,
    caption TEXT DEFAULT ''
);

-- 6. Goodnight
CREATE TABLE IF NOT EXISTS goodnight (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    content TEXT NOT NULL,
    mood_before TEXT DEFAULT ''
);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE moods;
ALTER PUBLICATION supabase_realtime ADD TABLE study_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE music;
ALTER PUBLICATION supabase_realtime ADD TABLE photos;
ALTER PUBLICATION supabase_realtime ADD TABLE goodnight;
