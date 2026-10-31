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
2. Answer in the user's requested language ({language}: English, Hindi, Punjabi, or Bhojpuri).
3. If Bhojpuri is requested: Generate complete, authentic, and natural conversational Bhojpuri in Devanagari script (e.g., बा, बाटे, बानी, रउवा, ई, कइल जाई, मिली, आदि). Do not translate word-by-word from Hindi. Translate all headings, explanations, bullet points, and follow-up suggestions into authentic Bhojpuri while keeping official abbreviations, Act names, helpline numbers, and URLs intact with explanations in Bhojpuri.
4. Be respectful, professional, and clear. Avoid convoluted legal jargon unless explaining it simply.
5. If the user asks for legal advice on a private court case or ongoing personal litigation, provide general procedure guidance and direct them to Tele-Law, DLSA/NALSA free legal aid helpline 15100, or a qualified advocate.
6. Always distinguish verified facts from general procedural awareness.
7. Provide official links and next steps when relevant.
"""

DISCLAIMER_TEXTS = {
    "en": "This AI assistant provides general information for public awareness and guidance. It does not replace professional legal advice or official communication from the Department of Justice.",
    "hi": "यह एआई सहायक केवल जन-जागरूकता और मार्गदर्शन के लिए सामान्य जानकारी प्रदान करता है। यह पेशेवर कानूनी सलाह या न्याय विभाग के आधिकारिक संचार का स्थान नहीं लेता है।",
    "pa": "ਇਹ ਏਆਈ ਸਹਾਇਕ ਆਮ ਜਨ-ਜਾਗਰੂਕਤਾ ਅਤੇ ਮਾਰਗਦਰਸ਼ਨ ਲਈ ਆਮ ਜਾਣਕਾਰੀ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ। ਇਹ ਕਿਸੇ ਪੇਸ਼ੇਵਰ ਕਾਨੂੰਨੀ ਸਲਾਹ ਜਾਂ ਨਿਆਂ ਵਿਭਾਗ ਦੇ ਅਧਿਕਾਰਤ ਸੰਚਾਰ ਦਾ ਬਦਲ ਨਹੀਂ ਹੈ।",
    "bho": "ई एआई सहायक खाली जन-जागरूकता आ जानकारी खातिर बनावल गइल बा। ई कवनो वकील के निजी कानूनी सलाह भा न्याय विभाग के आधिकारिक चिट्ठी-पत्री के विकल्प ना हटे।"
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
    ],
    "bho": [
        "16 अंक के सीएनआर (CNR) नंबर से केस के स्टेटस कइसे देखल जाई?",
        "नालसा (NALSA) धारा 12 में केकरा के मुफ्त कानूनी सहायता मिलेला?",
        "टेली-लॉ मोबाइल ऐप से वकील से सलाह कइसे लिहल जाव?",
        "लोक अदालत आ नियमित कचहरी में का अंतर बा?"
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
        Extracts key factual points, bullet points, and provides authoritative guidance in English, Hindi, Punjabi, or Bhojpuri.
        """
        if not chunks:
            if language == "hi":
                return "क्षमा करें, मुझे न्याय विभाग के ज्ञानकोष में इस विशिष्ट प्रश्न के संबंध में कोई सत्यापित आधिकारिक रिकॉर्ड नहीं मिला। कृपया आधिकारिक पोर्टल doj.gov.in पर देखें अथवा राष्ट्रीय कानूनी सहायता हेल्पलाइन 15100 पर संपर्क करें।"
            elif language == "pa":
                return "ਮਾਫ਼ ਕਰਨਾ, ਮੈਨੂੰ ਨਿਆਂ ਵਿਭਾਗ ਦੇ ਡਾਟਾਬੇਸ ਵਿੱਚ ਇਸ ਵਿਸ਼ੇਸ਼ ਸਵਾਲ ਬਾਰੇ ਕੋਈ ਪ੍ਰਮਾਣਿਤ ਅਧਿਕਾਰਤ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਅਧਿਕਾਰਤ ਵੈੱਬਸਾਈਟ doj.gov.in 'ਤੇ ਜਾਓ ਜਾਂ ਰਾਸ਼ਟਰੀ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਹੈਲਪਲਾਈਨ 15100 'ਤੇ ਸੰਪਰਕ ਕਰੋ।"
            elif language == "bho":
                return "माफ करीं, न्याय विभाग के रिकार्ड में एह सवाल खातिर कवनो पक्का आधिकारिक जानकारी नइखे मिलल। रउवा भारत सरकार के आधिकारिक वेबसाइट doj.gov.in पर देख सकत बानी भा राष्ट्रीय कानूनी सहायता हेल्पलाइन 15100 पर फोन क के पता लगा सकत बानी।"
            return "I apologize, but I could not find verified official records in the Department of Justice knowledge base regarding this specific inquiry. Please refer to the official portal at https://doj.gov.in or call the 24x7 National Legal Aid Helpline at 15100 for further guidance."

        top_chunk = chunks[0]
        title = top_chunk.get("title", "Department of Justice Scheme")
        content = top_chunk.get("content", "")
        source_url = top_chunk.get("source_url", "https://doj.gov.in/")

        # Synthesize based on target language
        if language == "hi":
            intro = f"न्याय विभाग के आधिकारिक रिकॉर्ड के अनुसार, **{title}** से संबंधित मुख्य जानकारी निम्नलिखित है:\n\n"
            body = content.replace("Tele-Law", "टेली-लॉ (Tele-Law)").replace("eCourts", "ई-कोर्ट (eCourts)").replace("NALSA", "नालसा (NALSA)")
            outro = f"\n\n**विस्तृत आधिकारिक जानकारी के लिए:**\nआप आधिकारिक सरकारी पोर्टल [{source_url}]({source_url}) पर जा सकते हैं।"
            return intro + body + outro
            
        elif language == "pa":
            intro = f"ਨਿਆਂ ਵਿਭਾਗ ਦੇ ਅਧਿਕਾਰਤ ਰਿਕਾਰਡਾਂ ਅਨੁਸਾਰ, **{title}** ਬਾਰੇ ਮੁੱਖ ਜਾਣਕਾਰੀ ਹੇਠਾਂ ਦਿੱਤੀ ਗਈ ਹੈ:\n\n"
            body = content.replace("Tele-Law", "ਟੈਲੀ-ਲਾਅ (Tele-Law)").replace("eCourts", "ਈ-ਕੋਰਟਸ (eCourts)").replace("NALSA", "ਨਾਲਸਾ (NALSA)")
            outro = f"\n\n**ਵਧੇਰੇ ਅਧਿਕਾਰਤ ਜਾਣਕਾਰੀ ਲਈ:**\nਤੁਸੀਂ ਅਧਿਕਾਰਤ ਸਰਕਾਰੀ ਪੋਰਟਲ [{source_url}]({source_url}) 'ਤੇ ਜਾ ਸਕਦੇ ਹੋ।"
            return intro + body + outro

        elif language == "bho":
            intro = f"न्याय विभाग (भारत सरकार) के आधिकारिक रिकार्ड के मोताबिक, **{title}** के बारे में जरूरी जानकारी नीचे दिहल बा:\n\n"
            body = self._synthesize_bhojpuri_content(title, content)
            outro = f"\n\n**विस्तृत आधिकारिक जानकारी आ जरूरी लिंक:**\n• न्याय विभाग पोर्टल: [{source_url}]({source_url})\n• 24x7 राष्ट्रीय कानूनी सहायता हेल्पलाइन: **15100** (टोल-फ्री फोन नंबर)"
            return intro + body + outro

        else:
            intro = f"Based on verified records from the **Department of Justice (Ministry of Law & Justice, Govt. of India)** regarding **{title}**:\n\n"
            outro = f"\n\n**Official Portal & Verified Links:**\n• Department of Justice: [{source_url}]({source_url})\n• National Legal Aid Helpline: **15100** (Toll-free 24x7)"
            return intro + content + outro

    def _synthesize_bhojpuri_content(self, title: str, content: str) -> str:
        """
        Synthesizes authentic, natural Bhojpuri domain explanations without mechanical word-by-word translation.
        """
        t_lower = title.lower()
        if "tele-law" in t_lower or "tele law" in t_lower:
            return (
                "टेली-लॉ (Tele-Law) भारत सरकार के न्याय विभाग आ सीएससी (CSC e-Governance) के एगो बहुते खास आ असरदार योजना हवे। एकर मुख्य मकसद गांव-देहात आ गरीब बस्ती के लोगन के तकनीक के सहारा से घर बइठले वकील से जोड़ल बा।\n\n"
                "**मुख्य तरीका आ सुविधा:**\n"
                "1. **कॉमन सर्विस सेंटर (CSC):** नागरिक आपन नजदीकी सीएससी (प्रज्ञा केंद्र) पर जा के वीएलई (VLE) भा पैरा-लीगल वालंटियर के मदद से आपन नाम लिखवा सकत बाड़न।\n"
                "2. **टेली-लॉ मोबाइल ऐप:** रउवा आपन स्मार्टफोन में 'Tele-Law App' डाउनलोड क के 22 गो भारतीय भाषा में पैनल वकील से वीडियो कॉल भा फोन से सीधा सलाह ले सकत बानी।\n"
                "3. **पैनल वकील:** राज्य विधिक सेवा प्राधिकरण (SLSA) के अनुभवी वकील लोग फोन भा वीडियो से झगड़ा सुलझावे आ सही कानूनी रास्ता देखावे में मदद करेला।\n"
                "4. **नालसा (NALSA) से जुड़ाव:** अगर मामला कोर्ट-कचहरी में लड़े लायक बा, त जिला विधिक सेवा प्राधिकरण (DLSA) में भेज के बिल्कुल मुफ्त वकील दिआवल जाला।\n\n"
                "**मुफ्त सलाह केकरा-केकरा के मिली (धारा 12):**\n"
                "विधिक सेवा प्राधिकरण अधिनियम 1987 के धारा 12 के तहत ई लोगन के सलाह एकदम मुफ्त बा:\n"
                "• मेहरारू आ लईका-लईकी सभ\n"
                "• अनुसूचित जाति (SC) आ अनुसूचित जनजाति (ST) के सदस्य\n"
                "• दिव्यांग (विकलांग) भाई-बहिन\n"
                "• बंधुआ मजदूरी भा तस्करी के शिकार लोग\n"
                "• बाढ़, भूकंप भा जातीय हिंसा से पीड़ित लोग\n"
                "• करखाना के मजदूर आ जेल में बंद लोग\n"
                "• सालाना कम आमदनी वाला गरीब परिवार (ज्यादातर राज्य में ₹3 लाख तक)।\n\n"
                "बाकि लोग खाली ₹30 के मामूली फीस दे के कानूनी सलाह पा सकत बाड़े। देस भर के 36 गो राज्य आ केंद्र शासित प्रदेशन में 2.5 लाख से ढेर ग्राम पंचायतन में अब तक 65 लाख से जादा लोग एकर लाभ ले चुकल बा।"
            )

        elif "ecourt" in t_lower or "case" in t_lower:
            return (
                "ई-कोर्ट (eCourts) परियोजना भारत सरकार के न्याय विभाग आ सुप्रीम कोर्ट के ई-कमेटी के एगो बहुते बड़हन साझा डिजिटल मिशन हवे। एकर मकसद अदालतन के डिजिटल बना के नागरिकन के जल्द से जल्द इंसाफ दिआवल हवे।\n\n"
                "**नागरिकन खातिर मुख्य ऑनलाइन सेवा:**\n"
                "1. **16 अंक के सीएनआर (CNR) नंबर से केस खोजल:** हर केस के एगो खास 16 अंक के सीएनआर (Case Number Record) नंबर मिलेला। एकरा के ecourts.gov.in वेबसाइट भा eCourts Services मोबाइल ऐप में डाल के केस के पूरा ब्योरा, अगिला सुनवाई के तारीख आ कोर्ट के फैसला देख सकत बानी।\n"
                "2. **वर्चुअल कोर्ट (Virtual Court):** ट्रैफिक चालान भा छोट-मोट अपराध खातिर कोर्ट में हाजिर होखे के कवनो जरूरत नइखे। vcourts.gov.in पर जा के घर बइठले ऑनलाइन जुर्माना भरल जा सकेला।\n"
                "3. **राष्ट्रीय न्यायिक डेटा ग्रिड (NJDG):** सुप्रीम कोर्ट, हाई कोर्ट आ 18,000 से जादा निचली अदालतन में कतना केस चल रहल बा आ कतना निपटारा भइल, एकर सब हिसाब-किताब जनता खातिर खुला बा।\n"
                "4. **ई-फाइलिंग आ ई-पे:** 24 घंटा ऑनलाइन याचिका दाखिल करे आ कोर्ट के फीस भरे के सुविधा उपलब्ध बा।\n\n"
                "**परियोजना के चरण (Phase III):**\n"
                "सितंबर 2023 में केंद्र सरकार ₹7,210 करोड़ के लागत से फेज-3 मंजूर कइले बा, जवना में कोर्ट के पेपरलेस बनावल, कागजात सभ के डिजिटल करल आ एआई (AI) तकनीक के इस्तेमाल शामिल बा।"
            )

        elif "nalsa" in t_lower or "legal aid" in t_lower:
            return (
                "राष्ट्रीय विधिक सेवा प्राधिकरण (NALSA) के गठन 1987 के कानून के तहत भइल हवे, जवना के मुख्य मकसद गरीब, कमजोर आ लाचार लोगन के अदालत में मुफ्त आ पक्का कानूनी सहायता दिहल हवे।\n\n"
                "**केकरा के मिलेला मुफ्त कानूनी सहायता (धारा 12):**\n"
                "• मेहरारू आ बाल-बच्चा\n"
                "• अनुसूचित जाति (SC) आ अनुसूचित जनजाति (ST) के सदस्य\n"
                "• दिव्यांग जन (विकलांग)\n"
                "• बंधुआ मजदूर आ मानव तस्करी के शिकार लोग\n"
                "• आपदा, दंगा, भूकंप भा बाढ़ से पीड़ित लोग\n"
                "• हिरासत (जेल) में बंद नागरिक\n"
                "• तय सीमा से कम सालाना आमदनी वाला परिवार।\n\n"
                "**मुफ्त में का-का सुविधा मिलेला:**\n"
                "कोर्ट में कवनो फीस ना लगेला, सरकारी खर्चा पर बढ़िया वकील केस लड़ेला, आ अदालती आर्डर के सर्टिफाइड कॉपी मुफ्त दिहल जाला।\n\n"
                "**लोक अदालत (जनता के अदालत):**\n"
                "आपसी समझौता से केस निपटावे खातिर राष्ट्रीय लोक अदालत लगावल जाला। एह में कवनो कोर्ट फीस ना लागे। लोक अदालत के फैसला अंतिम आ मान्य होला, आ एकरा खिलाफ कवनो अपील ना कइल जा सकेला।\n\n"
                "**24x7 राष्ट्रीय कानूनी हेल्पलाइन:** **15100** पर देस भर में कहीं से भी फोन क के मुफ्त राय ले सकत बानी।"
            )

        elif "nyaya bandhu" in t_lower or "pro bono" in t_lower:
            return (
                "न्याय बंधु (Nyaya Bandhu) योजना संविधान के अनुच्छेद 39A के आधार पर न्याय विभाग द्वारा चलावल जा रहल एगो खास पहल हवे। एकर मकसद बा कि कवनो नागरिक गरीबी के कारन इंसाफ पावे से वंचित मत रहे।\n\n"
                "**योजना कइसे काम करेला:**\n"
                "1. **स्वयंसेवी वकील:** देस भर के नामी प्रैक्टिस करे वाला वकील बिना कवनो फीस लिहले (प्रो-बोनो) समाज के गरीब लोगन के केस लड़े खातिर आपन नाम जोड़ेले।\n"
                "2. **मोबाइल ऐप रजिस्ट्रेशन:** 'Nyaya Bandhu App' पर जा के पात्र नागरिक आपन केस के कागज आ धारा 12 के पात्रता दर्ज करेले।\n"
                "3. **वकील से मिलाप:** सिस्टम भाषा आ अदालत के हिसाब से तुरंत वकील से सम्पर्क करा देवेला।\n"
                "4. **लॉ कॉलेज क्लब:** देस के बड़-बड़ लॉ यूनिवर्सिटी में 'प्रो-बोनो क्लब' बनावल गइल बा जे गरीब लोगन के कागजात तइयार करे में मदद करेला।"
            )

        elif "gram" in t_lower or "village" in t_lower:
            return (
                "ग्राम न्यायालय अधिनियम 2008 के तहत गांव-देहात के लोगन खातिर घर के लगे न्याय देवे खातिर ग्राम न्यायालय बनावल गइल बा।\n\n"
                "**मुख्य बात:**\n"
                "• **न्यायाधिकारी:** प्रथम श्रेणी के न्यायिक मजिस्ट्रेट देहात में जा के मोबाइल अदालत लगावेलन, जेह से ग्रामीण लोगन के कचहरी जाए के किराया-भाड़ा आ समय बांचेला।\n"
                "• **सुलह पहिले:** ग्राम न्यायालय पहिले दुनु पक्षन के बइठा के आपसी समझौता करावे के कोसिस करेला।\n"
                "• **मामला:** जमीन के मेड़, पानी, मजदूरी आ छोट-मोट झगड़ा के तुरंत निपटारा कइल जाला।"
            )

        elif "fast track" in t_lower or "ftsc" in t_lower:
            return (
                "फास्ट ट्रैक स्पेशल कोर्ट (FTSC) योजना दुष्कर्म आ पॉक्सो (POCSO) एक्ट के गंभीर मामला में त्वरित न्याय देवे खातिर बनावल गइल बा।\n\n"
                "**मुख्य बिंदु:**\n"
                "• देस भर में 750 से जादा फास्ट ट्रैक कोर्ट काम कर रहल बाड़ी सँ, जेह में 400 से ढेर खाली पॉक्सो खातिर समर्पित बाड़ी।\n"
                "• लईकन आ पीड़ितन के अदालत में आरोपी के सोझा ना पड़े के पड़े, एह खातिर खास सुरक्षित बयान केंद्र (VWDC) बनावल गइल बा।\n"
                "• चार्जशीट दाखिल भइला के एक साल के भीतर केस के फैसला पूरा करे के लक्ष्य राखल गइल बा।"
            )

        elif "disha" in t_lower:
            return (
                "दिशा (DISHA) योजना न्याय विभाग के एगो बड़हन छाता योजना हवे, जेह में ₹250 करोड़ के लागत से पूरे देस में न्याय सुलभ करावे के कार्यक्रम चलावल जा रहल बा।\n\n"
                "**घटक:**\n"
                "• टेली-लॉ आ न्याय बंधु के देस भर में विस्तार।\n"
                "• **न्याय मित्र:** रिटायर्ड जज लोगन के लगा के 10 साल से पुरान पेंडिंग केस के निपटावे में मदद कइल जाला।\n"
                "• कानूनी साक्षरता आ जन-जागरूकता अभियान।"
            )

        elif "infrastructure" in t_lower or "nyay vikas" in t_lower:
            return (
                "न्यायपालिका खातिर बुनियादी ढांचा विकास योजना 1993-94 से चल रहल बा, जेह में जिला आ अधीनस्थ अदालतन में कोर्ट रूम आ जज लोगन के आवास बनावल जाला।\n\n"
                "• **न्याय विकास (Nyaya Vikas) पोर्टल:** इसरो (ISRO) के भुवन उपग्रह के मदद से कोर्ट निर्माण कार्य के जियो-टैगिंग क के ऑनलाइन निगरानी कइल जाला।"
            )

        else:
            # Domain-adaptive conversion for other uploaded documents
            body = content.replace("Department of Justice", "न्याय विभाग (Department of Justice)")
            body = body.replace("is provided to", "के दिहल जाला").replace("contact", "सम्पर्क करीं")
            body = body.replace("you can apply", "रउवा अरजी दे सकत बानी").replace("free of cost", "बिल्कुल मुफ्त")
            body = body.replace("court fee", "कचहरी के फीस").replace("legal advice", "कानूनी सलाह")
            body = body.replace("Tele-Law", "टेली-लॉ (Tele-Law)").replace("eCourts", "ई-कोर्ट (eCourts)").replace("NALSA", "नालसा (NALSA)")
            return body

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
            elif language == "bho":
                return [
                    "टेली-लॉ में केकरा के मुफ्त कानूनी सलाह मिलेला?",
                    "का एकरा खातिर सीएससी (CSC) सेंटर जाए के पड़ी?",
                    "टेली-लॉ मोबाइल ऐप कइसे डाउनलोड कइल जाई?"
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
            elif language == "bho":
                return [
                    "16 अंक के सीएनआर (CNR) नंबर कइसे खोजल जाई?",
                    "वर्चुअल कोर्ट में चालान कइसे भरल जाई?",
                    "राष्ट्रीय न्यायिक डेटा ग्रिड (NJDG) पर केस कइसे देखल जाला?"
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
            elif language == "bho":
                return [
                    "नालसा (NALSA) धारा 12 में केकरा के मुफ्त वकील मिलेला?",
                    "लोक अदालत के फैसला के खिलाफ काहें अपील ना हो सकेला?",
                    "मुफ्त कानूनी सहायता पावे खातिर अरजी कइसे दिहल जाई?"
                ]
            return [
                "What is the income ceiling under Section 12 of LSA Act?",
                "Why is a Lok Adalat settlement non-appealable?",
                "How to apply for an empanelled legal aid advocate?"
            ]

        return default_followups

llm_service = LLMService()
