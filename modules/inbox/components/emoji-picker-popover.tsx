"use client";

import { type CSSProperties } from "react";
import EmojiPicker, { Categories, Theme, type EmojiClickData } from "emoji-picker-react";

interface EmojiPickerPopoverProps {
  /** Recebe apenas a string do emoji (nunca o payload bruto). */
  onEmojiSelect: (emoji: string) => void;
}

// Nomes das categorias em pt-BR (a lib usa inglês por padrão).
const PT_BR_CATEGORIES = [
  { category: Categories.SUGGESTED, name: "Recentes" },
  { category: Categories.SMILEYS_PEOPLE, name: "Smileys e pessoas" },
  { category: Categories.ANIMALS_NATURE, name: "Animais e natureza" },
  { category: Categories.FOOD_DRINK, name: "Comidas e bebidas" },
  { category: Categories.TRAVEL_PLACES, name: "Viagens e lugares" },
  { category: Categories.ACTIVITIES, name: "Atividades" },
  { category: Categories.OBJECTS, name: "Objetos" },
  { category: Categories.SYMBOLS, name: "Símbolos" },
  { category: Categories.FLAGS, name: "Bandeiras" },
];

// Customização via CSS-vars da própria lib (preferível a sobrescrever CSS).
// Espaçamento confortável + cores chapadas estilo WhatsApp (dark).
const pickerVars: CSSProperties = {
  // densidade/espaçamento (mais respiro nas bordas)
  "--epr-emoji-size": "26px",
  "--epr-emoji-padding": "7px",
  "--epr-horizontal-padding": "18px",
  // categorias do topo (menores e mais juntas)
  "--epr-category-navigation-button-size": "26px",
  "--epr-header-padding": "10px 18px",
  // busca mais discreta/baixa
  "--epr-search-input-height": "34px",
  "--epr-search-input-padding": "0 10px",
  "--epr-search-bar-inner-padding": "8px",
  "--epr-search-input-border-radius": "6px",
  "--epr-search-border-color": "#222e35",
  "--epr-search-border-color-active": "#3b4a54",
  // títulos de seção (cor discreta; bg chapado para o sticky)
  "--epr-category-label-height": "28px",
  "--epr-category-label-padding": "6px 18px",
  "--epr-category-label-text-color": "#8696a0",
  // raio menos arredondado
  "--epr-picker-border-radius": "8px",
  // cores dark chapadas
  "--epr-dark-bg-color": "#111b21",
  "--epr-dark-category-label-bg-color": "#111b21",
  "--epr-dark-search-input-bg-color": "#202c33",
  "--epr-dark-search-input-bg-color-active": "#2a3942",
  "--epr-dark-picker-border-color": "#222e35",
  "--epr-dark-hover-bg-color": "#2a3942",
} as CSSProperties;

/**
 * Popover de emoji (biblioteca `emoji-picker-react`), tema dark compacto estilo
 * WhatsApp. Posicionado acima do composer, alinhado à esquerda. O `ref` é o nó
 * raiz, usado pelo composer para detectar clique-fora. Não renderiza HTML cru —
 * só repassa `emojiData.emoji`.
 */
export function EmojiPickerPopover({ onEmojiSelect }: EmojiPickerPopoverProps) {
  return (
    <div
      role="dialog"
      aria-label="Selecionar emoji"
      className="overflow-hidden rounded-lg border border-[#222e35] bg-[#111b21] shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
      style={{ width: "min(470px, calc(100vw - 24px))" }}
    >
      <EmojiPicker
        theme={Theme.DARK}
        categories={PT_BR_CATEGORIES}
        searchPlaceholder="Pesquisar emoji"
        width="100%"
        height={480}
        lazyLoadEmojis
        previewConfig={{ showPreview: false }}
        style={pickerVars}
        onEmojiClick={(emojiData: EmojiClickData) => onEmojiSelect(emojiData.emoji)}
      />
    </div>
  );
}
