# Module 1: AI Literacy for Technical Writers
## 🟢 Novice Level

**Duration:** 2 hours | **Prerequisite:** None | **Tech Writer's Tribe**

---

## What This Level Means

**Novice** means you are brand new to AI tools. You may have heard terms like ChatGPT, Claude, or LLM but haven't used them for professional documentation work. By the end of this module, you will understand how AI works at a conceptual level and feel confident starting a conversation with an AI assistant.

### Novice Learning Objectives

By the end of Module 1, you will be able to:
- Explain how LLMs work using a simple analogy (no math required)
- Name three things AI does well and three things it needs human judgment for
- Describe the Human + AI partnership model in your own words
- Complete at least one real documentation task using Claude

---

## Welcome and Introductions (15 min)

### Ice-Breaker

> "What's the most repetitive part of your documentation workflow that you wish a machine could handle?"

Write your answer in chat or on a sticky note. You'll reference it throughout the program — and probably build a skill to solve it by Module 4.

### What This Program Is About

Over 8 modules, you will go from understanding AI conceptually to building real, working AI-powered documentation tools. You don't need to know how to code.

You need to know how to write clear instructions — and that is exactly what you already do for a living.

### What You Will Build

| Deliverable | When |
|------------|------|
| 5–7 Claude Skills | Modules 3–7 |
| A working MCP server | Modules 6–7 |
| Personal AI Integration Plan | Module 8 |

---

## How LLMs Work — No Math Required (25 min)

Large Language Models (LLMs) like Claude are **pattern completion engines**. They've been trained on enormous amounts of text and learned to predict what comes next.

### The Library Analogy (Novice Version)

Imagine you have read every book, article, manual, and forum thread ever published online. Someone gives you the start of a sentence, and you complete it using everything you've ever read.

That is roughly what an LLM does — except:
- The "library" is a significant portion of the public internet
- The "reading" happened during a training phase
- The "completion" is generated one token (roughly one word) at a time

### Key Vocabulary

| Term | Plain-Language Meaning |
|------|----------------------|
| **LLM** | Large Language Model — the AI brain trained on text |
| **Training** | The LLM "reads" billions of documents and learns patterns |
| **Token** | A chunk of text (roughly a word or word piece) the model processes |
| **Context window** | How much text the model can "see" at once — like short-term memory |
| **Prompt** | What you type to the AI — your question or instruction |
| **Response / Inference** | What the AI generates back to you |
| **Hallucination** | When the AI generates plausible-sounding but incorrect information |

> **🟢 Novice Tip:** You don't need to understand the math. You need to understand the *behavior*. LLMs complete patterns — which is great for structured content like documentation.

---

## What AI Is Good At vs. What It Needs You For (15 min)

### AI Strengths (Pattern Work)

- Recognizing whether a document follows a known structure
- Generating text in a specific style or format
- Checking completeness against a checklist
- Reformatting, reorganizing, and summarizing content
- Catching common style and grammar issues consistently

### What AI Needs You For (Judgment Work)

| AI Gap | Why You're Essential |
|--------|---------------------|
| **Factual accuracy** | AI doesn't know your product — you do |
| **Audience awareness** | Will a junior dev actually understand this? |
| **Strategic decisions** | Should we even document this feature? |
| **Missing context** | Why was this API deprecated? What's the roadmap? |
| **"Good enough" calls** | Does this meet the bar for publication? |

### The Partnership Principle

> AI is excellent at the *form* of documentation (structure, style, completeness).  
> AI needs *you* for the *substance* (accuracy, intent, audience awareness).

This is not about AI replacing technical writers. It is about AI handling the repetitive work so you can focus on the work that requires human judgment.

---

## The Human + AI Partnership Model (15 min)

### Partnership Table

| Task | Who Leads | Who Assists |
|------|-----------|------------|
| Understanding the audience | **You** | AI (summarize user research) |
| Checking doc structure | **AI** | You (verify findings) |
| Deciding what to document | **You** | AI (surface gaps) |
| Enforcing style rules | **AI** | You (configure the rules) |
| Accuracy review | **You** | AI (flag potential errors) |
| Boilerplate generation | **AI** | You (customize output) |

### The Amplification Model

```
Without AI:  [Your expertise] → [Your output]
With AI:     [Your expertise] → [AI execution] → [Your review] → [10x output]
```

You remain the expert. AI is the executor. You are the quality gate.

---

## Confidence Builder: Three Live Exercises (45 min)

### Exercise 1 — Ask Claude About Your Work (10 min)

Open Claude (claude.ai or Claude Code). Ask it:

```
I am a technical writer. I write API documentation for developer audiences. 
What are the five most common structural problems in API documentation?
```

Discuss: Does the output look like what you'd expect from an experienced colleague? What surprised you?

### Exercise 2 — Give Claude a Documentation Task (15 min)

Paste any short piece of documentation you've written and ask:

```
Review this documentation excerpt. Tell me:
1. What works well
2. What is unclear or incomplete
3. Three specific improvements

Be direct and specific.
```

Discuss: Was the feedback useful? Would you use it?

### Exercise 3 — Try the Quality Safety Net (20 min)

This is the "aha moment" for most participants.

Take the worst API doc you've ever seen (or use the `bad-api-doc.md` in `sample-project/test-docs/`). Ask Claude:

```
Review this API documentation. Check if it includes:
- A clear description of what the endpoint does
- Authentication requirements
- All request parameters with types and descriptions
- Response format with field descriptions
- Error codes and what they mean
- A working example request and response

For each item, say: PRESENT, INCOMPLETE, or MISSING
```

Discuss: How long did that take? How long would it have taken manually?

---

## Discussion and Wrap-Up (10 min)

### Reflection Questions

1. What was your biggest surprise about how AI actually works?
2. Where in your workflow does the "pattern completion" strength apply most?
3. What makes you nervous about AI in your work? (This is valid — name it.)
4. Revisit your ice-breaker answer: could AI help with that repetitive task?

### The Key Takeaway

> "AI is not a replacement. It's a power tool. You still need the carpenter."

---

## Homework (Before Module 2)

1. **Read** Module 2 lesson (Introduction to MCP)
2. **Use Claude** for one real documentation task this week — any task
3. **Write** three sentences in your own words: what did AI do well? What did you have to fix?
4. Come ready to share your experience in the Module 2 opening

---

## 🟢 Novice Checklist

Before moving to Module 2, confirm you can:

- [ ] Explain what an LLM is using your own words (not jargon)
- [ ] Name two things AI does well in documentation contexts
- [ ] Name two things that always require human judgment
- [ ] Describe the Human + AI partnership in one sentence
- [ ] Have completed at least one real task using Claude
