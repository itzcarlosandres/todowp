"use client";

import { useEffect, useRef, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Alignment,
  Autoformat,
  AutoLink,
  BlockQuote,
  Bold,
  Code,
  CodeBlock,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
  HorizontalLine,
  Image,
  ImageCaption,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SpecialCharacters,
  SpecialCharactersEssentials,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  Undo,
  EventInfo,
  Editor,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

import { cn } from "@/lib/utils";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RichTextEditorProps {
  /** ID del campo en el form (se usa como name del form) */
  name: string;
  /** Valor inicial (HTML) */
  defaultValue?: string;
  /** Placeholder */
  placeholder?: string;
  /** Altura mínima del editor */
  minHeight?: number;
  /** Callback cuando el contenido cambia */
  onChange?: (html: string) => void;
  /** ClassName extra para el wrapper */
  className?: string;
  /** Si es true, muestra el botón "Mejorar SEO con IA" */
  enableAI?: boolean;
  /** Contexto del producto para la IA (título, etc.) */
  aiContext?: {
    title?: string;
    category?: string;
  };
  /** Callback cuando la IA mejora el contenido */
  onAIEnhance?: (html: string, metaDescription: string) => void;
}

/**
 * Editor de texto enriquecido basado en CKEditor 5.
 *
 * Incluye:
 * - Formato básico (negrita, cursiva, subrayado, tachado, super/subíndice)
 * - Encabezados H1-H6, párrafos, citas, bloques de código
 * - Listas (ordenadas, desordenadas, todo)
 * - Tablas con toolbar
 * - Imágenes (insert por URL, resize, caption)
 * - Links, media embed (YouTube, Vimeo, etc.)
 * - Alineación, indentación
 * - Colores de texto y fondo, fuentes, tamaños
 * - Caracteres especiales, buscar y reemplazar
 * - Autoformato, autolink
 * - Deshacer/rehacer
 * - **Botón IA**: "Mejorar con IA" que enriquece el contenido y sugiere
 *   meta-descripción con palabras clave (negritas) optimizadas para SEO
 *
 * El bundle se carga dinámicamente (client-only) para no inflar el SSR.
 */
export function RichTextEditor({
  name,
  defaultValue = "",
  placeholder = "Escribe aquí la descripción del producto...",
  minHeight = 300,
  onChange,
  className,
  enableAI = false,
  aiContext,
  onAIEnhance,
}: RichTextEditorProps) {
  const [isClient, setIsClient] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const editorInstance = useRef<Editor | null>(null);
  const formValueRef = useRef<string>(defaultValue);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const config = {
    licenseKey: "GPL",
    plugins: [
      Essentials,
      Autoformat,
      AutoLink,
      Alignment,
      BlockQuote,
      Bold,
      Code,
      CodeBlock,
      FindAndReplace,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      Heading,
      HorizontalLine,
      Image,
      ImageCaption,
      ImageInsert,
      ImageInsertViaUrl,
      ImageResize,
      ImageStyle,
      ImageToolbar,
      ImageUpload,
      Indent,
      IndentBlock,
      Italic,
      Link,
      LinkImage,
      List,
      ListProperties,
      MediaEmbed,
      Paragraph,
      PasteFromOffice,
      RemoveFormat,
      SpecialCharacters,
      SpecialCharactersEssentials,
      Strikethrough,
      Subscript,
      Superscript,
      Table,
      TableCellProperties,
      TableColumnResize,
      TableProperties,
      TableToolbar,
      TextTransformation,
      TodoList,
      Underline,
      Undo,
    ],
    toolbar: {
      items: [
        "undo",
        "redo",
        "|",
        "heading",
        "|",
        "fontSize",
        "fontFamily",
        "fontColor",
        "fontBackgroundColor",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "subscript",
        "superscript",
        "code",
        "removeFormat",
        "|",
        "alignment",
        "|",
        "numberedList",
        "bulletedList",
        "todoList",
        "|",
        "outdent",
        "indent",
        "|",
        "link",
        "insertImage",
        "insertImageViaUrl",
        "mediaEmbed",
        "insertTable",
        "blockQuote",
        "codeBlock",
        "horizontalLine",
        "specialCharacters",
        "|",
        "findAndReplace",
      ],
      shouldNotGroupWhenFull: true,
    },
    heading: {
      options: [
        { model: "paragraph", title: "Párrafo", class: "ck-heading_paragraph" },
        { model: "heading1", view: "h1", title: "Título 1", class: "ck-heading_heading1" },
        { model: "heading2", view: "h2", title: "Título 2", class: "ck-heading_heading2" },
        { model: "heading3", view: "h3", title: "Título 3", class: "ck-heading_heading3" },
        { model: "heading4", view: "h4", title: "Título 4", class: "ck-heading_heading4" },
      ],
    },
    image: {
      toolbar: [
        "imageStyle:inline",
        "imageStyle:block",
        "imageStyle:side",
        "|",
        "toggleImageCaption",
        "imageTextAlternative",
        "|",
        "linkImage",
        "resizeImage",
      ],
    },
    table: {
      contentToolbar: [
        "tableColumn",
        "tableRow",
        "mergeTableCells",
        "tableProperties",
        "tableCellProperties",
      ],
    },
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true,
      },
    },
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: "https://",
    },
    placeholder,
  };

  const handleAIEnhance = async () => {
    if (!editorInstance.current) return;
    const currentHtml = editorInstance.current.getData();
    if (!currentHtml || currentHtml === "<p></p>") {
      toast.error("Escribe algo de contenido primero para que la IA pueda mejorarlo");
      return;
    }

    setIsAILoading(true);
    try {
      const res = await fetch("/api/ai/enhance-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: currentHtml,
          title: aiContext?.title,
          category: aiContext?.category,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Reemplaza el contenido con la versión mejorada
      editorInstance.current.setData(data.html);

      if (onAIEnhance) {
        onAIEnhance(data.html, data.metaDescription);
      }

      toast.success(
        `Contenido mejorado con ${data.keywords?.length ?? 0} palabras clave destacadas`,
      );
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al mejorar con IA");
    } finally {
      setIsAILoading(false);
    }
  };

  if (!isClient) {
    return (
      <div
        className={cn(
          "rounded-md border border-input bg-muted/30 flex items-center justify-center text-sm text-muted-foreground",
          className,
        )}
        style={{ minHeight: minHeight + 60 }}
      >
        Cargando editor...
      </div>
    );
  }

  return (
    <div className={cn("rich-editor-wrapper space-y-2", className)}>
      {enableAI && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            💡 Escribe el contenido y luego usa la IA para mejorarlo con SEO.
          </p>
          <Button
            type="button"
            variant="brand"
            size="sm"
            className="h-7 text-xs shadow-sm"
            onClick={handleAIEnhance}
            disabled={isAILoading}
          >
            {isAILoading ? (
              <Loader2 className="size-3 mr-1 animate-spin" />
            ) : (
              <Sparkles className="size-3 mr-1" />
            )}
            Mejorar con IA (SEO)
          </Button>
        </div>
      )}

      <div
        className="rounded-md border border-input overflow-hidden bg-background"
        style={{ minHeight }}
      >
        <CKEditor
          editor={ClassicEditor}
          config={config as any}
          data={defaultValue}
          onReady={(editor: Editor) => {
            editorInstance.current = editor;
          }}
          onChange={(_event: EventInfo, editor: Editor) => {
            const data = editor.getData();
            formValueRef.current = data;
            onChange?.(data);
          }}
        />
      </div>

      {/* Hidden input para que el valor se incluya en el form submit */}
      <input type="hidden" name={name} defaultValue={formValueRef.current} id={`${name}-hidden`} />

      <style jsx global>{`
        .rich-editor-wrapper .ck-editor__editable {
          min-height: ${minHeight - 20}px;
        }
        .rich-editor-wrapper .ck-editor__editable_inline {
          padding: 1rem 1.25rem;
        }
        .rich-editor-wrapper .ck-content h1 { font-size: 1.875rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .rich-editor-wrapper .ck-content h2 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .rich-editor-wrapper .ck-content h3 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
        .rich-editor-wrapper .ck-content h4 { font-size: 1.125rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
        .rich-editor-wrapper .ck-content p { margin: 0.5rem 0; line-height: 1.6; }
        .rich-editor-wrapper .ck-content ul,
        .rich-editor-wrapper .ck-content ol { padding-left: 1.5rem; margin: 0.5rem 0; }
        .rich-editor-wrapper .ck-content blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding: 0.5rem 1rem;
          margin: 0.75rem 0;
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }
        .rich-editor-wrapper .ck-content code {
          background: hsl(var(--muted));
          padding: 0.1rem 0.3rem;
          border-radius: 4px;
          font-family: var(--font-mono, monospace);
          font-size: 0.9em;
        }
        .rich-editor-wrapper .ck-content pre {
          background: hsl(var(--muted));
          padding: 0.75rem;
          border-radius: 6px;
          overflow-x: auto;
        }
        .rich-editor-wrapper .ck-content table {
          border-collapse: collapse;
          margin: 0.75rem 0;
        }
        .rich-editor-wrapper .ck-content table td,
        .rich-editor-wrapper .ck-content table th {
          border: 1px solid hsl(var(--border));
          padding: 0.5rem;
        }
        .rich-editor-wrapper .ck-content img {
          max-width: 100%;
          height: auto;
          border-radius: 6px;
        }
        .rich-editor-wrapper .ck-content a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
