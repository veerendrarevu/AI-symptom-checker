# from transformers import AutoTokenizer, AutoModelForCausalLM
# import torch


# # pick compute device; prefer cuda if available
# _device = "cuda" if torch.cuda.is_available() else "cpu"

# model_name = "Qwen/Qwen2.5-3B-Instruct"

# # tokenizer always lives on CPU
# tokenizer = AutoTokenizer.from_pretrained(model_name)

# # load the model, letting HF automatically map layers to GPU when possible
# model = AutoModelForCausalLM.from_pretrained(
#     model_name,
#     torch_dtype=torch.float16,
#     device_map="auto" if _device == "cuda" else None,
# )

# # ensure model is on the chosen device
# model.to(_device)

# system_prompt = (
#     "You are an AI healthcare symptom checker chatbot. "
#     "You do NOT provide medical diagnosis or prescriptions. "
#     "You ask follow-up questions about symptoms, duration, age, and gender. "
#     "You explain possible conditions in simple language and always advise consulting a doctor."
# )

# async def generate_response(history, user_input):
#     messages = history + [{"role": "user", "content": user_input}]

#     inputs = tokenizer.apply_chat_template(
#         [{"role": "system", "content": system_prompt}] + messages,
#         add_generation_prompt=True,
#         tokenize=True,
#         return_tensors="pt",
#         return_dict=True
#     ).to(_device)

#     # use amp autocast on GPU for slightly faster / memory-efficient inference
#     if _device == "cuda":
#         ctx = torch.cuda.amp.autocast
#     else:
#         ctx = torch.no_grad

#     with ctx():
#         outputs = model.generate(
#             **inputs,
#             max_new_tokens=200,
#             temperature=0.4,
#             top_p=0.9,
#             do_sample=True
#         )

#     response = tokenizer.decode(
#         outputs[0][inputs["input_ids"].shape[-1]:],
#         skip_special_tokens=True
#     )

#     return response


import ollama
import re

# ───────────────── SYSTEM PROMPT ─────────────────
system_prompt = (
    "You are an AI healthcare symptom checker chatbot.\n"
    "You ONLY answer questions related to health, symptoms, diseases, or medical conditions.\n"
    "If a question is NOT related to healthcare or medicine, respond ONLY with:\n"
    "'⚠️ I can only assist with medical or health-related questions.'\n\n"
    "Rules:\n"
    "- Keep responses to 2–4 short sentences maximum.\n"
    "- Do NOT provide medical diagnosis or prescriptions.\n"
    "- Ask ONE follow-up question about symptoms, duration, age, or gender.\n"
    "- Always end with: 'Consult a doctor immediately.'"
)

# ───────────────── MEDICAL KEYWORDS ─────────────────
medical_keywords = [

# Basic symptoms
"pain","fever","cough","cold","headache","vomit","nausea","infection",
"disease","symptom","doctor","hospital","medicine","treatment",

# Common conditions
"flu","covid","diabetes","asthma","allergy","migraine","arthritis",
"hypertension","blood pressure","bp","heart disease","stroke",

# Body parts / organs
"stomach","chest","head","throat","lungs","heart","kidney","liver",
"skin","eye","ear","nose","brain","muscle","joint","bone",

# Symptoms
"fatigue","weakness","swelling","dizziness","breathing","shortness of breath",
"palpitations","chills","sweating","rash","itching","bleeding",
"cramps","burning sensation","numbness","tingling",

# Digestive
"diarrhea","constipation","indigestion","gas","bloating","acid reflux",
"ulcer","food poisoning",

# Respiratory
"bronchitis","pneumonia","sinusitis","sore throat","runny nose",
"nasal congestion","wheezing",

# Injuries
"injury","fracture","sprain","burn","cut","wound","bruise",

# Tests
"blood test","x-ray","scan","mri","ct scan","ultrasound",
"diagnosis","medical report","lab test",

# Medicines
"tablet","pill","drug","antibiotic","painkiller","dose",

# Mental health
"anxiety","depression","stress","panic attack","mental health",

# Women health
"pregnancy","period","menstruation","pcos","pcod","hormone",

# Children
"vaccination","immunization","growth","nutrition"
]

# ───────────────── GENERAL FOLLOW-UP KEYWORDS ─────────────────
general_chat_keywords = [
"yes","no","yeah","yep","nope","ok","okay","sure","maybe",
"since","today","yesterday","days","weeks","months",
"morning","night","sometimes","often","rarely",
"male","female","age","years","old",
"started","before","after","recently",
"little","very","mild","severe"
]

# ───────────────── MEDICAL QUESTION DETECTOR ─────────────────
def is_medical_question(text: str, history=None):

    text = text.lower()

    # Check medical keywords
    for keyword in medical_keywords:
        if re.search(r"\b" + re.escape(keyword) + r"\b", text):
            return True

    # Allow follow-up answers if conversation already started
    if history:
        last_msgs = history[-4:]
        for msg in last_msgs:
            if isinstance(msg, dict) and msg.get("role") == "assistant":
                return True

    # Allow general follow-up words
    for keyword in general_chat_keywords:
        if keyword in text:
            return True

    return False


# ───────────────── MAIN RESPONSE FUNCTION ─────────────────
async def generate_response(history, user_input):

    # 🚨 Block non-medical questions
    if not is_medical_question(user_input, history):
        return "⚠️ I can only assist with medical or health-related questions."

    messages = [{"role": "system", "content": system_prompt}]

    for m in history:
        if isinstance(m, list):
            messages.extend(m)
        else:
            messages.append(m)

    messages.append({"role": "user", "content": user_input})

    # Streaming response from Ollama
    stream = await ollama.AsyncClient().chat(
        model="qwen2.5:1.5b",
        messages=messages,
        stream=True,
        options={
            "num_predict": 120,
            "temperature": 0.3,
            "top_p": 0.7,
            "repeat_penalty": 1.1
        }
    )

    full_response = ""

    async for chunk in stream:
        content = chunk["message"]["content"]
        if content:
            print(content, end="", flush=True)
            full_response += content

    print()

    return full_response