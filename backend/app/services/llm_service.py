import os
import json
import logging
import httpx
from typing import List, Dict, Optional, Tuple

from app.config import settings

logger = logging.getLogger("llm_service")

SYSTEM_PROMPT = """You are NyaySahayak (न्याय सहायक), an intelligent AI Virtual Assistant developed for the Department of Justice, Ministry of Law & Justice, Government of India.
Your mission is to provide accurate, citizen-friendly, and authoritative legal and judicial information to Indian citizens, legal professionals, and students.

Guidelines:
1. Base your answer strictly on the provided official Department of Justice context and verified schemes (Tele-Law, Nyaya Bandhu, eCourts, NALSA, Fast Track Special Courts, Gram Nyayalayas, DISHA).
2. Answer in the user's requested language ({language}: English, Hindi, or Punjabi).
3. Be respectful, professional, and clear. Avoid convoluted legal jargon unless explaining it simply.
4. If the user asks for legal advice on a private court case or ongoing personal litigation, provide general procedure guidance and direct them to Tele-Law, DLSA/NALSA free legal aid helpline 15100, or a qualified advocate.
5. Always distinguish verified facts from general procedural awareness.
6. Provide official links and next steps when relevant.
"""

DISCLAIMER_TEXTS = {
    "en": "This AI assistant provides general information for public awareness and guidance. It does not replace professional legal advice or official communication from the Department of Justice.",
    "hi": "यह एआई सहायक केवल जन-जागरूकता और मार्गदर्शन के लिए सामान्य जानकारी प्रदान करता है। यह पेशेवर कानूनी सलाह या न्याय विभाग के आधिकारिक संचार का स्थान नहीं लेता है।",
    "pa": "ਇਹ ਏਆਈ ਸਹਾਇਕ ਆਮ ਜਨ-ਜਾਗਰੂਕਤਾ ਅਤੇ ਮਾਰਗਦਰਸ਼ਨ ਲਈ ਆਮ ਜਾਣਕਾਰੀ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ। ਇਹ ਕਿਸੇ ਪੇਸ਼ੇਵਰ ਕਾਨੂੰਨੀ ਸਲਾਹ ਜਾਂ ਨਿਆਂ ਵਿਭਾਗ ਦੇ ਅਧਿਕਾਰਤ ਸੰਚਾਰ ਦਾ ਬਦਲ ਨਹੀਂ ਹੈ।"
}

FOLLOWUP_SUGGESTIONS = {
    "en": [
        "How can I check my case status on eCourts using CNR number?",
        "Who is eligible for free legal aid under NALSA Section 12?",
        "How do I consult a lawyer through the Tele-Law Mobile App?",
        "What is the difference between Lok Adalat and regular court?"
    ],
    "hi": [
        "सीएनआर (CNR) नंबर से ई-कोर्ट पर केस स्टेटस कैसे देखें?",
        "नालसा (NALSA) धारा 12 के तहत मुफ्त कानूनी सहायता के लिए कौन पात्र है?",
        "टेली-लॉ मोबाइल ऐप के माध्यम से वकील से परामर्श कैसे लें?",
        "लोक अदालत और नियमित अदालत में क्या अंतर है?"
    ],
    "pa": [
        "CNR ਨੰਬਰ ਨਾਲ ਈ-ਕੋਰਟ 'ਤੇ ਕੇਸ ਦੀ ਸਥਿਤੀ ਕਿਵੇਂ ਦੇਖੀਏ?",
        "ਨਾਲਸਾ ਧਾਰਾ 12 ਅਧੀਨ ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਲਈ ਕੌਣ ਯੋਗ ਹੈ?",
        "ਟੈਲੀ-ਲਾਅ ਮੋਬਾਈਲ ਐਪ ਰਾਹੀਂ ਵਕੀਲ ਨਾਲ ਸਲਾਹ ਕਿਵੇਂ ਕਰੀਏ?",
        "ਲੋਕ ਅਦਾਲਤ ਅਤੇ ਰੈਗੂਲਰ ਅਦਾਲਤ ਵਿਚਕਾਰ ਕੀ ਅੰਤਰ ਹੈ?"
    ]
}

class LLMService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.upper()
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        
    def _determine_active_provider(self) -> str:
        if self.provider == "GEMINI" and self.gemini_key:
            return "GEMINI"
        elif self.provider == "OPENAI" and self.openai_key:
            return "OPENAI"
        elif self.provider == "AUTO":
            if self.gemini_key:
                return "GEMINI"
            elif self.openai_key:
                return "OPENAI"
        return "OFFLINE_RAG"

    async def generate_response(
        self,
        query: str,
        retrieved_chunks: List[Dict],
        conversation_history: List[Dict],
        intent: str,
        language: str = "en"
    ) -> Tuple[str, str, bool, List[str]]:
        """
        Returns:
            (answer_text, active_provider_name, is_mock_or_offline, suggested_followups)
        """
        active_provider = self._determine_active_provider()
        context_text = "\n\n---\n\n".join([
            f"Title: {c.get('title')}\nCategory: {c.get('category')}\nSource: {c.get('source_url')}\nContent: {c.get('content')}"
            for c in retrieved_chunks
        ])
        
        system_instruction = SYSTEM_PROMPT.format(language=language)
        
        if active_provider == "GEMINI":
            try:
                res = await self._call_gemini(query, context_text, conversation_history, system_instruction, language)
                followups = self._generate_followups(intent, language)
                return res, "Google Gemini AI", False, followups
            except Exception as e:
                logger.error(f"Gemini API call failed: {str(e)}. Falling back to Built-in Engine.")
                active_provider = "OFFLINE_RAG"

        if active_provider == "OPENAI":
            try:
                res = await self._call_openai(query, context_text, conversation_history, system_instruction, language)
                followups = self._generate_followups(intent, language)
                return res, "OpenAI GPT", False, followups
            except Exception as e:
                logger.error(f"OpenAI API call failed: {str(e)}. Falling back to Built-in Engine.")
                active_provider = "OFFLINE_RAG"

        # Offline / Zero-Cloud Built-in RAG Synthesis Engine
        res = self._offline_rag_synthesis(query, retrieved_chunks, intent, language)
        followups = self._generate_followups(intent, language)
        return res, "NyaySahayak Built-in RAG Engine (Zero-Cloud Mode)", True, followups

    async def _call_gemini(self, query: str, context: str, history: List[Dict], system_prompt: str, language: str) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={self.gemini_key}"
        
        prompt = f"""Official Context from Department of Justice:
{context}

User Query: {query}
Language requested: {language}

Provide a helpful, precise, citizen-centric response based on the official context above."""

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system_prompt}\n\n{prompt}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 1024
            }
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            candidates = data.get("candidates", [])
            if candidates and "content" in candidates[0]:
                parts = candidates[0]["content"].get("parts", [])
                if parts:
                    return parts[0].get("text", "")
            raise ValueError("No text generated by Gemini")

    async def _call_openai(self, query: str, context: str, history: List[Dict], system_prompt: str, language: str) -> str:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_key}",
            "Content-Type": "application/json"
        }
        messages = [{"role": "system", "content": system_prompt}]
        for msg in history[-4:]:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
            
        user_prompt = f"Official DoJ Knowledge Base:\n{context}\n\nUser Question ({language}): {query}"
        messages.append({"role": "user", "content": user_prompt})
        
        payload = {
            "model": settings.OPENAI_MODEL,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 1000
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    def _offline_rag_synthesis(self, query: str, chunks: List[Dict], intent: str, language: str) -> str:
        """
        Intelligent offline domain RAG synthesizer.
        Extracts key factual points, bullet points, and provides authoritative guidance in English, Hindi, or Punjabi.
        """
        if not chunks:
            if language == "hi":
                return "क्षमा करें, मुझे न्याय विभाग के ज्ञानकोष में इस विशिष्ट प्रश्न के संबंध में कोई सत्यापित आधिकारिक रिकॉर्ड नहीं मिला। कृपया आधिकारिक पोर्टल doj.gov.in पर देखें अथवा राष्ट्रीय कानूनी सहायता हेल्पलाइन 15100 पर संपर्क करें।"
            elif language == "pa":
                return "ਮਾਫ਼ ਕਰਨਾ, ਮੈਨੂੰ ਨਿਆਂ ਵਿਭਾਗ ਦੇ ਡਾਟਾਬੇਸ ਵਿੱਚ ਇਸ ਵਿਸ਼ੇਸ਼ ਸਵਾਲ ਬਾਰੇ ਕੋਈ ਪ੍ਰਮਾਣਿਤ ਅਧਿਕਾਰਤ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਅਧਿਕਾਰਤ ਵੈੱਬਸਾਈਟ doj.gov.in 'ਤੇ ਜਾਓ ਜਾਂ ਰਾਸ਼ਟਰੀ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਹੈਲਪਲਾਈਨ 15100 'ਤੇ ਸੰਪਰਕ ਕਰੋ।"
            return "I apologize, but I could not find verified official records in the Department of Justice knowledge base regarding this specific inquiry. Please refer to the official portal at https://doj.gov.in or call the 24x7 National Legal Aid Helpline at 15100 for further guidance."

        top_chunk = chunks[0]
        title = top_chunk.get("title", "Department of Justice Scheme")
        content = top_chunk.get("content", "")
        source_url = top_chunk.get("source_url", "https://doj.gov.in/")

        # Synthesize based on target language
        if language == "hi":
            intro = f"न्याय विभाग के आधिकारिक रिकॉर्ड के अनुसार, **{title}** से संबंधित मुख्य जानकारी निम्नलिखित है:\n\n"
            # Extract key paragraphs or format points
            body = content.replace("Tele-Law", "टेली-लॉ (Tele-Law)").replace("eCourts", "ई-कोर्ट (eCourts)").replace("NALSA", "नालसा (NALSA)")
            outro = f"\n\n**विस्तृत आधिकारिक जानकारी के लिए:**\nआप आधिकारिक सरकारी पोर्टल [{source_url}]({source_url}) पर जा सकते हैं।"
            return intro + body + outro
            
        elif language == "pa":
            intro = f"ਨਿਆਂ ਵਿਭਾਗ ਦੇ ਅਧਿਕਾਰਤ ਰਿਕਾਰਡਾਂ ਅਨੁਸਾਰ, **{title}** ਬਾਰੇ ਮੁੱਖ ਜਾਣਕਾਰੀ ਹੇਠਾਂ ਦਿੱਤੀ ਗਈ ਹੈ:\n\n"
            body = content.replace("Tele-Law", "ਟੈਲੀ-ਲਾਅ (Tele-Law)").replace("eCourts", "ਈ-ਕੋਰਟਸ (eCourts)").replace("NALSA", "ਨਾਲਸਾ (NALSA)")
            outro = f"\n\n**ਵਧੇਰੇ ਅਧਿਕਾਰਤ ਜਾਣਕਾਰੀ ਲਈ:**\nਤੁਸੀਂ ਅਧਿਕਾਰਤ ਸਰਕਾਰੀ ਪੋਰਟਲ [{source_url}]({source_url}) 'ਤੇ ਜਾ ਸਕਦੇ ਹੋ।"
            return intro + body + outro

        else:
            intro = f"Based on verified records from the **Department of Justice (Ministry of Law & Justice, Govt. of India)** regarding **{title}**:\n\n"
            outro = f"\n\n**Official Portal & Verified Links:**\n• Department of Justice: [{source_url}]({source_url})\n• National Legal Aid Helpline: **15100** (Toll-free 24x7)"
            return intro + content + outro

    def _generate_followups(self, intent: str, language: str) -> List[str]:
        default_followups = FOLLOWUP_SUGGESTIONS.get(language, FOLLOWUP_SUGGESTIONS["en"])
        
        if intent == "Tele-Law & Citizen Advice":
            if language == "hi":
                return [
                    "टेली-लॉ के तहत कौन मुफ्त सलाह ले सकता है?",
                    "क्या मुझे टेली-लॉ परामर्श के लिए कॉमन सर्विस सेंटर (CSC) जाना होगा?",
                    "टेली-लॉ मोबाइल ऐप कैसे डाउनलोड करें?"
                ]
            elif language == "pa":
                return [
                    "ਟੈਲੀ-ਲਾਅ ਅਧੀਨ ਕੌਣ ਮੁਫ਼ਤ ਸਲਾਹ ਪ੍ਰਾਪਤ ਕਰ ਸਕਦਾ ਹੈ?",
                    "ਕੀ ਮੈਨੂੰ CSC ਸੈਂਟਰ ਜਾਣਾ ਪਵੇਗਾ?",
                    "ਟੈਲੀ-ਲਾਅ ਮੋਬਾਈਲ ਐਪ ਕਿਵੇਂ ਡਾਊਨਲੋਡ ਕਰੀਏ?"
                ]
            return [
                "Who is eligible for free advice under Tele-Law?",
                "Do I need to visit a Common Service Centre (CSC)?",
                "How to download and use the Tele-Law Mobile App?"
            ]
            
        elif intent == "Judicial Services & Case Tracking":
            if language == "hi":
                return [
                    "16 अंकों का सीएनआर (CNR) नंबर कैसे खोजें?",
                    "वर्चुअल कोर्ट (Virtual Court) में ट्रैफिक चालान कैसे भरें?",
                    "राष्ट्रीय न्यायिक डेटा ग्रिड (NJDG) क्या है?"
                ]
            elif language == "pa":
                return [
                    "16 ਅੰਕਾਂ ਦਾ CNR ਨੰਬਰ ਕਿਵੇਂ ਲੱਭਿਆ ਜਾਵੇ?",
                    "ਵਰਚੁਅਲ ਕੋਰਟ ਵਿੱਚ ਟ੍ਰੈਫਿਕ ਚਲਾਨ ਕਿਵੇਂ ਭਰੀਏ?",
                    "ਰਾਸ਼ਟਰੀ ਨਿਆਂਇਕ ਡਾਟਾ ਗਰਿੱਡ (NJDG) ਕੀ ਹੈ?"
                ]
            return [
                "Where can I find my 16-digit CNR Number?",
                "How to settle a traffic challan through Virtual Courts?",
                "What information is available on the National Judicial Data Grid (NJDG)?"
            ]

        elif intent == "Free Legal Aid & Lok Adalat":
            if language == "hi":
                return [
                    "नालसा (NALSA) धारा 12 के तहत क्या आय सीमा है?",
                    "लोक अदालत के फैसले के खिलाफ अपील क्यों नहीं हो सकती?",
                    "मुफ्त वकील पाने के लिए आवेदन कैसे करें?"
                ]
            elif language == "pa":
                return [
                    "ਨਾਲਸਾ ਧਾਰਾ 12 ਤਹਿਤ ਆਮਦਨ ਸੀਮਾ ਕੀ ਹੈ?",
                    "ਲੋਕ ਅਦਾਲਤ ਦੇ ਫੈਸਲੇ ਵਿਰੁੱਧ ਅਪੀਲ ਕਿਉਂ ਨਹੀਂ ਹੋ ਸਕਦੀ?",
                    "ਮੁਫ਼ਤ ਵਕੀਲ ਲੈਣ ਲਈ ਅਰਜ਼ੀ ਕਿਵੇਂ ਦੇਣੀ ਹੈ?"
                ]
            return [
                "What is the income ceiling under Section 12 of LSA Act?",
                "Why is a Lok Adalat settlement non-appealable?",
                "How to apply for an empanelled legal aid advocate?"
            ]

        return default_followups

llm_service = LLMService()
