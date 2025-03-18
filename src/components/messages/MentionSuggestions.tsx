// src/components/messages/MentionSuggestions.tsx
import React from 'react';
import { User } from 'lucide-react';
import { Participant } from '../../types';

interface MentionSuggestionsProps {
  participants: Participant[];
  query: string;
  onSelectMention: (participant: Participant) => void;
}

/**
 * メンション候補を表示するコンポーネント
 * タイピング中に@が入力されると表示
 */
const MentionSuggestions: React.FC<MentionSuggestionsProps> = ({
  participants,
  query,
  onSelectMention
}) => {
  // クエリにマッチする参加者をフィルタリング
  const filteredParticipants = participants.filter(
    participant => participant.name.toLowerCase().includes(query.toLowerCase())
  );
  
  if (query.length === 0 || filteredParticipants.length === 0) {
    return null;
  }
  
  return (
    <div className="absolute bottom-full left-0 right-0 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto mb-2">
      {filteredParticipants.map(participant => (
        <div
          key={participant.id}
          className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
          onClick={() => onSelectMention(participant)}
        >
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
            {participant.avatar ? (
              <img src={participant.avatar} alt={participant.name} className="w-full h-full rounded-full" />
            ) : (
              <User size={16} className="text-gray-400" />
            )}
          </div>
          <span className="font-medium">{participant.name}</span>
        </div>
      ))}
    </div>
  );
};

export default MentionSuggestions;