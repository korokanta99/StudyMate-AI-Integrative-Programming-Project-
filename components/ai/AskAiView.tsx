"use client";

import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { fetchAuthSession } from "aws-amplify/auth";

import Icon from "@/components/ui/Icon";

const API_BASE =
  "https://8auzzcojhh.execute-api.ap-southeast-1.amazonaws.com";

const starterPrompts = [
  "Explain photosynthesis simply",
  "Help me make a study plan",
  "Quiz me on this topic",
];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type AskAiResponse = {
  success?: boolean;
  message?: string;
  conversationId?: string;
};

function createConversationId() {
  return crypto.randomUUID();
}

function getResponseBody(value: unknown): AskAiResponse {
  if (!value || typeof value !== "object") {
    return {};
  }

  const response = value as Record<string, unknown>;

  return {
    success: typeof response.success === "boolean" ? response.success : undefined,
    message: typeof response.message === "string" ? response.message : undefined,
    conversationId:
      typeof response.conversationId === "string"
        ? response.conversationId
        : undefined,
  };
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <article
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      aria-label={isUser ? "Your message" : "StudyMate response"}
    >
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[75%] ${
          isUser
            ? "rounded-br-sm bg-[#468432] text-white"
            : "rounded-bl-sm bg-[#f0eee8] text-[#1b1c19]"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </article>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start" aria-label="StudyMate is thinking">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-[#f0eee8] px-4 py-3">
        <span className="size-2 animate-pulse rounded-full bg-[#6a7064]" />
        <span className="size-2 animate-pulse rounded-full bg-[#6a7064] [animation-delay:150ms]" />
        <span className="size-2 animate-pulse rounded-full bg-[#6a7064] [animation-delay:300ms]" />
        <span className="ml-2 text-sm text-[#41493c]">StudyMate is thinking</span>
      </div>
    </div>
  );
}

export default function AskAiView() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState(createConversationId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const chatAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chatArea = chatAreaRef.current;

    if (chatArea) {
      chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading, error]);

  async function getToken() {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    if (!token) {
      throw new Error("Your session has expired. Please log in again.");
    }

    return token;
  }

  async function sendMessage() {
    const message = input.trim();

    if (!message || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE}/ask-ai`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, conversationId }),
      });
      const body = getResponseBody(await response.json().catch(() => null));

      if (!response.ok || !body.success || !body.message) {
        throw new Error(body.message || "StudyMate could not answer that right now.");
      }

      const assistantMessage = body.message;

      setConversationId(body.conversationId || conversationId);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: assistantMessage,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (requestError) {
      console.error("Ask AI request failed:", requestError);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "StudyMate could not answer that right now. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  function startNewChat() {
    if (isLoading) {
      return;
    }

    setMessages([]);
    setConversationId(createConversationId());
    setInput("");
    setError("");
  }

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <section className="flex min-h-[680px] flex-col overflow-hidden rounded-xl bg-white shadow-sm">
      <header className="flex flex-col gap-4 border-b border-[#e4e2dd] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1b1c19]">Ask AI</h1>
          <p className="mt-1 text-sm text-[#41493c]">
            Your StudyMate assistant for questions, explanations, and study help.
          </p>
        </div>

        <button
          type="button"
          onClick={startNewChat}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-lg border border-[#d8d6cf] px-3 py-2 text-sm font-medium text-[#2d6a1b] transition hover:bg-[#f5f3ee] disabled:cursor-not-allowed disabled:opacity-50"
        >
          New Chat
        </button>
      </header>

      <div
        ref={chatAreaRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6"
        aria-live="polite"
        aria-busy={isLoading}
      >
        {messages.length === 0 ? (
          <div className="m-auto max-w-xl text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#e7f3df] text-[#2d6a1b]">
              <Icon name="spark" className="size-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">How can I help you study?</h2>
            <p className="mt-2 text-sm leading-6 text-[#41493c]">
              Ask a question, request a simpler explanation, or practice what you are learning.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  disabled={isLoading}
                  className="rounded-full bg-[#f5f3ee] px-3 py-2 text-sm text-[#41493c] transition hover:bg-[#eae8e2] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            {isLoading ? <TypingIndicator /> : null}
          </div>
        )}

        {error ? (
          <p
            className="mt-4 rounded-lg bg-[#fff0ed] px-3 py-2 text-sm text-[#a52a1f]"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-[#e4e2dd] p-4">
        <label htmlFor="ask-ai-message" className="sr-only">
          Ask StudyMate a question
        </label>
        <div className="flex items-end gap-2 rounded-xl bg-[#f5f3ee] p-2">
          <textarea
            id="ask-ai-message"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            placeholder="Ask StudyMate anything about your studies..."
            className="max-h-32 min-h-10 flex-1 resize-y bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-[#6a7064] disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!canSend}
            className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#468432] text-white transition hover:bg-[#2d6a1b] disabled:cursor-not-allowed disabled:bg-[#a8b6a2]"
          >
            <Icon name="send" className="size-5" />
          </button>
        </div>
        <p className="mt-2 px-1 text-xs text-[#41493c]">
          Press Enter to send. Use Shift+Enter for a new line.
        </p>
      </form>
    </section>
  );
}
