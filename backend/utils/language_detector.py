try:
    from langdetect import detect as detect_lang
    LANGDETECT_AVAILABLE = True
except ImportError:
    LANGDETECT_AVAILABLE = False


async def detect_and_translate(text: str) -> tuple:
    if not LANGDETECT_AVAILABLE:
        return text, False, "en"

    try:
        detected = detect_lang(text)
    except Exception:
        detected = "en"

    if detected == "en":
        return text, False, "en"

    try:
        from transformers import pipeline
        translator = pipeline(
            "translation",
            model=f"Helsinki-NLP/opus-mt-{detected}-en",
            max_length=512
        )
        chunks = [text[i:i+400] for i in range(0, len(text), 400)]
        translated_chunks = []
        for chunk in chunks[:5]:
            result = translator(chunk)
            translated_chunks.append(result[0]["translation_text"])
        translated = " ".join(translated_chunks)
        return translated, True, detected
    except Exception:
        return text, False, detected
