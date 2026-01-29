import * as React from "react"
import { cn } from "@/lib/utils"
export interface TypingAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
const TypingArea = React.forwardRef<HTMLTextAreaElement, TypingAreaProps>(
  ({ className, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      const target = e.currentTarget
      target.style.height = 'auto'
      target.style.height = `${target.scrollHeight}px`
    }
    React.useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
    }, [])
    return (
      <textarea
        className={cn(
          "flex min-h-[200px] w-full rounded-md border border-input bg-background px-6 py-6 text-lg font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all leading-relaxed",
          className
        )}
        onInput={handleInput}
        ref={(node) => {
          textareaRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        {...props}
      />
    )
  }
)
TypingArea.displayName = "TypingArea"
export { TypingArea }