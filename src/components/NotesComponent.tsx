import { useState, useRef } from 'react';
import { X, AtSign, Send, MessageSquare } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';
import type { Note } from '../types';

// Sample users for @mention suggestions
const SAMPLE_USERS = [
  'john.doe',
  'jane.smith', 
  'mike.johnson',
  'sarah.wilson',
  'david.brown',
  'lisa.garcia',
  'alex.martinez',
  'emily.davis',
  'chris.taylor',
  'amanda.white'
];

interface NotesComponentProps {
  notes: Note[];
  onAddNote: (content: string, mentions: string[]) => Promise<void>;
  className?: string;
}

export function NotesComponent({ notes, onAddNote, className = '' }: NotesComponentProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Notes</h3>
        <Button 
          size="sm" 
          onClick={() => setIsAddingNote(true)}
          className="flex items-center"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>No notes yet. Add the first note to start tracking communication.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </div>
      )}

      <AddNoteModal
        isOpen={isAddingNote}
        onClose={() => setIsAddingNote(false)}
        onSave={async (content, mentions) => {
          await onAddNote(content, mentions);
          setIsAddingNote(false);
        }}
      />
    </div>
  );
}

interface NoteItemProps {
  note: Note;
}

function NoteItem({ note }: NoteItemProps) {
  const renderNoteContent = (content: string, mentions: string[]) => {
    if (mentions.length === 0) {
      return content;
    }

    // Replace @mentions with styled elements
    let processedContent = content;
    mentions.forEach(mention => {
      const mentionPattern = new RegExp(`@${mention}\\b`, 'gi');
      processedContent = processedContent.replace(
        mentionPattern,
        `<span class="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-sm font-medium">@${mention}</span>`
      );
    });

    return <span dangerouslySetInnerHTML={{ __html: processedContent }} />;
  };

  return (
    <div className="border-l-4 border-blue-200 pl-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">{note.author}</span>
        <span className="text-sm text-gray-500">
          {new Date(note.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
      <div className="text-gray-700 whitespace-pre-wrap">
        {renderNoteContent(note.content, note.mentions)}
      </div>
    </div>
  );
}

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string, mentions: string[]) => Promise<void>;
}

function AddNoteModal({ isOpen, onClose, onSave }: AddNoteModalProps) {
  const [content, setContent] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ start: 0, end: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredUsers = SAMPLE_USERS.filter(user => 
    user.toLowerCase().includes(mentionQuery.toLowerCase()) &&
    !mentions.includes(user)
  );

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setContent(value);

    // Check for @ mention trigger
    const textBeforeCursor = value.substring(0, cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(atIndex + 1);
      
      // Check if we're in the middle of a mention (no spaces after @)
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setMentionQuery(textAfterAt);
        setMentionPosition({ start: atIndex, end: cursorPosition });
        setShowMentionSuggestions(true);
      } else {
        setShowMentionSuggestions(false);
      }
    } else {
      setShowMentionSuggestions(false);
    }
  };

  const insertMention = (username: string) => {
    const beforeMention = content.substring(0, mentionPosition.start);
    const afterMention = content.substring(mentionPosition.end);
    const newContent = `${beforeMention}@${username} ${afterMention}`;
    
    setContent(newContent);
    setMentions([...mentions, username]);
    setShowMentionSuggestions(false);
    
    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPosition = mentionPosition.start + username.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  const removeMention = (username: string) => {
    setMentions(mentions.filter(m => m !== username));
    
    // Remove mention from content as well
    const mentionPattern = new RegExp(`@${username}\\b`, 'g');
    setContent(content.replace(mentionPattern, username));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setIsSaving(true);
      await onSave(content.trim(), mentions);
      
      // Reset form
      setContent('');
      setMentions([]);
      setShowMentionSuggestions(false);
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setMentions([]);
    setShowMentionSuggestions(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Note">
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-4">
          <div className="relative">
            <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 mb-2">
              Note Content
            </label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                id="note-content"
                value={content}
                onChange={handleContentChange}
                placeholder="Type your note here... Use @username to mention someone."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                required
              />
              
              {/* Mention suggestions dropdown */}
              {showMentionSuggestions && filteredUsers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {filteredUsers.slice(0, 5).map((user) => (
                    <button
                      key={user}
                      type="button"
                      onClick={() => insertMention(user)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center"
                    >
                      <AtSign className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">{user}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <p className="mt-1 text-sm text-gray-500">
              Type @ to mention team members. They'll be notified when you save this note.
            </p>
          </div>

          {/* Current mentions */}
          {mentions.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Mentions ({mentions.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {mentions.map((mention) => (
                  <span
                    key={mention}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    @{mention}
                    <button
                      type="button"
                      onClick={() => removeMention(mention)}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Character count */}
          <div className="text-right">
            <span className="text-sm text-gray-500">
              {content.length} / 1000 characters
            </span>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!content.trim() || isSaving}
            className="flex items-center"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Add Note
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default NotesComponent;