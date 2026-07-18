"use client";
import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import LinkExtension from '@tiptap/extension-link';
import FontFamily from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { FontSize, LineHeight, TextEffect, Indent, Border, Transliteration } from './EditorExtensions';

import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  AArrowUp, AArrowDown, Type, Eraser,
  Subscript as SubscriptIcon, Superscript as SuperscriptIcon,
  Highlighter, Baseline, 
  List, ListOrdered, ListTree,
  IndentDecrease, IndentIncrease, ArrowDownAZ, Pilcrow,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ArrowUpDown, PaintBucket, LayoutGrid, ChevronDown
} from 'lucide-react';
import styles from './RichTextEditor.module.css';

const MenuBar = ({ 
  editor, 
  showMarks, 
  setShowMarks, 
  isOdiaEnabled, 
  setIsOdiaEnabled 
}: { 
  editor: any; 
  showMarks: boolean; 
  setShowMarks: (s: boolean) => void;
  isOdiaEnabled: boolean;
  setIsOdiaEnabled: (e: boolean) => void;
}) => {
  if (!editor) return null;

  const currentFontSize = editor.getAttributes('textStyle').fontSize || '18px';
  const currentFontSizeNum = parseInt(currentFontSize) || 18;

  const toggleCase = () => {
    const { state } = editor;
    const { from, to } = state.selection;
    if (from === to) return;
    const text = state.doc.textBetween(from, to, '\n');
    let newText = text;
    if (text === text.toUpperCase()) {
      newText = text.toLowerCase();
    } else if (text === text.toLowerCase()) {
      newText = text.replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    } else {
      newText = text.toUpperCase();
    }
    editor.chain().focus().insertContent(newText).run();
  };

  const setHighlight = () => {
    const color = window.prompt("Enter highlight color (e.g., yellow, #ff0):", "yellow");
    if (color) editor.chain().focus().toggleHighlight({ color }).run();
  };

  const setTextColor = () => {
    const color = window.prompt("Enter font color (e.g., red, #f00):", "red");
    if (color) editor.chain().focus().setColor(color).run();
  };

  return (
    <div className={styles.ribbon}>
      
      {/* ─── FONT GROUP ─── */}
      <div className={styles.ribbonGroup}>
        <div className={styles.ribbonControls}>
          {/* Font Row 1 */}
          <div className={styles.ribbonRow}>
            <select 
              className={styles.ribbonSelect} 
              style={{ width: '100px' }}
              onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
              value={editor.getAttributes('textStyle').fontFamily || ''}
            >
              <option value="">Default Font</option>
              <option value="Playfair Display">Playfair Display</option>
              <option value="Source Serif 4">Source Serif</option>
              <option value="Inter">Inter</option>
              <option value="var(--font-odia)">Odia (Noto Sans)</option>
            </select>
            <select 
              className={styles.ribbonSelect} 
              style={{ width: '48px' }}
              onChange={(e) => editor.chain().focus().setFontSize(`${e.target.value}px`).run()}
              value={currentFontSizeNum}
            >
              <option value="12">12</option>
              <option value="14">14</option>
              <option value="16">16</option>
              <option value="18">18</option>
              <option value="20">20</option>
              <option value="24">24</option>
              <option value="32">32</option>
            </select>
            
            <div className={styles.ribbonDivider} />
            
            <button onClick={() => editor.chain().focus().setFontSize(`${currentFontSizeNum + 2}px`).run()} className={styles.ribbonBtn} title="Increase Font Size"><AArrowUp size={14} /></button>
            <button onClick={() => editor.chain().focus().setFontSize(`${Math.max(8, currentFontSizeNum - 2)}px`).run()} className={styles.ribbonBtn} title="Decrease Font Size"><AArrowDown size={14} /></button>
            
            <div className={styles.ribbonDivider} />
            
            <button onClick={toggleCase} className={`${styles.ribbonBtn} ${styles.ribbonBtnWithArrow}`} title="Change Case">
              <Type size={14} /> <ChevronDown size={10} />
            </button>
            <button onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} className={styles.ribbonBtn} title="Clear All Formatting">
              <Eraser size={14} />
            </button>
          </div>
          
          {/* Font Row 2 */}
          <div className={styles.ribbonRow}>
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`${styles.ribbonBtn} ${editor.isActive('bold') ? styles.active : ''}`} title="Bold"><Bold size={14} /></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`${styles.ribbonBtn} ${editor.isActive('italic') ? styles.active : ''}`} title="Italic"><Italic size={14} /></button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${styles.ribbonBtn} ${styles.ribbonBtnWithArrow} ${editor.isActive('underline') ? styles.active : ''}`} title="Underline">
              <UnderlineIcon size={14} /> <ChevronDown size={10} />
            </button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`${styles.ribbonBtn} ${editor.isActive('strike') ? styles.active : ''}`} title="Strikethrough"><Strikethrough size={14} /></button>
            
            <div className={styles.ribbonDivider} />
            
            <button onClick={() => editor.chain().focus().toggleSubscript().run()} className={`${styles.ribbonBtn} ${editor.isActive('subscript') ? styles.active : ''}`} title="Subscript"><SubscriptIcon size={14} /></button>
            <button onClick={() => editor.chain().focus().toggleSuperscript().run()} className={`${styles.ribbonBtn} ${editor.isActive('superscript') ? styles.active : ''}`} title="Superscript"><SuperscriptIcon size={14} /></button>
            
            <div className={styles.ribbonDivider} />
            
            <button onClick={() => editor.chain().focus().setTextEffect('2px 2px 4px rgba(0,0,0,0.3)').run()} className={`${styles.ribbonBtn} ${styles.ribbonBtnWithArrow}`} title="Text Effects">
              <Type size={14} color="#3B82F6" /> <ChevronDown size={10} />
            </button>
            <button onClick={setHighlight} className={`${styles.ribbonBtn} ${styles.ribbonBtnWithArrow} ${editor.isActive('highlight') ? styles.active : ''}`} title="Text Highlight Color">
              <Highlighter size={14} color="#EAB308" /> <ChevronDown size={10} />
            </button>
            <button onClick={setTextColor} className={`${styles.ribbonBtn} ${styles.ribbonBtnWithArrow}`} title="Font Color">
              <Baseline size={14} color="#EF4444" /> <ChevronDown size={10} />
            </button>
          </div>
        </div>
        <div className={styles.ribbonLabel}>Font</div>
      </div>

      {/* ─── PARAGRAPH GROUP ─── */}
      <div className={styles.ribbonGroup}>
        <div className={styles.ribbonControls}>
          {/* Paragraph Row 1 */}
          <div className={styles.ribbonRow}>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${styles.ribbonBtn} ${styles.ribbonBtnWithArrow} ${editor.isActive('bulletList') ? styles.active : ''}`} title="Bullets">
              <List size={14} /> <ChevronDown size={10} />
            </button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${styles.ribbonBtn} ${styles.ribbonBtnWithArrow} ${editor.isActive('orderedList') ? styles.active : ''}`} title="Numbering">
              <ListOrdered size={14} /> <ChevronDown size={10} />
            </button>
            <button onClick={() => editor.chain().focus().sinkListItem('listItem').run()} className={`${styles.ribbonBtn} ${styles.ribbonBtnWithArrow}`} title="Multilevel List">
              <ListTree size={14} /> <ChevronDown size={10} />
            </button>
            
            <div className={styles.ribbonDivider} />
            
            <button onClick={() => editor.chain().focus().decreaseIndent().run()} className={styles.ribbonBtn} title="Decrease Indent"><IndentDecrease size={14} /></button>
            <button onClick={() => editor.chain().focus().increaseIndent().run()} className={styles.ribbonBtn} title="Increase Indent"><IndentIncrease size={14} /></button>
            
            <div className={styles.ribbonDivider} />
            
            <button onClick={() => window.alert("Sort: In a full app, this would sort list items A-Z.")} className={styles.ribbonBtn} title="Sort"><ArrowDownAZ size={14} /></button>
            <button onClick={() => setShowMarks(!showMarks)} className={`${styles.ribbonBtn} ${showMarks ? styles.active : ''}`} title="Show/Hide ¶"><Pilcrow size={14} /></button>
          </div>
          
          {/* Paragraph Row 2 */}
          <div className={styles.ribbonRow}>
            <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`${styles.ribbonBtn} ${editor.isActive({ textAlign: 'left' }) ? styles.active : ''}`} title="Align Left"><AlignLeft size={14} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`${styles.ribbonBtn} ${editor.isActive({ textAlign: 'center' }) ? styles.active : ''}`} title="Align Center"><AlignCenter size={14} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`${styles.ribbonBtn} ${editor.isActive({ textAlign: 'right' }) ? styles.active : ''}`} title="Align Right"><AlignRight size={14} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`${styles.ribbonBtn} ${editor.isActive({ textAlign: 'justify' }) ? styles.active : ''}`} title="Justify"><AlignJustify size={14} /></button>
            
            <div className={styles.ribbonDivider} />
            
            <button onClick={() => {
              const current = editor.getAttributes('paragraph').lineHeight;
              const next = current === '2' ? '1.5' : current === '1.5' ? '1' : '2';
              editor.chain().focus().setLineHeight(next).run();
            }} className={`${styles.ribbonBtn} ${styles.ribbonBtnWithArrow}`} title="Line and Paragraph Spacing">
              <ArrowUpDown size={14} /> <ChevronDown size={10} />
            </button>
            
            <button onClick={setHighlight} className={`${styles.ribbonBtn} ${styles.ribbonBtnWithArrow}`} title="Shading (Uses Highlight)">
              <PaintBucket size={14} /> <ChevronDown size={10} />
            </button>
            <button onClick={() => editor.chain().focus().toggleBorder().run()} className={`${styles.ribbonBtn} ${styles.ribbonBtnWithArrow}`} title="Borders">
              <LayoutGrid size={14} /> <ChevronDown size={10} />
            </button>
          </div>
        </div>
        <div className={styles.ribbonLabel}>Paragraph</div>
      </div>

      {/* ─── KEYBOARD/INPUT GROUP ─── */}
      <div className={styles.ribbonGroup}>
        <div className={styles.ribbonControls}>
          <div className={styles.ribbonRow}>
            <button
              type="button"
              onClick={() => setIsOdiaEnabled(!isOdiaEnabled)}
              className={`${styles.ribbonBtn} ${isOdiaEnabled ? styles.active : ''}`}
              style={{ 
                padding: '6px var(--space-8)', 
                fontSize: '12px', 
                fontWeight: '600', 
                width: 'auto', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-4)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-color)',
                backgroundColor: isOdiaEnabled ? 'var(--brand-light)' : 'transparent',
                color: isOdiaEnabled ? 'var(--brand-color)' : 'inherit'
              }}
              title="Phonetic Roman-to-Odia transliteration (e.g. type 'namaskaara' -> 'ନମସ୍କାର')"
            >
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>ଓ</span>
              <span>ଓଡ଼ିଆ Input</span>
            </button>
          </div>
        </div>
        <div className={styles.ribbonLabel}>Keyboard</div>
      </div>
      
    </div>
  );
};

export function RichTextEditor({ 
  content, 
  onChange,
  isOdiaEnabled,
  setIsOdiaEnabled
}: { 
  content: string; 
  onChange: (html: string) => void;
  isOdiaEnabled: boolean;
  setIsOdiaEnabled: (e: boolean) => void;
}) {
  const [showMarks, setShowMarks] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      Image,
      Underline,
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      FontSize,
      LineHeight,
      TextEffect,
      Indent,
      Border,
      Transliteration,
      LinkExtension.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    immediatelyRender: true,
    content,
    editorProps: {
      attributes: {
        class: `${styles.prose} ${showMarks ? styles.showMarks : ''}`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor) {
      const storage = editor.storage as any;
      if (storage.transliteration) {
        storage.transliteration.enabled = isOdiaEnabled;
      }
      editor.setOptions({
        editorProps: {
          attributes: {
            class: `${styles.prose} ${showMarks ? styles.showMarks : ''} ${isOdiaEnabled ? styles.isOdia : ''}`
          }
        }
      } as any);
    }
  }, [isOdiaEnabled, showMarks, editor]);

  return (
    <div className={styles.editorContainer}>
      <MenuBar 
        editor={editor} 
        showMarks={showMarks} 
        setShowMarks={setShowMarks} 
        isOdiaEnabled={isOdiaEnabled}
        setIsOdiaEnabled={setIsOdiaEnabled}
      />
      <div className={styles.editorContent}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
