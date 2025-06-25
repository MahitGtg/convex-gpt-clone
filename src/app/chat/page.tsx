'use client'

import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import History from '@/components/history'
import ChatBar from '@/components/chat-bar'
import { Bot, User } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Authenticated, Unauthenticated, useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { useEffect, useState } from 'react'


export default function ChatPage() {
  const { user } = useUser()

  const [currentChatId, setCurrentChatId] = useState<Id<"chats"> | null>(null)
  const getOrCreateUser = useMutation(api.index.getOrCreateUser)
  const [convexUserId, setConvexUserId] = useState<Id<"users"> | null>(null)
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);


  useEffect(() => {
    if (user) {
      getOrCreateUser({
        tokenIdentifier: user.id,
        name: user.firstName ?? user.emailAddresses[0]?.emailAddress ?? "Unknown"
      }).then(setConvexUserId);
    }
  }, [user, getOrCreateUser]);
        
 // querys
  const chats = useQuery(api.index.listChats, convexUserId ? { userId: convexUserId } : "skip")
  const messages = useQuery(api.index.listMessages, currentChatId ? { chatId: currentChatId } : "skip")

 //mutations
  const createChat = useMutation(api.index.createChat)
  const deleteChat = useMutation(api.index.deleteChat)
  const sendMessage = useMutation(api.index.sendMessage)
  const chatHistory = (chats || []).map(chat => ({
    id: chat._id,
    title: chat.name,
    timestamp: new Date(chat._creationTime),
  }));

  // Handlers
  const handleNewChat = async () => {
    if (!convexUserId) return
    const newChatId = await createChat({ userId: convexUserId })
    setCurrentChatId(newChatId)
  }

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId as Id<"chats">)
}

  const handleDeleteChat = async (chatId: string) => {
    await deleteChat({ chatId: chatId as Id<"chats"> })
    setCurrentChatId(null)
}


  const handleSendMessage = (message: string) => {
    if (!convexUserId || !currentChatId) return
    setIsLoading(true);
    const controller = new AbortController();
    setAbortController(controller);

    sendMessage({
        chatId: currentChatId,
        userId: convexUserId,
        content: message,
      }).finally(() => {
        setIsLoading(false);
        setAbortController(null);
      });
  }
  
  const handleStop = () => {
    setIsLoading(false);
    if (abortController) {
      abortController.abort();
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between bg-card">
        <h1 className="text-xl font-semibold">GPT Clone</h1>
        <div className="flex items-center gap-4">
        <Authenticated>
          <span className="text-sm text-muted-foreground">
            Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
          </span>
          <UserButton afterSignOutUrl="/" />
        </Authenticated>
        <Unauthenticated>
          <SignInButton />
        </Unauthenticated>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Authenticated>
            <div>
                <History
                chats={chatHistory}
                currentChatId={currentChatId || undefined}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                onDeleteChat={handleDeleteChat}
                />
            </div>
        </Authenticated>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            {!currentChatId ? (
              <div className="text-center text-muted-foreground mt-20">
                <Bot className="mx-auto mb-4 h-16 w-16 opacity-50" />
                <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
                <p>Start a new conversation to begin chatting</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages?.map((message) => (
                  <div
                    key={message._id}
                    className={`flex gap-4 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`flex gap-3 max-w-3xl ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div
                        className={`rounded-lg px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                {messages?.length === 0 && (
                  <div className="flex gap-4 justify-start">
                    <div className="flex gap-3 max-w-3xl">
                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted rounded-lg px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        
          {currentChatId && (
            <div>
              {/* Chat Bar */}
              <ChatBar 
              onSendMessage={handleSendMessage} 
              onStop={handleStop} 
              isLoading={isLoading} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
