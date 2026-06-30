/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { saveSettingsAction } from "@/app/[locale]/(admin)/admin/settings/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

export function FaqForm({ initialData }: { initialData: Record<string, any> }) {
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>(initialData.faqs || []);

  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateFaq = (index: number, field: keyof FAQ, value: string) => {
    const newFaqs = [...faqs];
    if (newFaqs[index]) {
      newFaqs[index][field] = value;
      setFaqs(newFaqs);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      faqs: faqs.filter(f => f.question.trim() !== ""),
    };

    const res = await saveSettingsAction("faq", data);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("FAQs guardadas correctamente");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Preguntas Frecuentes (FAQ)</CardTitle>
            <CardDescription>Administra las preguntas frecuentes del sitio.</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addFaq}>
            <Plus className="size-4 mr-1" /> Agregar Pregunta
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {faqs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
              No hay preguntas configuradas. Haz clic en "Agregar Pregunta".
            </div>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="flex gap-4 items-start p-4 border rounded-lg bg-muted/20">
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <Label>Pregunta</Label>
                      <Input 
                        value={faq.question} 
                        onChange={(e) => updateFaq(index, "question", e.target.value)} 
                        placeholder="Ej. ¿Ofrecen reembolsos?"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Respuesta</Label>
                      <Textarea 
                        value={faq.answer} 
                        onChange={(e) => updateFaq(index, "answer", e.target.value)} 
                        placeholder="Escribe la respuesta aquí..."
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-6"
                    onClick={() => removeFaq(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="brand" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
