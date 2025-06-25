'use client'

import { Plus, MessageSquare, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ChatHistory {
  id: string
  title: string
  timestamp: Date
}

interface HistoryProps {
  chats: ChatHistory[]
  currentChatId?: string
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
}

export default function History({ 
  chats, 
  currentChatId, 
  onNewChat, 
  onSelectChat, 
  onDeleteChat 
}: HistoryProps) {
  return (
    <div className="w-80 border-r flex flex-col h-full bg-muted/30">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <Button onClick={onNewChat} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 p-2 bg-background">
        {chats.length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">
            <MessageSquare className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>No chat history</p>
            <p className="text-sm">Start a new conversation</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <Card
                key={chat.id}
                className={`cursor-pointer transition-colors ${
                  currentChatId === chat.id
                    ? 'bg-accent'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{chat.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {chat.timestamp.toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="opacity-50 group-hover:opacity-100 h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteChat(chat.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
} 