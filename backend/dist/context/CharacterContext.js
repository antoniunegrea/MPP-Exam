"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterContext = void 0;
const supabase_1 = require("../config/supabase");
class CharacterContext {
    getAllCharacters() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Fetching all characters from Supabase...');
            try {
                const { data, error } = yield supabase_1.supabase
                    .from('characters')
                    .select('*');
                if (error) {
                    console.error('Error fetching characters:', error);
                    throw error;
                }
                console.log(`Found ${data.length} characters`);
                return data;
            }
            catch (error) {
                console.error('Unexpected error in getAllCharacters:', error);
                throw error;
            }
        });
    }
    getCharacterById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Fetching character with ID: ${id} from Supabase...`);
            try {
                const { data, error } = yield supabase_1.supabase
                    .from('characters')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (error) {
                    console.error(`Error fetching character ${id}:`, error);
                    return null;
                }
                console.log('Found character:', data);
                return data;
            }
            catch (error) {
                console.error(`Unexpected error in getCharacterById for ID ${id}:`, error);
                return null;
            }
        });
    }
    addCharacter(character) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Adding new character to Supabase:', character);
            try {
                const { data, error } = yield supabase_1.supabase
                    .from('characters')
                    .insert([character])
                    .select()
                    .single();
                if (error) {
                    console.error('Error adding character:', error);
                    console.error('Character data that failed:', character);
                    throw error;
                }
                console.log('Successfully added character:', data);
                return data;
            }
            catch (error) {
                console.error('Unexpected error in addCharacter:', error);
                throw error;
            }
        });
    }
    updateCharacter(id, character) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Updating character ${id} in Supabase:`, character);
            try {
                const { data, error } = yield supabase_1.supabase
                    .from('characters')
                    .update(character)
                    .eq('id', id)
                    .select()
                    .single();
                if (error) {
                    console.error(`Error updating character ${id}:`, error);
                    console.error('Update data that failed:', character);
                    return null;
                }
                console.log('Successfully updated character:', data);
                return data;
            }
            catch (error) {
                console.error(`Unexpected error in updateCharacter for ID ${id}:`, error);
                return null;
            }
        });
    }
    deleteCharacter(id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Deleting character ${id} from Supabase...`);
            try {
                const { error } = yield supabase_1.supabase
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
            catch (error) {
                console.error(`Unexpected error in deleteCharacter for ID ${id}:`, error);
                return false;
            }
        });
    }
    generateRandomCharacters(count) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Generating ${count} random characters in Supabase...`);
            try {
                const names = [
                    "Aragorn", "Gandalf", "Legolas", "Gimli", "Frodo",
                    "Samwise", "Merry", "Pippin", "Boromir", "Faramir",
                    "Galadriel", "Elrond", "Arwen", "Eowyn", "Theoden"
                ];
                const characters = [];
                for (let i = 0; i < count; i++) {
                    const randomName = names[Math.floor(Math.random() * names.length)];
                    characters.push({
                        name: randomName,
                        image: "https://i.imgur.com/8Km9tLL.jpg",
                        abilities: {
                            strength: Math.floor(Math.random() * 41) + 60, // 60-100
                            agility: Math.floor(Math.random() * 41) + 60, // 60-100
                            defense: Math.floor(Math.random() * 41) + 60 // 60-100
                        }
                    });
                }
                const { data, error } = yield supabase_1.supabase
                    .from('characters')
                    .insert(characters)
                    .select();
                if (error) {
                    console.error('Error generating random characters:', error);
                    console.error('First few characters that failed:', characters.slice(0, 3));
                    throw error;
                }
                console.log(`Successfully generated ${data.length} characters`);
                return data;
            }
            catch (error) {
                console.error('Unexpected error in generateRandomCharacters:', error);
                throw error;
            }
        });
    }
}
exports.CharacterContext = CharacterContext;
