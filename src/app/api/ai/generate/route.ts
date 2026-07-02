import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, type = "description" } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Falta el prompt" }, { status: 400 });
    }

    const setting = await db.setting.findUnique({
      where: { key: "gemini_api_key" }
    });

    const apiKey = setting?.value as string;
    
    if (!apiKey) {
      return NextResponse.json({ error: "Falta configurar la Clave de API de Gemini en la pestaña de Configuración" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    let geminiPrompt: string;
    if (type === "seo") {
      geminiPrompt = `Eres un experto en SEO. Escribe una meta descripción atractiva y concisa para un producto digital.
REGLAS ESTRICTAS:
- Máximo 160 caracteres en total.
- No uses comillas, asteriscos ni Markdown.
- Escribe directamente el texto, sin introducciones.
- El producto es: "${prompt}"`;
    } else if (type === "blog") {
      geminiPrompt = `Eres un redactor profesional de blogs sobre WordPress, desarrollo web, plugins, themes y tecnología. 
Escribe un artículo completo y optimizado para SEO sobre el siguiente tema: "${prompt}".

REGLAS ESTRICTAS de formato:
- Usa exactamente este formato Markdown limpio.
- El título principal debe ser un H1 (# Título) corto (máximo 60 caracteres).
- Usa H2 (## Sección) para las secciones principales.
- Usa H3 (### Subsección) para subsecciones dentro de cada H2.
- Usa **negritas** para palabras clave y conceptos importantes.
- Usa listas con guiones (- item) para enumerar características o pasos.
- NO uses H4, H5, ni H6. Máximo hasta H3.
- Incluye entre 4 y 6 secciones con H2.
- Cada párrafo debe tener 2-4 oraciones. No párrafos muy largos.
- Incluye una introducción atractiva con palabras clave al inicio.
- Incluye una conclusión o resumen final.
- Añade un call-to-action al final como "## ¿Listo para empezar?" o similar.
- Longitud total: entre 800 y 1500 palabras.
- Optimiza naturalmente para SEO usando la palabra clave principal en el primer párrafo, en al menos 2 H2, y en la conclusión.
- Usa un tono profesional pero cercano, enfocado en ayudar al lector.`;
    } else {
      geminiPrompt = `Eres un copywriter experto en ventas de productos digitales. 
Escribe una descripción atractiva, profesional y detallada (formateada en texto plano sin markdown pesado) 
para un producto digital llamado: "${prompt}". 
La descripción debe tener unos 3 párrafos y estar orientada a convertir ventas, resaltando beneficios y calidad.`;
    }

    const result = await model.generateContent(geminiPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("No se pudo obtener texto de Gemini");
    }

    return NextResponse.json({ success: true, text });

  } catch (error: any) {
    console.error("AI Generation error:", error);
    return NextResponse.json({ error: error.message || "Error al generar texto" }, { status: 500 });
  }
}
