import { useEffect, useRef, useState, useCallback } from 'react';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import Tooltip from '@mui/material/Tooltip';
import '../../Scss/Custom/General/richtexteditor.scss';

const FONT_SIZES = [
    { label: '12px', value: '12px', execSize: '1' },
    { label: '14px', value: '14px', execSize: '2' },
    { label: '16px (Normal)', value: '16px', execSize: '3' },
    { label: '18px', value: '18px', execSize: '4' },
    { label: '20px', value: '20px', execSize: '5' },
    { label: '22px', value: '22px', execSize: '5' },
    { label: '24px', value: '24px', execSize: '6' },
    { label: '28px', value: '28px', execSize: '6' },
    { label: '32px', value: '32px', execSize: '7' },
    { label: '36px', value: '36px', execSize: '7' }
];

const SIZE_MAP = {
    '1': '12px',
    '2': '14px',
    '3': '16px',
    '4': '18px',
    '5': '22px',
    '6': '28px',
    '7': '36px'
};

const formatInitialContent = (content) => {
    if (!content) return '';
    if (/<[a-z][\s\S]*>/i.test(content)) {
        return content;
    }
    return content
        .split(/\n\n+/)
        .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
        .join('');
};

const RichTextEditor = ({ value = '', onChange, placeholder = 'Enter description...' }) => {
    const editorRef = useRef(null);
    const savedRangeRef = useRef(null);
    const [currentFontSize, setCurrentFontSize] = useState('16px');
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        justifyLeft: false,
        justifyCenter: false,
        justifyRight: false,
        justifyFull: false,
        insertUnorderedList: false,
        insertOrderedList: false
    });

    const saveSelection = useCallback(() => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && editorRef.current) {
            const range = sel.getRangeAt(0);
            if (editorRef.current.contains(range.commonAncestorContainer)) {
                savedRangeRef.current = range.cloneRange();
            }
        }
    }, []);

    const restoreSelection = useCallback(() => {
        if (savedRangeRef.current && editorRef.current) {
            editorRef.current.focus();
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(savedRangeRef.current);
            }
        } else if (editorRef.current) {
            editorRef.current.focus();
        }
    }, []);

    // Sync external value to innerHTML
    useEffect(() => {
        if (!editorRef.current) return;
        const formatted = formatInitialContent(value);
        if (editorRef.current.innerHTML !== formatted) {
            editorRef.current.innerHTML = formatted;
        }
    }, [value]);

    const handleContentChange = useCallback(() => {
        if (!editorRef.current) return;
        const html = editorRef.current.innerHTML;
        const isActuallyEmpty = !editorRef.current.innerText.trim() && !editorRef.current.querySelector('img');
        if (onChange) {
            onChange(isActuallyEmpty ? '' : html);
        }
        updateActiveStates();
    }, [onChange]);

    const updateActiveStates = useCallback(() => {
        saveSelection();
        if (!document.queryCommandState) return;
        try {
            setActiveFormats({
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'),
                justifyLeft: document.queryCommandState('justifyLeft'),
                justifyCenter: document.queryCommandState('justifyCenter'),
                justifyRight: document.queryCommandState('justifyRight'),
                justifyFull: document.queryCommandState('justifyFull'),
                insertUnorderedList: document.queryCommandState('insertUnorderedList'),
                insertOrderedList: document.queryCommandState('insertOrderedList')
            });

            // Detect current font size at selection/cursor
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                const node = sel.anchorNode;
                if (node && editorRef.current && editorRef.current.contains(node)) {
                    let elem = node.nodeType === 1 ? node : node.parentElement;
                    let foundSize = null;
                    while (elem && elem !== editorRef.current) {
                        if (elem.style && elem.style.fontSize) {
                            foundSize = elem.style.fontSize;
                            break;
                        }
                        elem = elem.parentElement;
                    }
                    if (foundSize) {
                        setCurrentFontSize(foundSize);
                    }
                }
            }
        } catch {
            // Ignore queryCommand errors if editor lost focus
        }
    }, [saveSelection]);

    const executeCommand = (command, val = null) => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        document.execCommand(command, false, val);
        handleContentChange();
    };

    const applyFontSize = (fontSizeObj) => {
        if (!editorRef.current) return;
        restoreSelection();
        document.execCommand('fontSize', false, fontSizeObj.execSize);

        // Convert generated <font size="..."> to <span style="font-size: ...">
        const fontElements = editorRef.current.querySelectorAll('font[size]');
        fontElements.forEach((el) => {
            const parentSpan = el.closest('span[style*="font-size"]');
            if (parentSpan && parentSpan !== editorRef.current && editorRef.current.contains(parentSpan)) {
                parentSpan.style.fontSize = fontSizeObj.value;
                while (el.firstChild) {
                    el.parentNode.insertBefore(el.firstChild, el);
                }
                el.parentNode.removeChild(el);
            } else {
                const span = document.createElement('span');
                span.style.fontSize = fontSizeObj.value;
                span.innerHTML = el.innerHTML;
                el.parentNode.replaceChild(span, el);
            }
        });

        setCurrentFontSize(fontSizeObj.value);
        handleContentChange();
    };

    const handleFontSizeSelect = (e) => {
        const targetVal = e.target.value;
        const found = FONT_SIZES.find((item) => item.value === targetVal);
        if (found) {
            applyFontSize(found);
        }
    };

    return (
        <div className="rich-editor-wrapper">
            <div
                className="rich-editor-toolbar"
                onMouseDown={(e) => {
                    // Prevent blur on contentEditable ONLY when clicking toolbar buttons.
                    // DO NOT prevent default for select elements so the dropdown menu opens!
                    if (e.target.closest('button')) {
                        e.preventDefault();
                    }
                }}
            >
                {/* Font Size Selector */}
                <div className="toolbar-group">
                    <select
                        className="toolbar-select"
                        value={FONT_SIZES.some((item) => item.value === currentFontSize) ? currentFontSize : '16px'}
                        onMouseDown={(e) => {
                            saveSelection();
                            e.stopPropagation();
                        }}
                        onChange={handleFontSizeSelect}
                        aria-label="Font Size"
                    >
                        {FONT_SIZES.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Text Formatting */}
                <div className="toolbar-group">
                    <Tooltip title="Bold (Ctrl+B)">
                        <button
                            type="button"
                            className={`toolbar-btn ${activeFormats.bold ? 'active' : ''}`}
                            onClick={() => executeCommand('bold')}
                        >
                            <FormatBoldIcon fontSize="small" />
                        </button>
                    </Tooltip>
                    <Tooltip title="Italic (Ctrl+I)">
                        <button
                            type="button"
                            className={`toolbar-btn ${activeFormats.italic ? 'active' : ''}`}
                            onClick={() => executeCommand('italic')}
                        >
                            <FormatItalicIcon fontSize="small" />
                        </button>
                    </Tooltip>
                    <Tooltip title="Underline (Ctrl+U)">
                        <button
                            type="button"
                            className={`toolbar-btn ${activeFormats.underline ? 'active' : ''}`}
                            onClick={() => executeCommand('underline')}
                        >
                            <FormatUnderlinedIcon fontSize="small" />
                        </button>
                    </Tooltip>
                    <Tooltip title="Clear Formatting">
                        <button
                            type="button"
                            className="toolbar-btn"
                            onClick={() => executeCommand('removeFormat')}
                        >
                            <FormatClearIcon fontSize="small" />
                        </button>
                    </Tooltip>
                </div>

                {/* Text Alignment */}
                <div className="toolbar-group">
                    <Tooltip title="Align Left">
                        <button
                            type="button"
                            className={`toolbar-btn ${activeFormats.justifyLeft ? 'active' : ''}`}
                            onClick={() => executeCommand('justifyLeft')}
                        >
                            <FormatAlignLeftIcon fontSize="small" />
                        </button>
                    </Tooltip>
                    <Tooltip title="Align Center">
                        <button
                            type="button"
                            className={`toolbar-btn ${activeFormats.justifyCenter ? 'active' : ''}`}
                            onClick={() => executeCommand('justifyCenter')}
                        >
                            <FormatAlignCenterIcon fontSize="small" />
                        </button>
                    </Tooltip>
                    <Tooltip title="Align Right">
                        <button
                            type="button"
                            className={`toolbar-btn ${activeFormats.justifyRight ? 'active' : ''}`}
                            onClick={() => executeCommand('justifyRight')}
                        >
                            <FormatAlignRightIcon fontSize="small" />
                        </button>
                    </Tooltip>
                    <Tooltip title="Align Justify">
                        <button
                            type="button"
                            className={`toolbar-btn ${activeFormats.justifyFull ? 'active' : ''}`}
                            onClick={() => executeCommand('justifyFull')}
                        >
                            <FormatAlignJustifyIcon fontSize="small" />
                        </button>
                    </Tooltip>
                </div>

                {/* Lists */}
                <div className="toolbar-group">
                    <Tooltip title="Bulleted List">
                        <button
                            type="button"
                            className={`toolbar-btn ${activeFormats.insertUnorderedList ? 'active' : ''}`}
                            onClick={() => executeCommand('insertUnorderedList')}
                        >
                            <FormatListBulletedIcon fontSize="small" />
                        </button>
                    </Tooltip>
                    <Tooltip title="Numbered List">
                        <button
                            type="button"
                            className={`toolbar-btn ${activeFormats.insertOrderedList ? 'active' : ''}`}
                            onClick={() => executeCommand('insertOrderedList')}
                        >
                            <FormatListNumberedIcon fontSize="small" />
                        </button>
                    </Tooltip>
                </div>

                {/* Undo / Redo */}
                <div className="toolbar-group">
                    <Tooltip title="Undo (Ctrl+Z)">
                        <button
                            type="button"
                            className="toolbar-btn"
                            onClick={() => executeCommand('undo')}
                        >
                            <UndoIcon fontSize="small" />
                        </button>
                    </Tooltip>
                    <Tooltip title="Redo (Ctrl+Y)">
                        <button
                            type="button"
                            className="toolbar-btn"
                            onClick={() => executeCommand('redo')}
                        >
                            <RedoIcon fontSize="small" />
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* Editable Content */}
            <div
                ref={editorRef}
                className="rich-editor-content"
                contentEditable="true"
                data-placeholder={placeholder}
                onInput={handleContentChange}
                onKeyUp={updateActiveStates}
                onMouseUp={updateActiveStates}
                spellCheck="true"
            />
        </div>
    );
};

export default RichTextEditor;
