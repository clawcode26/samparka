import { Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
    lineHeight: {
      setLineHeight: (height: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
    textEffect: {
      setTextEffect: (effect: string) => ReturnType;
      unsetTextEffect: () => ReturnType;
    };
    indent: {
      increaseIndent: () => ReturnType;
      decreaseIndent: () => ReturnType;
    };
    border: {
      toggleBorder: () => ReturnType;
    };
  }
}

export const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize }).run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
      },
    };
  },
});

export const LineHeight = Extension.create({
  name: 'lineHeight',
  addOptions() {
    return { types: ['paragraph', 'heading', 'listItem'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLineHeight: lineHeight => ({ commands }) => {
        return this.options.types.every((type: string) => commands.updateAttributes(type, { lineHeight }));
      },
      unsetLineHeight: () => ({ commands }) => {
        return this.options.types.every((type: string) => commands.resetAttributes(type, 'lineHeight'));
      },
    };
  },
});

export const TextEffect = Extension.create({
  name: 'textEffect',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textEffect: {
            default: null,
            parseHTML: element => element.style.textShadow?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.textEffect) return {};
              return { style: `text-shadow: ${attributes.textEffect}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setTextEffect: textEffect => ({ chain }) => {
        return chain().setMark('textStyle', { textEffect }).run();
      },
      unsetTextEffect: () => ({ chain }) => {
        return chain().setMark('textStyle', { textEffect: null }).removeEmptyTextStyle().run();
      },
    };
  },
});

export const Indent = Extension.create({
  name: 'indent',
  addOptions() {
    return { types: ['paragraph', 'heading'], minIndent: 0, maxIndent: 8, indentSize: 2 };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: element => parseInt(element.style.marginLeft) || 0,
            renderHTML: attributes => {
              if (attributes.indent === 0) return {};
              return { style: `margin-left: ${attributes.indent}rem` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      increaseIndent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        let applied = false;
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            if (currentIndent < this.options.maxIndent * this.options.indentSize) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: currentIndent + this.options.indentSize });
              applied = true;
            }
          }
        });
        if (dispatch && applied) dispatch(tr);
        return applied;
      },
      decreaseIndent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        let applied = false;
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            if (currentIndent > this.options.minIndent) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: currentIndent - this.options.indentSize });
              applied = true;
            }
          }
        });
        if (dispatch && applied) dispatch(tr);
        return applied;
      },
    };
  },
});

export const Border = Extension.create({
  name: 'border',
  addOptions() {
    return { types: ['paragraph', 'heading'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          borderActive: {
            default: false,
            parseHTML: element => element.style.border !== '',
            renderHTML: attributes => {
              if (!attributes.borderActive) return {};
              return { style: 'border: 1px solid var(--border-color); padding: 8px; border-radius: 4px;' };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      toggleBorder: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        let applied = false;
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const current = node.attrs.borderActive;
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, borderActive: !current });
            applied = true;
          }
        });
        if (dispatch && applied) dispatch(tr);
        return applied;
      },
    };
  },
});

import { Plugin, PluginKey } from '@tiptap/pm/state';
import Sanscript from '@indic-transliteration/sanscript';

export const Transliteration = Extension.create({
  name: 'transliteration',
  addStorage() {
    return {
      enabled: false,
    };
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('transliteration'),
        props: {
          handleKeyDown: (view, event) => {
            if (!this.storage.enabled) return false;

            const triggers = [' ', '.', ',', '?', '!', ';', ':'];
            if (!triggers.includes(event.key)) return false;

            const { state, dispatch } = view;
            const { selection } = state;
            const { $from } = selection;

            // Safely get text of parent paragraph before the cursor
            const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);

            // Match last word ending in letters
            const match = textBefore.match(/([a-zA-Z]+)$/);
            if (match) {
              const word = match[1];
              // Transliterate Roman phonetics (ITRANS) to Oriya
              const transliterated = Sanscript.t(word, 'itrans', 'oriya');
              const startPos = $from.pos - word.length;
              const endPos = $from.pos;

              if (dispatch) {
                let tr = state.tr.insertText(transliterated, startPos, endPos);
                const mappedEndPos = tr.mapping.map(endPos);
                tr = tr.insertText(event.key, mappedEndPos);
                dispatch(tr);
              }
              return true; // Prevent default so PM state stays in sync
            }

            return false;
          },
        },
      }),
    ];
  },
});
