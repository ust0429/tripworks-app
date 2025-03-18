// src/components/messages/GroupDetailsScreen.tsx
import React, { useState } from 'react';
import { ArrowLeft, UserPlus, Settings, Trash2, User, X, Users } from 'lucide-react';
import { Conversation, Participant } from '../../types';
import { webSocketService } from '../../utils/websocketService';

interface GroupDetailsScreenProps {
  conversation: Conversation;
  onBack: () => void;
  onAddParticipants: () => void;
  onLeaveGroup: () => void;
  currentUserId: string;
}

/**
 * グループチャットの詳細画面
 */
const GroupDetailsScreen: React.FC<GroupDetailsScreenProps> = ({
  conversation,
  onBack,
  onAddParticipants,
  onLeaveGroup,
  currentUserId
}) => {
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState<string | null>(null);
  
  // 参加者一覧（participants指定がなければparticipantIdsから構築）
  const participants = conversation.participants || 
    conversation.participantIds.map(id => ({
      id,
      name: id.startsWith('user') ? `ユーザー ${id.replace('user', '')}` : id,
      joinedAt: new Date().toISOString(),
      isAdmin: id === currentUserId, // デフォルトでは現在のユーザーのみ管理者
      avatar: undefined // アバターはデフォルトでundefined
    }));
  
  // 自分が管理者かどうか
  const isAdmin = participants.find(p => p.id === currentUserId)?.isAdmin || false;

  // 参加者削除処理
  const handleRemoveParticipant = (participantId: string) => {
    webSocketService.removeGroupMember(conversation.id, participantId);
    setShowConfirmRemove(null);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ヘッダー */}
      <div className="bg-white p-4 flex items-center border-b">
        <button onClick={onBack} className="mr-2">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">グループ情報</h1>
      </div>
      
      {/* グループ詳細 */}
      <div className="p-4 bg-white mb-2">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            {conversation.avatar ? (
              <img src={conversation.avatar} alt={conversation.name} className="w-full h-full rounded-full" />
            ) : (
              <Users size={32} className="text-gray-400" />
            )}
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold">{conversation.name || 'グループチャット'}</h2>
            <p className="text-gray-500">{participants.length}人のメンバー</p>
          </div>
        </div>
      </div>
      
      {/* 参加者リスト */}
      <div className="bg-white p-4 mb-2">
        <h3 className="text-lg font-medium mb-3">参加者</h3>
        <div className="space-y-3">
          {participants.map(participant => (
            <div key={participant.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                  {participant.avatar ? (
                    <img src={participant.avatar} alt={participant.name} className="w-full h-full rounded-full" />
                  ) : (
                    <User size={20} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {participant.name}
                    {participant.id === currentUserId && ' (あなた)'}
                  </p>
                  {participant.isAdmin && (
                    <p className="text-xs text-gray-500">管理者</p>
                  )}
                </div>
              </div>
              
              {/* 管理者は他のメンバーを削除可能 */}
              {isAdmin && participant.id !== currentUserId && (
                <button 
                  className="text-red-500 p-2"
                  onClick={() => setShowConfirmRemove(participant.id)}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* メンバー追加ボタン（管理者のみ） */}
        {isAdmin && (
          <button 
            className="w-full mt-4 py-2 border border-blue-500 text-blue-500 rounded-lg flex items-center justify-center"
            onClick={onAddParticipants}
          >
            <UserPlus size={18} className="mr-2" />
            <span>参加者を追加</span>
          </button>
        )}
      </div>
      
      {/* グループ設定 */}
      <div className="bg-white p-4">
        <h3 className="text-lg font-medium mb-3">設定</h3>
        <div className="space-y-2">
          {/* ミュート設定など他の設定オプション */}
          <div className="p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Settings size={20} className="text-gray-500 mr-3" />
                <span>通知をミュート</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          {/* グループ退出 */}
          <button 
            className="w-full py-3 text-red-500 rounded-lg flex items-center justify-center border border-red-500"
            onClick={() => setShowConfirmLeave(true)}
          >
            <Trash2 size={18} className="mr-2" />
            <span>グループを退出</span>
          </button>
        </div>
      </div>
      
      {/* 退出確認モーダル */}
      {showConfirmLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">グループを退出しますか？</h3>
            <p className="text-gray-600 mb-4">このグループから退出すると、このチャットの履歴にアクセスできなくなります。</p>
            <div className="flex space-x-3">
              <button 
                className="flex-1 py-2 border border-gray-300 rounded-lg"
                onClick={() => setShowConfirmLeave(false)}
              >
                キャンセル
              </button>
              <button 
                className="flex-1 py-2 bg-red-500 text-white rounded-lg"
                onClick={() => {
                  // グループ退出処理
                  webSocketService.leaveGroup(conversation.id);
                  onLeaveGroup();
                  setShowConfirmLeave(false);
                }}
              >
                退出する
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* メンバー削除確認モーダル */}
      {showConfirmRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">参加者を削除しますか？</h3>
            <p className="text-gray-600 mb-4">
              {participants.find(p => p.id === showConfirmRemove)?.name || '選択した参加者'}をグループから削除します。
            </p>
            <div className="flex space-x-3">
              <button 
                className="flex-1 py-2 border border-gray-300 rounded-lg"
                onClick={() => setShowConfirmRemove(null)}
              >
                キャンセル
              </button>
              <button 
                className="flex-1 py-2 bg-red-500 text-white rounded-lg"
                onClick={() => handleRemoveParticipant(showConfirmRemove)}
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetailsScreen;