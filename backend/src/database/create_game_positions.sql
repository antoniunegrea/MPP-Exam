-- Create game_positions table
CREATE TABLE game_positions (
    id BIGSERIAL PRIMARY KEY,
    character_id BIGINT NOT NULL REFERENCES characters(id),
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE game_positions ENABLE ROW LEVEL SECURITY;

-- Allow all operations
CREATE POLICY "Enable all operations" ON game_positions
    FOR ALL
    USING (true)
    WITH CHECK (true); 