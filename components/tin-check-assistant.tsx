"use client"

import { useMemo, useState, type FormEvent } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { ArrowUp, RotateCcw, ShieldCheck, Sparkles, Square, UserRound } from "lucide-react"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import { Spinner } from "@/components/ui/spinner"
import { MAX_CHAT_MESSAGE_LENGTH, containsSensitiveData, type AssistantCheckContext } from "@/lib/chat-privacy"

type TinCheckAssistantProps = {
  checkContext: AssistantCheckContext | null
}

const suggestedQuestions = [
  "What can a TIN/name check confirm?",
  "How should I handle an unmatched result?",
  "Format check vs. official verification?",
]

function getText(message: UIMessage) {
  return message.parts.flatMap((part) => (part.type === "text" ? [part.text] : [])).join("")
}

export default function TinCheckAssistant({ checkContext }: TinCheckAssistantProps) {
  const [input, setInput] = useState("")
  const [privacyError, setPrivacyError] = useState("")
  const [shareSensitiveData, setShareSensitiveData] = useState(false)
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ id, messages }) => ({
          body: {
            id,
            messages: messages.slice(-1),
            shareSensitiveData,
            ...(shareSensitiveData && checkContext ? { checkContext } : {}),
          },
        }),
      }),
    [checkContext, shareSensitiveData],
  )
  const { messages, sendMessage, setMessages, status, error, clearError, stop } = useChat({
    transport,
    throttle: 50,
  })
  const isGenerating = status === "submitted" || status === "streaming"

  function handleSend(question: string) {
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || isGenerating) return

    if (containsSensitiveData(trimmedQuestion) && !shareSensitiveData) {
      setInput("")
      setPrivacyError("This looks like sensitive information. Turn on the sharing option below to send it to the AI, or remove it and ask a general question.")
      return
    }

    setPrivacyError("")
    clearError()
    setInput("")
    void sendMessage({ text: trimmedQuestion })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    handleSend(input)
  }

  function startNewChat() {
    setMessages([])
    clearError()
    setPrivacyError("")
    setInput("")
    setShareSensitiveData(false)
  }

  return (
    <aside className="guide-card assistant-card" aria-labelledby="assistant-title">
      <div className="guide-topline">
        <span className="guide-icon"><Sparkles aria-hidden="true" /></span>
        <span className="ai-label">SHOULDER CHECK AI</span>
        <span className="ai-live"><span className="status-dot" />Guidance only</span>
      </div>
      <div className="assistant-heading-row">
        <div>
          <h2 id="assistant-title">Verification, explained.</h2>
          <p className="guide-intro">Ask about workflows and safe next steps. You can opt in to share your current local check.</p>
        </div>
        <Button
          className="assistant-reset"
          type="button"
          variant="ghost"
          size="sm"
          onClick={startNewChat}
          disabled={messages.length === 0 && !error && !privacyError}
        >
          <RotateCcw data-icon="inline-start" aria-hidden="true" />
          New chat
        </Button>
      </div>

      <div className="assistant-log" aria-label="Conversation with Shoulder Check AI">
        <MessageScrollerProvider autoScroll defaultScrollPosition="end" scrollPreviousItemPeek={40}>
          <MessageScroller className="h-full">
            <MessageScrollerViewport aria-label="Assistant conversation">
              <MessageScrollerContent className="gap-4 p-3">
                {messages.length === 0 ? (
                  <MessageScrollerItem messageId="assistant-welcome">
                    <Message>
                      <MessageAvatar className="assistant-avatar"><Sparkles aria-hidden="true" /></MessageAvatar>
                      <MessageContent>
                        <MessageHeader>Shoulder Check assistant</MessageHeader>
                        <Bubble variant="ghost">
                          <BubbleContent>
                            I can explain workflows and local format results. I cannot confirm identity, ownership, or official tax-authority records.
                          </BubbleContent>
                        </Bubble>
                        <MessageFooter>General guidance only · not tax or legal advice</MessageFooter>
                      </MessageContent>
                    </Message>
                    <div className="assistant-suggestions" aria-label="Suggested questions">
                      {suggestedQuestions.map((question) => (
                        <Button
                          key={question}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="assistant-suggestion"
                          onClick={() => handleSend(question)}
                          disabled={isGenerating}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </MessageScrollerItem>
                ) : (
                  messages.map((message) => {
                    const isUser = message.role === "user"
                    return (
                      <MessageScrollerItem
                        key={message.id}
                        messageId={message.id}
                        scrollAnchor={isUser}
                      >
                        <Message align={isUser ? "end" : "start"}>
                          <MessageAvatar className={isUser ? "assistant-avatar assistant-avatar-user" : "assistant-avatar"}>
                            {isUser ? <UserRound aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}
                          </MessageAvatar>
                          <MessageContent>
                            <MessageHeader>{isUser ? "You" : "Shoulder Check assistant"}</MessageHeader>
                            <Bubble variant={isUser ? "tinted" : "ghost"}>
                              <BubbleContent>
                                <p className="assistant-message-text">{getText(message)}</p>
                              </BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    )
                  })
                )}
                {isGenerating && (
                  <MessageScrollerItem messageId="assistant-thinking">
                    <Marker role="status" className="assistant-thinking">
                      <MarkerIcon><Spinner /></MarkerIcon>
                      <MarkerContent>Preparing general guidance…</MarkerContent>
                    </Marker>
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      </div>

      <div className="assistant-data-sharing">
        <label className="assistant-consent">
          <input
            type="checkbox"
            checked={shareSensitiveData}
            onChange={(event) => {
              setShareSensitiveData(event.target.checked)
              setPrivacyError("")
            }}
            aria-describedby="assistant-data-sharing-description"
          />
          <span className="assistant-consent-copy">
            <strong>Allow sensitive-data sharing</strong>
            <span id="assistant-data-sharing-description">
              When on, each message may include your current tax ID, jurisdiction, ID type, format result, and sensitive text you type. It is sent to OpenAI through Vercel AI Gateway. Shoulder Check does not save requests; provider handling follows their policies.
            </span>
          </span>
        </label>
      </div>

      {privacyError && <p className="assistant-error" role="alert">{privacyError}</p>}
      {error && (
        <p className="assistant-error" role="alert">
          {error.message.includes("AI_GATEWAY_BILLING_REQUIRED") ? (
            <>Vercel AI Gateway needs billing enabled for this team. Add a valid card, then retry. <a href="https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card" target="_blank" rel="noreferrer">Open AI Gateway billing setup</a>.</>
          ) : (
            "The assistant is temporarily unavailable. Please try again."
          )}
        </p>
      )}

      <form className="assistant-composer" onSubmit={handleSubmit}>
        <InputGroup>
          <InputGroupTextarea
            aria-label="Message the Shoulder Check assistant"
            autoComplete="off"
            maxLength={MAX_CHAT_MESSAGE_LENGTH}
            onChange={(event) => {
              setInput(event.target.value)
              if (privacyError) setPrivacyError("")
              if (error) clearError()
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.shiftKey) return
              if (event.nativeEvent.isComposing || event.keyCode === 229) return
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }}
            placeholder="Ask a general verification question…"
            rows={2}
            value={input}
          />
          <InputGroupAddon align="inline-end">
            {isGenerating ? (
              <InputGroupButton type="button" size="icon-sm" variant="secondary" aria-label="Stop response" onClick={stop}>
                <Square aria-hidden="true" />
              </InputGroupButton>
            ) : (
              <InputGroupButton type="submit" size="icon-sm" aria-label="Send message" disabled={!input.trim()}>
                <ArrowUp aria-hidden="true" />
              </InputGroupButton>
            )}
          </InputGroupAddon>
        </InputGroup>
      </form>
      <p className="assistant-privacy-note">
        Common patterns that look like sensitive identifiers are blocked while sharing is off. When on, the current checker data and sensitive text are sent with each message. Shoulder Check does not persist chat content.
      </p>
    </aside>
  )
}
