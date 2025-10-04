'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Download, 
  Trash2, 
  Edit,
  Search,
  Filter,
  SortAsc
} from 'lucide-react';

import { Character4D, CharacterRarity } from '@/types/Character';
import { CharacterService } from '@/services/CharacterService';
import CharacterPreview from './CharacterPreview';

interface CharacterListProps {
  onLoadCharacter: (character: Character4D) => void;
  onExportCharacter: (character: Character4D) => void;
}

const rarityColors = {
  common: 'text-gray-400 border-gray-400',
  uncommon: 'text-green-400 border-green-400',
  rare: 'text-blue-400 border-blue-400',
  epic: 'text-purple-400 border-purple-400',
  legendary: 'text-yellow-400 border-yellow-400',
  mythic: 'text-pink-400 border-pink-400',
};

type SortOption = 'name' | 'rarity' | 'created' | 'modified' | 'power';
type FilterOption = 'all' | CharacterRarity;

export default function CharacterList({ onLoadCharacter, onExportCharacter }: CharacterListProps) {
  const [characters, setCharacters] = useState<Character4D[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<Character4D[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character4D | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('modified');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Load characters from storage
  useEffect(() => {
    const loadCharacters = () => {
      const saved = CharacterService.getAllCharacters();
      setCharacters(saved);
    };

    loadCharacters();
    
    // Listen for storage changes
    const handleStorageChange = () => loadCharacters();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter and sort characters
  useEffect(() => {
    const filtered = characters.filter(char => {
      const matchesSearch = char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           char.metadata.backstory.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBy === 'all' || char.metadata.rarity === filterBy;
      
      return matchesSearch && matchesFilter;
    });

    // Sort characters
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity':
          const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
          return rarityOrder.indexOf(b.metadata.rarity) - rarityOrder.indexOf(a.metadata.rarity);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'modified':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        case 'power':
          const aPower = Object.values(a.attributes).reduce((sum, val) => sum + val, 0);
          const bPower = Object.values(b.attributes).reduce((sum, val) => sum + val, 0);
          return bPower - aPower;
        default:
          return 0;
      }
    });

    setFilteredCharacters(filtered);
  }, [characters, searchTerm, sortBy, filterBy]);

  const handleDeleteCharacter = (characterId: string) => {
    if (CharacterService.deleteCharacter(characterId)) {
      setCharacters(prev => prev.filter(c => c.id !== characterId));
      setShowDeleteConfirm(null);
      if (selectedCharacter?.id === characterId) {
        setSelectedCharacter(null);
      }
    }
  };

  const getTotalPower = (character: Character4D) => {
    return Object.values(character.attributes).reduce((sum, val) => sum + val, 0);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Characters</h2>
          <p className="text-gray-400 text-sm">
            {characters.length} character{characters.length !== 1 ? 's' : ''} created
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-400">Total Collection Value</div>
          <div className="text-xl font-semibold text-yellow-400">
            {characters.reduce((sum, char) => sum + char.metadata.mintCost, 0)} GBUX
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search characters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/30 border border-purple-500/30 rounded-md focus:border-purple-400 focus:outline-none"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-2">
          <SortAsc className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-black/30 border border-purple-500/30 rounded-md px-3 py-2 focus:border-purple-400 focus:outline-none"
          >
            <option value="modified">Last Modified</option>
            <option value="created">Date Created</option>
            <option value="name">Name</option>
            <option value="rarity">Rarity</option>
            <option value="power">Power</option>
          </select>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
            className="bg-black/30 border border-purple-500/30 rounded-md px-3 py-2 focus:border-purple-400 focus:outline-none"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
            <option value="mythic">Mythic</option>
          </select>
        </div>
      </div>

      {/* Character Grid */}
      {filteredCharacters.length === 0 ? (
        <div className="text-center py-12">
          {characters.length === 0 ? (
            <div>
              <User className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold mb-2">No Characters Yet</h3>
              <p className="text-gray-400 mb-6">Create your first 4D character to get started!</p>
              <button
                onClick={() => window.location.reload()} // Simple way to go to builder
                className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
              >
                <span>+ Create Character</span>
              </button>
            </div>
          ) : (
            <div>
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold mb-2">No Characters Found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCharacters.map((character, index) => {
            const totalPower = getTotalPower(character);
            
            return (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/20 backdrop-blur-sm rounded-lg border border-purple-500/30 p-4 hover:border-purple-500/50 transition-all"
              >
                {/* Character Preview */}
                <div className="mb-4">
                  <CharacterPreview
                    attributes={character.attributes}
                    appearance={character.appearance}
                    name={character.name}
                    rarity={character.metadata.rarity}
                  />
                </div>

                {/* Character Info */}
                <div className="space-y-3">
                  {/* Stats Summary */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-gray-400">Power</div>
                      <div className="font-semibold">{totalPower}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Cost</div>
                      <div className="font-semibold text-yellow-400">{character.metadata.mintCost}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Rarity</div>
                      <div className={`font-semibold capitalize ${rarityColors[character.metadata.rarity].split(' ')[0]}`}>
                        {character.metadata.rarity}
                      </div>
                    </div>
                  </div>

                  {/* Backstory Preview */}
                  {character.metadata.backstory && (
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Backstory</div>
                      <div className="text-xs text-gray-300 line-clamp-2">
                        {character.metadata.backstory}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="text-xs text-gray-500 border-t border-gray-600/30 pt-2">
                    <div>Created: {formatDate(character.createdAt)}</div>
                    <div>Modified: {formatDate(character.lastModified)}</div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onLoadCharacter(character)}
                      className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded-md text-xs transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={() => onExportCharacter(character)}
                      className="flex items-center justify-center py-2 px-3 bg-green-600 hover:bg-green-700 rounded-md text-xs transition-colors"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={() => setShowDeleteConfirm(character.id)}
                      className="flex items-center justify-center py-2 px-3 bg-red-600 hover:bg-red-700 rounded-md text-xs transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg border border-red-500/30 p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Character</h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to delete this character? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCharacter(showDeleteConfirm)}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}