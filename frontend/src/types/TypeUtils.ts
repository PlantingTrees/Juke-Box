import { ConversationArea, Interactable, ViewingArea, JukeboxArea } from './CoveyTownSocket';

/**
 * Test to see if an interactable is a conversation area
 */
export function isConversationArea(interactable: Interactable): interactable is ConversationArea {
  return 'occupantsByID' in interactable;
}

/**
 * Test to see if an interactable is a viewing area
 */
export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return 'isPlaying' in interactable;
}

/**
 * Test to see if an interactable is a juekbox area
 */
export function isJukeboxArea(interactable: Interactable): interactable is JukeboxArea {
  // referencing viewing Area implementation to see how data flows
  return 'isPlaying' in interactable;
  //return 'queue' in interactable;
}
