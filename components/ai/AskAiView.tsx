"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

const sources = [
  "Lecture_03_Cell_Biology.pdf",
  "Syllabus_CS101.docx",
  "Midterm_Reviewer.pdf",
  "Chapter5_Notes.pdf",
];

const suggestions = [
  "Summarize this chapter",
  "Explain mitosis",
  "Make practice questions",
];

type Message = {
  who: "ai" | "you";
  text: string;
};

type SourceItemProps = {
  name: string;
  index: number;
};

function SourceItem({ name, index }: SourceItemProps) {
  const isActive = index === 0;

  return (
    <button
      type="button"
      className={`w-full rounded-xl p-3 text-left transition ${
        isActive
          ? "bg-white shadow-sm"
          : "hover:bg-[#eae8e2]"
      }`}
    >
      <b className="block text-sm">{name}</b>

      <span className="text-[11px] text-[#41493c]">
        {isActive
          ? "Active source · 14 citations"
          : "Indexed · strict source truth"}
      </span>
    </button>
  );
}

type ChatMessageProps = {
  message: Message;
};

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.who === "you";

  if (isUser) {
    return (
      <div className="ml-auto max-w-[75%] rounded-2xl rounded-br-sm bg-[#468432] p-4 text-sm text-white">
        {message.text}
      </div>
    );
  }

  return (
    <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-[#f0eee8] p-4 text-sm leading-6 text-[#1b1c19]">
      <p>{message.text}</p>

      <div className="mt-3 inline-flex rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-[#2d6a1b]">
        ⌁ Source: Lecture 03 · p.14
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full bg-white px-3 py-1 text-xs hover:bg-[#f5f3ee]"
        >
          Compare prophase vs anaphase
        </button>

        <button
          type="button"
          className="rounded-full bg-white px-3 py-1 text-xs hover:bg-[#f5f3ee]"
        >
          Explain spindle fiber attachment
        </button>
      </div>
    </div>
  );
}

type SuggestionButtonProps = {
  text: string;
  onSelect: (text: string) => void;
};

function SuggestionButton({
  text,
  onSelect,
}: SuggestionButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(text)}
      className="whitespace-nowrap rounded-full bg-[#f5f3ee] px-3 py-1.5 text-sm text-[#41493c] transition hover:bg-[#eae8e2]"
    >
      {text}
    </button>
  );
}

export default function AskAiView() {
  const [text, setText] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      who: "ai",
      text: "Hi Alex! I’m grounded in your uploaded study materials. What would you like to understand today?",
    },
  ]);

  function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        who: "you",
        text: trimmedText,
      },
    ]);

    setText("");
  }

  function selectSuggestion(suggestion: string) {
    setText(suggestion);
  }

  return (
    <div className="grid min-h-[660px] overflow-hidden rounded-xl bg-white shadow-sm lg:grid-cols-[290px_1fr]">
      {/* =========================================
          LEFT SIDEBAR — STUDY MATERIALS
      ========================================== */}
      <aside className="border-b border-[#e4e2dd] bg-[#f5f3ee] p-5 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            Study Materials
          </h1>

          <span className="text-[#2d6a1b]">⌘</span>
        </div>

        <p className="mt-1 text-sm text-[#41493c]">
          Grounding index · 4 sources
        </p>

        <div className="mt-5 space-y-2">
          {sources.map((source, index) => (
            <SourceItem
              key={source}
              name={source}
              index={index}
            />
          ))}
        </div>

        {/* Source grounding information */}
        <div className="mt-6 rounded-xl bg-white p-4">
          <b className="text-sm">Source grounding</b>

          <p className="mt-1 text-sm text-[#41493c]">
            Answers include page and section references from
            your documents.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
            <span className="rounded-lg bg-[#f5f3ee] p-2">
              4 docs
            </span>

            <span className="rounded-lg bg-[#f5f3ee] p-2">
              108 pages
            </span>
          </div>
        </div>
      </aside>

      {/* =========================================
          RIGHT SIDE — ASK AI
      ========================================== */}
      <section className="flex min-h-[660px] flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e4e2dd] p-5">
          <div>
            <h2 className="font-semibold">
              Ask StudyMate
            </h2>

            <p className="text-sm text-[#41493c]">
              Lecture_03_Cell_Biology.pdf
            </p>
          </div>

          <span className="rounded-full bg-[#b4f48a] px-3 py-1 text-[11px] font-bold text-[#215100]">
            Strict Source Truth
          </span>
        </div>

        {/* Suggested prompts */}
        <div className="flex gap-2 overflow-auto border-b border-[#e4e2dd] p-3">
          {suggestions.map((suggestion) => (
            <SuggestionButton
              key={suggestion}
              text={suggestion}
              onSelect={selectSuggestion}
            />
          ))}
        </div>

        {/* Chat messages */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {messages.map((message, index) => (
            <ChatMessage
              key={`${message.who}-${index}`}
              message={message}
            />
          ))}
        </div>

        {/* =========================================
            MESSAGE INPUT
        ========================================== */}
        <form
          onSubmit={sendMessage}
          className="border-t border-[#e4e2dd] p-4"
        >
          <div className="flex items-center gap-2 rounded-full bg-[#f5f3ee] px-3 py-2">
            {/* Attachment */}
            <button
              type="button"
              aria-label="Attach study material"
              className="rounded-full p-1 hover:bg-[#eae8e2]"
            >
              <Icon
                name="paperclip"
                className="size-5 text-[#41493c]"
              />
            </button>

            {/* Input */}
            <input
              value={text}
              onChange={(event) =>
                setText(event.target.value)
              }
              className="flex-1 bg-transparent px-2 text-sm outline-none"
              placeholder="Ask a question about Lecture_03_Cell_Biology.pdf..."
            />

            {/* Send */}
            <button
              type="submit"
              aria-label="Send message"
              className="grid size-10 place-items-center rounded-full bg-[#468432] text-white transition hover:bg-[#2d6a1b]"
            >
              <Icon name="send" className="size-5" />
            </button>
          </div>

          {/* Grounding status */}
          <div className="mt-2 flex justify-between px-3 text-[11px] text-[#41493c]">
            <span>
              ● Grounding mode: Strict Source Truth
            </span>

            <span>
              Shift + Return for new line
            </span>
          </div>
        </form>
      </section>
    </div>
  );
}