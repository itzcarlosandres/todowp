import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Enriquece el contenido HTML de un producto para SEO.
 *
 * Recibe:
 *   - content: HTML actual del editor
 *   - title: título del producto (contexto)
 *   - category: categoría del producto (contexto)
 *
 * Devuelve:
 *   - html: HTML mejorado con palabras clave en <strong>
 *   - metaDescription: meta descripción optimizada (≤160 chars)
 *   - keywords: lista de palabras clave añadidas
 *
 * Mejoras que hace la IA:
 *   1. Identifica 5-8 palabras clave relevantes
 *   2. Las agrega en <strong> donde aparecen naturalmente
 *   3. Reescribe la meta descripción usando esas keywords
 *   4. Mejora headings (H2/H3) para incluir keywords
 *   5. Mantiene el tono y longitud aproximada del contenido original
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, title, category } = await req.json();
    if (!content) {
      return NextResponse.json({ error: "Falta el contenido" }, { status: 400 });
    }

    const setting = await db.setting.findUnique({
      where: { key: "gemini_api_key" },
    });
    const apiKey = setting?.value as string;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Falta configurar la Clave de API de Gemini en Configuración → IA" },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Eres un experto en SEO y copywriting para un marketplace de productos digitales (WordPress themes, plugins, scripts, etc.).

Tu tarea es REESCRIBIR el contenido HTML provisto para optimizarlo para SEO sin cambiar su significado.

REGLAS ESTRICTAS:
- Identifica entre 5 y 8 palabras clave relevantes para "${title ?? "el producto"}"${category ? ` (categoría: ${category})` : ""}.
- En el contenido devuelto, ENVUELVE cada aparición de esas palabras clave en una etiqueta <strong>...</strong> para resaltarlas.
- Mantén la estructura HTML existente (h2, h3, p, ul, li, etc.). No elimines bloques importantes.
- Si los headings (h2, h3) no incluyen palabras clave, reescríbelos para incluirlas naturalmente.
- Añade o mejora una meta descripción al final como un bloque especial <!--META_DESCRIPTION-->descripción de máximo 160 caracteres<!--END_META-->. Esta meta descripción DEBE incluir al menos 2 palabras clave.
- Conserva el idioma original del contenido (probablemente español).
- NO añadas explicaciones, ni "Aquí está el HTML:". Solo devuelve el HTML.
- NO uses \`\`\`html ni fences de markdown. Devuelve HTML puro.

Contenido HTML a mejorar:
${content}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("No se pudo obtener texto de Gemini");
    }

    // Limpiar fences de markdown si la IA las agregó
    let cleaned = text.trim();
    if (cleaned.startsWith("```html")) cleaned = cleaned.slice(7);
    if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    // Extraer meta description
    let metaDescription = "";
    const metaMatch = cleaned.match(/<!--META_DESCRIPTION-->([\s\S]*?)<!--END_META-->/);
    if (metaMatch && metaMatch[1]) {
      metaDescription = metaMatch[1].trim();
      cleaned = cleaned.replace(/<!--META_DESCRIPTION-->[\s\S]*?<!--END_META-->/, "").trim();
    }

    // Extraer palabras clave para devolverlas (busca <strong>...</strong>)
    const keywordMatches = Array.from(cleaned.matchAll(/<strong[^>]*>([^<]+)<\/strong>/g));
    const keywords = Array.from(
      new Set(keywordMatches.map((m) => (m[1] ?? "").trim()).filter(Boolean)),
    ).slice(0, 8);

    return NextResponse.json({
      success: true,
      html: cleaned,
      metaDescription,
      keywords,
    });
  } catch (error: any) {
    console.error("AI Enhance SEO error:", error);
    return NextResponse.json(
      { error: error.message || "Error al mejorar con IA" },
      { status: 500 },
    );
  }
}
