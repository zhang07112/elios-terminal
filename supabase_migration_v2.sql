-- 1. Elios 对用户的理解档案（cici_profile）
CREATE TABLE IF NOT EXISTS elios_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    profile_data JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 2. Elios 日记
CREATE TABLE IF NOT EXISTS diaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    date DATE UNIQUE NOT NULL,
    content TEXT NOT NULL
);

-- 启用实时订阅
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'elios_profiles') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE elios_profiles;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'diaries') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE diaries;
    END IF;
END $$;
