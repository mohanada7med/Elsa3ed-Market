import React, { useEffect } from 'react';
import { toArabicDigitsSafe } from '../../utils/arabicNumbers';

const SKIPPED_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'TEXTAREA',
  'INPUT',
  'CODE',
  'PRE',
  'KBD',
  'SAMP',
]);

function shouldSkipElement(el: Element | null): boolean {
  let current: Element | null = el;
  while (current) {
    if (SKIPPED_TAGS.has(current.tagName)) return true;
    if (
      current.getAttribute('contenteditable') === 'true' ||
      current.getAttribute('data-western-digits') === 'true'
    ) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

function normalizeTextNode(node: Text): void {
  const value = node.nodeValue;
  if (!value || !/[0-9]/.test(value)) return;
  if (shouldSkipElement(node.parentElement)) return;
  const converted = toArabicDigitsSafe(value);
  if (converted !== value) {
    node.nodeValue = converted;
  }
}

function normalizeSubtree(root: Node): void {
  if (root.nodeType === Node.TEXT_NODE) {
    normalizeTextNode(root as Text);
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE) return;
  if (shouldSkipElement(root as Element)) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let currentNode = walker.nextNode();
  while (currentNode) {
    normalizeTextNode(currentNode as Text);
    currentNode = walker.nextNode();
  }
}

export const ArabicNumeralsGuard: React.FC = () => {
  useEffect(() => {
    if (typeof document === 'undefined' || !document.body) return;

    normalizeSubtree(document.body);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
          normalizeTextNode(mutation.target as Text);
        } else if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((addedNode) => {
            normalizeSubtree(addedNode);
          });
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
};

export default ArabicNumeralsGuard;
