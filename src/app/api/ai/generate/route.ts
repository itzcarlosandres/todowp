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
