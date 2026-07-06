import { useEffect, useRef } from 'react';
import { autocompletion } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { bracketMatching, defaultHighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { Compartment, EditorState } from '@codemirror/state';
import { drawSelection, EditorView, highlightActiveLine, keymap, lineNumbers } from '@codemirror/view';
import type { CodeLanguage } from '../types';

const languageCompartment = new Compartment();

const editorTheme = EditorView.theme({
  '&': {
    backgroundColor: '#0b1020',
    color: '#e8edf5',
  },
  '.cm-content': {
    caretColor: '#72f7d2',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#72f7d2',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#24436f',
  },
  '.cm-gutters': {
    backgroundColor: '#090d1a',
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
    color: '#64748b',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(114, 247, 210, 0.07)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(114, 247, 210, 0.09)',
    color: '#cbd5e1',
  },
}, { dark: true });

const syntaxTheme = syntaxHighlighting(defaultHighlightStyle, { fallback: true });

function languageExtension(language: CodeLanguage) {
  if (language === 'python') return python();
  if (language === 'java') return java();
  if (language === 'javascript') return javascript();
  return cpp();
}

type Props = {
  value: string;
  language: CodeLanguage;
  onChange: (code: string) => void;
};

export function CodeEditor({ value, language, onChange }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!hostRef.current) return;

    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          history(),
          drawSelection(),
          indentOnInput(),
          bracketMatching(),
          autocompletion(),
          highlightActiveLine(),
          editorTheme,
          syntaxTheme,
          keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
          languageCompartment.of(languageExtension(language)),
          EditorView.lineWrapping,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
        ],
      }),
    });

    viewRef.current = view;
    return () => view.destroy();
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || view.state.doc.toString() === value) return;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: languageCompartment.reconfigure(languageExtension(language)) });
  }, [language]);

  return <div className="editor" ref={hostRef} />;
}
