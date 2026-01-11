/**
 * Custom hook for managing modal open/close state
 * Provides simple state management for modal visibility
 *
 * @returns {Object} Modal state and handlers
 * @property {boolean} isOpen - Whether modal is currently open
 * @property {Function} open - Open the modal
 * @property {Function} close - Close the modal
 * @property {Function} toggle - Toggle modal state
 *
 * @example
 * ```tsx
 * const { isOpen, open, close } = useModal();
 *
 * return (
 *   <>
 *     <button onClick={open}>Open Modal</button>
 *     <Modal isOpen={isOpen} onClose={close}>
 *       Modal content
 *     </Modal>
 *   </>
 * );
 * ```
 */

import { useState, useCallback } from "react";

export function useModal() {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Open the modal
   */
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * Close the modal
   */
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Toggle modal state
   */
  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
