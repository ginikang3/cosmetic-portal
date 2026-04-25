"use client";

import React, { useState } from "react";
import { Sparkles, Heart, Copy, RefreshCw, ShoppingCart, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase"; 

// 질문 데이터: 총 6개로 확장
const SKIN_QUESTIONS = [
  { 
    id: 'type', 
    question: "¿Cómo 가을 sientes tu piel al despertar?", 
    optionA: "Seca y opaca", 
    optionB: "Grasa y con brillo", 
    concernA: "보습", 
    concernB: "모공" 
  },
  { 
    id: 'acne', 
    question: "¿Te salen granitos con frecuencia?", 
    optionA: "Sí, a menudo", 
    optionB: "Rara vez", 
    concernA: "여드름", 
    concernB: null 
  },
  { 
    id: 'tone', 
    question: "¿Quieres mejorar el tono de tu piel?", 
    optionA: "Sí, quiero más brillo", 
    optionB: "No, me preocupa la firmeza", 
    concernA: "미백", 
    concernB: "탄력" 
  },
  { 
    id: 'sensitivity', 
    question: "¿Tu piel se irrita fácilmente?", 
    optionA: "Sí, es muy sensible", 
    optionB: "No, es resistente", 
    concernA: "진정", 
    concernB: "장벽" 
  },
  { 
    id: 'sun', 
    question: "¿Sueles tener manchas por el sol?", 
    optionA: "Sí, tengo algunas", 
    optionB: "No, pero quiero prevenirlas", 
    concernA: "기미", 
    concernB: "미백" 
  },
  { 
    id: 'final', 
    question: "¿Qué buscas en tu rutina ideal?", 
    optionA: "Efecto antiedad", 
    optionB: "Hidratación profunda", 
    concernA: "탄력", 
    concernB: "보습" 
  }
];

export default function Home() {
  const [step, setStep] = useState(0); 
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAnswer = async (concern: string | null) => {
    const nextConcerns = concern ? [...selectedConcerns, concern] : selectedConcerns;
    
    if (step < SKIN_QUESTIONS.length) {
      setSelectedConcerns(nextConcerns);
      setStep(step + 1);
    } else {
      setLoading(true);
      setStep(999);
      
      const targetConcern = nextConcerns[nextConcerns.length - 1];
      
      const { data } = await supabase
        .from('skincare_portal')
        .select('*')
        .contains('concern', [targetConcern])
        .limit(6);
      
      setProducts(data || []);
      setLoading(false);
    }
  };

  // --- 1. 시작 화면 (핑크 무드) ---
  if (step === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fff5f7] p-8 text-center">
        <Heart className="text-[#ff85a2] mb-6 w-12 h-12 fill-[#ff85a2] animate-bounce" />
        <h1 className="text-6xl font-black text-[#ff4d7d] italic leading-none tracking-tighter mb-6">
          K-BEAUTY<br/><span className="text-[#ff85a2]">GLOW UP</span>
        </h1>
        <p className="text-[#ff85a2] mb-12 text-lg font-bold">Encuentra tu rutina ideal en 6 pasos.</p>
        <button 
          onClick={() => setStep(1)}
          className="w-full max-w-xs bg-[#ff4d7d] text-white py-6 rounded-[2.5rem] font-black text-2xl shadow-[0_15px_35px_rgba(255,77,125,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          START QUIZ <ChevronRight size={28} />
        </button>
      </div>
    );
  }

  // --- 2. 결과 화면 (핑크 포인트) ---
  if (step === 999) {
    return (
      <div className="min-h-screen bg-white pt-16 pb-20">
        <div className="px-8 mb-8 text-center">
          <h2 className="text-4xl font-black text-[#ff4d7d] uppercase italic">Tu Glow Routine</h2>
          
          <div className="mt-8 bg-[#fff0f3] border-2 border-dashed border-[#ffb3c1] p-6 rounded-[2rem]">
            <p className="text-[#ff4d7d] text-sm font-bold mb-1 italic">¡Cupón Especial!</p>
            <h3 className="text-[#ff4d7d] text-4xl font-black mb-2 tracking-tighter">5% OFF</h3>
            <div className="bg-white py-2 px-6 rounded-xl inline-block shadow-sm">
              <span className="text-[#ff85a2] font-black tracking-widest uppercase">NURIGLOW5</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-80">
            <RefreshCw className="text-[#ff85a2] animate-spin w-12 h-12 mb-4" />
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-6 px-8 pb-14 snap-x snap-mandatory scrollbar-hide">
            {products.map((p) => (
              <div key={p.id} className="flex-none w-[85vw] md:w-[400px] bg-white rounded-[3rem] overflow-hidden border border-[#ffe3e8] snap-center flex flex-col shadow-xl">
                <div className="relative w-full h-[300px] bg-white flex items-center justify-center p-8 border-b border-[#fff0f3]">
                  <img src={p.image_url} alt={p.product_name} className="w-full h-full object-contain" />
                </div>
                <div className="p-10 flex flex-col flex-grow">
                  <span className="text-[#ff85a2] text-[10px] font-black uppercase tracking-widest mb-2">{p.brand}</span>
                  <h3 className="text-xl font-black text-gray-800 mb-4 leading-tight">{p.product_name}</h3>
                  <div className="bg-[#fffafa] p-5 rounded-2xl border border-[#fff0f5] mb-8">
                    <p className="text-gray-600 text-sm italic font-medium leading-relaxed">"{p.description_es}"</p>
                  </div>
                  <a 
                    href={p.affiliate_link} 
                    target="_blank" 
                    className="mt-auto block w-full bg-[#ff4d7d] text-white text-center py-5 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} /> COMPRAR
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- 3. 질문 화면 ---
  const currentQ = SKIN_QUESTIONS[step - 1];
  return (
    <div className="min-h-screen bg-[#fffafa] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="mb-16">
          <div className="flex justify-between items-end mb-3 font-black italic">
            <span className="text-[#ff4d7d] text-3xl">0{step}</span>
            <span className="text-[#ffb3c1] text-xs tracking-widest">/ 06</span>
          </div>
          <div className="w-full h-2 bg-[#ffe3e8] rounded-full overflow-hidden">
            <div className="h-full bg-[#ff4d7d] transition-all duration-500" style={{ width: `${(step / 6) * 100}%` }} />
          </div>
        </div>

        <h2 className="text-2xl font-black text-gray-800 text-center mb-16 leading-tight italic">
          {currentQ.question}
        </h2>

        <div className="flex flex-col gap-5">
          <button onClick={() => handleAnswer(currentQ.concernA)} className="w-full bg-white border-2 border-[#ffe3e8] hover:border-[#ff4d7d] text-gray-700 p-8 rounded-[2.5rem] font-bold text-lg transition-all active:scale-95 text-left flex justify-between items-center group shadow-sm">
            {currentQ.optionA} <ChevronRight className="text-[#ffb3c1] group-hover:text-[#ff4d7d]" />
          </button>
          <button onClick={() => handleAnswer(currentQ.concernB)} className="w-full bg-white border-2 border-[#ffe3e8] hover:border-[#ff4d7d] text-gray-700 p-8 rounded-[2.5rem] font-bold text-lg transition-all active:scale-95 text-left flex justify-between items-center group shadow-sm">
            {currentQ.optionB} <ChevronRight className="text-[#ffb3c1] group-hover:text-[#ff4d7d]" />
          </button>
        </div>
      </div>
    </div>
  );
}