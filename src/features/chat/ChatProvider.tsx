import { createContext, useContext, type ReactNode } from 'react';
import { useFanContext } from '../context/ContextProvider';
import { useChat, type UseChatResult } from './useChat';

const Ctx = createContext<UseChatResult | null>(null);

/** Shares one chat session across the chat panel, map, quick actions and palette. */
export function ChatProvider({ children }: { children: ReactNode }) {
  const { context, ui } = useFanContext();
  const chat = useChat(context, ui.errorGeneric);
  return <Ctx.Provider value={chat}>{children}</Ctx.Provider>;
}

export function useChatContext(): UseChatResult {
  const value = useContext(Ctx);
  if (!value) throw new Error('useChatContext must be used within a ChatProvider');
  return value;
}
