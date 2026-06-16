"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Conversation } from "@/modules/inbox/types/inbox.types";
import { detectNewInboundConversations } from "@/modules/inbox/utils/conversation-notification";

interface UseInboxNotificationSoundOptions {
  conversations: Conversation[];
  ready: boolean;
  muted: boolean;
  tenantId: string | null;
  soundUrl?: string;
}

export function useInboxNotificationSound({
  conversations,
  ready,
  muted,
  tenantId,
  soundUrl = "/sounds/ElevenLabs_Som_suave.mp3",
}: UseInboxNotificationSoundOptions) {
  const initializedRef = useRef(false);
  const previousKeysRef = useRef<Map<string, string>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tenantIdRef = useRef<string | null>(tenantId);

  const getAudio = useCallback(() => {
    if (typeof Audio === "undefined") return null;
    if (!audioRef.current) {
      audioRef.current = new Audio(soundUrl);
      audioRef.current.preload = "auto";
      audioRef.current.volume = 0.45;
    }
    return audioRef.current;
  }, [soundUrl]);

  const primeNotificationSound = useCallback(() => {
    const audio = getAudio();
    if (!audio) return;

    audio.volume = 0;
    audio.currentTime = 0;
    void audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0.45;
      })
      .catch(() => {
        audio.volume = 0.45;
      });
  }, [getAudio]);

  const playNotificationSound = useCallback(() => {
    const audio = getAudio();
    if (!audio) return;
    audio.currentTime = 0;
    audio.volume = 0.45;
    void audio.play().catch(() => {});
  }, [getAudio]);

  useEffect(() => {
    getAudio();
  }, [getAudio]);

  useEffect(() => {
    const primeOnFirstInteraction = () => primeNotificationSound();
    window.addEventListener("pointerdown", primeOnFirstInteraction, { once: true });
    window.addEventListener("keydown", primeOnFirstInteraction, { once: true });
    return () => {
      window.removeEventListener("pointerdown", primeOnFirstInteraction);
      window.removeEventListener("keydown", primeOnFirstInteraction);
    };
  }, [primeNotificationSound]);

  useEffect(() => {
    if (!ready) return;

    if (tenantIdRef.current !== tenantId) {
      tenantIdRef.current = tenantId;
      initializedRef.current = false;
      previousKeysRef.current = new Map();
    }

    const result = detectNewInboundConversations(
      previousKeysRef.current,
      conversations,
      initializedRef.current
    );
    previousKeysRef.current = result.nextKeys;

    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    if (!muted && result.newInboundConversations.length > 0) {
      playNotificationSound();
    }
  }, [conversations, muted, playNotificationSound, ready, tenantId]);

  return { primeNotificationSound };
}
