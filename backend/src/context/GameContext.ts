import { supabase } from '../config/supabase';
import { Server } from 'socket.io';

export interface GamePosition {
    id: number;
    character_id: number;
    position_x: number;
    position_y: number;
    created_at: string;
}

export class GameContext {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
    }

    async joinGame(characterId: number): Promise<GamePosition> {
        console.log(`[GameContext] joinGame called for character ${characterId} at ${new Date().toISOString()}`);
        try {
            // First, check if character already has a position
            const { data: existingPosition, error: checkError } = await supabase
                .from('game_positions')
                .select('*')
                .eq('character_id', characterId)
                .single();

            if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
                console.error('[GameContext] Error checking existing position:', checkError);
                throw checkError;
            }

            if (existingPosition) {
                console.log('[GameContext] Character already in game, returning existing position:', existingPosition);
                return existingPosition as GamePosition;
            }

            // Generate random position between 0 and 100
            const position_x = Math.floor(Math.random() * 100);
            const position_y = Math.floor(Math.random() * 100);

            console.log(`[GameContext] Creating new position for character ${characterId} at (${position_x}, ${position_y})`);

            const { data, error } = await supabase
                .from('game_positions')
                .insert([{
                    character_id: characterId,
                    position_x,
                    position_y
                }])
                .select()
                .single();

            if (error) {
                console.error('[GameContext] Error adding character to game:', error);
                throw error;
            }

            console.log('[GameContext] Successfully added character to game:', data);
            return data as GamePosition;
        } catch (error) {
            console.error('[GameContext] Unexpected error in joinGame:', error);
            throw error;
        }
    }

    async leaveGame(characterId: number): Promise<boolean> {
        console.log(`[GameContext] Removing character ${characterId} from game...`);
        try {
            const { error } = await supabase
                .from('game_positions')
                .delete()
                .eq('character_id', characterId);

            if (error) {
                console.error('[GameContext] Error removing character from game:', error);
                return false;
            }

            console.log('[GameContext] Successfully removed character from game');
            return true;
        } catch (error) {
            console.error('[GameContext] Unexpected error in leaveGame:', error);
            return false;
        }
    }

    async getAllPositions(): Promise<GamePosition[]> {
        console.log('[GameContext] Fetching all game positions...');
        try {
            const { data, error } = await supabase
                .from('game_positions')
                .select('*');

            if (error) {
                console.error('[GameContext] Error fetching game positions:', error);
                throw error;
            }

            return data as GamePosition[];
        } catch (error) {
            console.error('[GameContext] Unexpected error in getAllPositions:', error);
            throw error;
        }
    }

    async getPositionByCharacterId(characterId: number): Promise<GamePosition | null> {
        console.log(`[GameContext] Fetching position for character ${characterId}...`);
        try {
            const { data, error } = await supabase
                .from('game_positions')
                .select('*')
                .eq('character_id', characterId)
                .single();

            if (error) {
                console.error(`[GameContext] Error fetching position for character ${characterId}:`, error);
                return null;
            }

            return data as GamePosition;
        } catch (error) {
            console.error(`[GameContext] Unexpected error in getPositionByCharacterId:`, error);
            return null;
        }
    }

    async moveCharacter(characterId: number, position: { position_x: number, position_y: number }): Promise<GamePosition> {
        console.log(`[GameContext] Moving character ${characterId} to (${position.position_x}, ${position.position_y})`);
        
        try {
            // Update the position in the database
            const { data, error } = await supabase
                .from('game_positions')
                .update({
                    position_x: position.position_x,
                    position_y: position.position_y
                })
                .eq('character_id', characterId)
                .select()
                .single();

            if (error) {
                console.error('[GameContext] Error updating position:', error);
                throw error;
            }

            if (!data) {
                throw new Error('No position found to update');
            }

            console.log('[GameContext] Successfully updated position:', data);
            
            // Broadcast the position update to all clients
            this.io.emit('positionUpdated', data);
            
            return data;
        } catch (error) {
            console.error('[GameContext] Error in moveCharacter:', error);
            throw error;
        }
    }
} 