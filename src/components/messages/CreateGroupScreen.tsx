// src/components/messages/CreateGroupScreen.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, X, User, Check, Search } from 'lucide-react';
import { webSocketService } from '../../utils/websocketService';

interface Contact {
  id: string;
  name: string;
  avatar?: string;
}

interface CreateGroupScreenProps {
  contacts: Contact[];
  onBack: () => void;
  onCreateGroup: (name: string, participantIds: string[]) => void;
}

/**
 * グループチャット作成画面
 */
const CreateGroupScreen: React.FC<CreateGroupScreenProps> = ({
  contacts,
  onBack,
  onCreateGroup
}) => {
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>(contacts);
  
  // 検索クエリが変更されたときに連絡先をフィルタリング
  useEffect(() => {
    if (!searchQuery) {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(
        contact => contact.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);
  
  // 連絡先の選択・選択解除
  const handleToggleContact = (contactId: string) => {
    if (selectedContactIds.includes(contactId)) {
      setSelectedContactIds(selectedContactIds.filter(id => id !== contactId));
    } else {
      setSelectedContactIds([...selectedContactIds, contactId]);
    }
  };
  
  // グループ作成処理
  const handleCreateGroup = () => {
    if (groupName.trim() && selectedContactIds.length > 0) {
      // WebSocketでグループ作成イベントを送信
      webSocketService.createGroupConversation(selectedContactIds, groupName.trim());
      
      // コールバックでUIを更新
      onCreateGroup(groupName.trim(), selectedContactIds);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ヘッダー */}
      <div className="bg-white p-4 flex items-center justify-between border-b">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-2">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">新しいグループ</h1>
        </div>
        <button 
          className={`px-4 py-1 rounded-lg ${
            !groupName.trim() || selectedContactIds.length === 0
              ? 'bg-gray-300 text-gray-500'
              : 'bg-blue-500 text-white'
          }`}
          disabled={!groupName.trim() || selectedContactIds.length === 0}
          onClick={handleCreateGroup}
        >
          作成
        </button>
      </div>
      
      {/* グループ名入力 */}
      <div className="p-4 bg-white mb-2">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
            <Users size={24} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="グループ名を入力..."
            className="flex-1 py-2 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
      
      {/* 選択済み連絡先 */}
      {selectedContactIds.length > 0 && (
        <div className="p-4 bg-white mb-2">
          <h3 className="text-sm font-medium mb-2 text-gray-500">
            選択中: {selectedContactIds.length}人
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedContactIds.map(id => {
              const contact = contacts.find(c => c.id === id);
              if (!contact) return null;
              
              return (
                <div key={id} className="flex items-center bg-gray-100 rounded-full pr-2 pl-1 py-1">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-1">
                    {contact.avatar ? (
                      <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full" />
                    ) : (
                      <User size={14} className="text-gray-500" />
                    )}
                  </div>
                  <span className="text-sm">{contact.name}</span>
                  <button 
                    className="ml-1 text-gray-500"
                    onClick={() => handleToggleContact(id)}
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* 検索バー */}
      <div className="px-4 py-2 bg-white border-t">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="連絡先を検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
      </div>
      
      {/* 連絡先リスト */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-lg font-medium mb-3">連絡先</h3>
          <div className="space-y-2">
            {filteredContacts.map(contact => (
              <div 
                key={contact.id}
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleToggleContact(contact.id)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                    {contact.avatar ? (
                      <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full" />
                    ) : (
                      <User size={20} className="text-gray-400" />
                    )}
                  </div>
                  <span>{contact.name}</span>
                </div>
                {selectedContactIds.includes(contact.id) ? (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 border border-gray-300 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupScreen;