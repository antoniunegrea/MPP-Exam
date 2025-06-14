import { Character } from '../types/Character';
import { supabase } from '../config/supabase';

export class CharacterContext {
    async getAllCharacters(): Promise<Character[]> {
        console.log('Fetching all characters from Supabase...');
        const { data, error } = await supabase
            .from('characters')
            .select('*');

        if (error) {
            console.error('Error fetching characters:', error);
            throw error;
        }

        console.log(`Found ${data.length} characters`);
        return data as Character[];
    }

    async getCharacterById(id: number): Promise<Character | null> {
        console.log(`Fetching character with ID: ${id} from Supabase...`);
        const { data, error } = await supabase
            .from('characters')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching character ${id}:`, error);
            return null;
        }

        console.log('Found character:', data);
        return data as Character;
    }

    async addCharacter(character: Omit<Character, 'id'>): Promise<Character> {
        console.log('Adding new character to Supabase:', character);
        const { data, error } = await supabase
            .from('characters')
            .insert([character])
            .select()
            .single();

        if (error) {
            console.error('Error adding character:', error);
            throw error;
        }

        console.log('Successfully added character:', data);
        return data as Character;
    }

    async updateCharacter(id: number, character: Partial<Character>): Promise<Character | null> {
        console.log(`Updating character ${id} in Supabase:`, character);
        const { data, error } = await supabase
            .from('characters')
            .update(character)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating character ${id}:`, error);
            return null;
        }

        console.log('Successfully updated character:', data);
        return data as Character;
    }

    async deleteCharacter(id: number): Promise<boolean> {
        console.log(`Deleting character ${id} from Supabase...`);
        const { error } = await supabase
            .from('characters')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Error deleting character ${id}:`, error);
            return false;
        }

        console.log(`Successfully deleted character ${id}`);
        return true;
    }

    async generateRandomCharacters(count: number): Promise<Character[]> {
        console.log(`Generating ${count} random characters in Supabase...`);
        const names = [
            "Aragorn", "Gandalf", "Legolas", "Gimli", "Frodo",
            "Samwise", "Merry", "Pippin", "Boromir", "Faramir",
            "Galadriel", "Elrond", "Arwen", "Eowyn", "Theoden"
        ];

        const characters: Omit<Character, 'id'>[] = [];
        for (let i = 0; i < count; i++) {
            const randomName = names[Math.floor(Math.random() * names.length)];
            characters.push({
                name: randomName,
                image: "https://i.imgur.com/8Km9tLL.jpg",
                abilities: {
                    strength: Math.floor(Math.random() * 41) + 60, // 60-100
                    agility: Math.floor(Math.random() * 41) + 60,  // 60-100
                    defense: Math.floor(Math.random() * 41) + 60   // 60-100
                }
            });
        }

        const { data, error } = await supabase
            .from('characters')
            .insert(characters)
            .select();

        if (error) {
            console.error('Error generating random characters:', error);
            throw error;
        }

        console.log(`Successfully generated ${data.length} characters`);
        return data as Character[];
    }
} 