'use client'

import { useState } from 'react'
import { Send, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ChatBarProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
  onStop?: () => void
}

export default function ChatBar({ onSendMessage, isLoading = false, onStop }: ChatBarProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }


  return (
    <div className="border-t p-4 bg-card">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || isLoading}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
        <Button
          type="reset"
          onClick={isLoading ? onStop : undefined}
          size="icon"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
} 