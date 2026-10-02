import dotenv from "dotenv";
dotenv.config();

const genearteTopicText = async (Topic) => {
  const response = await fetch(process.env.OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3.5-lightning:free",
      messages: [
        {
          role: "user",
          content: `simply your are Ai agent you have to do the tasks i send you and give me the best information:  ${Topic}`,
        },
      ],
      max_tokens: 200,
    }),
  });
  const data = await response.json();
  console.log("response info:", data);
  if (!response.ok) {
    throw new Error(data.error?.message || "OpenRouter API request failed");
  }
  return data.choices[0].message.content;
};

const resultOne = await genearteTopicText("Why do LLMs need Python?");

console.log("result response: ", resultOne);

const createBlogPost = async (blog) => {
  const response = await fetch(process.env.OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3.5-lightning:free",
      messages: [
        {
          role: "system",
          content: `Since you already answered my topic, now write the complete blog post outline or article.`,
        },
        {
          role: "user",
          content: `Write a complete blog post or article about: ${blog}`,
        },
      ],
      max_tokens: 300,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenRouter request failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let fullResponse = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    const chunk = decoder.decode(value, { stream: true });

    const lines = chunk.split("\n");

    for (const line of lines) {
      if (!line.startsWith("data: ")) {
        continue;
      }

      const data = line.slice(6).trim();

      if (data === "[DONE]") {
        continue;
      }

      try {
        const json = JSON.parse(data);

        const content = json.choices[0]?.delta?.content;

        if (content) {
          process.stdout.write(content);
          fullResponse += content;
        }
      } catch {
        console.error("there is an issue during fetching chunks");
      }
    }
  }

  return fullResponse;
};

const resultTwo = await createBlogPost(resultOne);

console.log("\n\n--- Complete Result ---");
console.log("result two", resultTwo);

const summarizeOutline = async (text, length = "short") => {
  const lengthInstructions = {
    short:
      "Summarize this text in 2-3 sentences. Keep only the most important points.",

    medium:
      "Summarize this text in one clear paragraph. Include the main ideas and important details.",

    long: "Provide a detailed summary. Include the main ideas, important details, and key explanations while avoiding unnecessary repetition.",
  };
  const response = await fetch(process.env.OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3.5-lightning:free",
      messages: [
        {
          role: "system",
          content: `Since you already make blog bost or outline please summarize 2-3 sentences`,
        },
        {
          role: "user",
          content: `${lengthInstructions[length]} please summarize the outlines 2-3 sentences: ${text}`,
        },
      ],
      max_tokens: length === "short" ? 100 : length === "medium" ? 200 : 400,
    }),
  });
  const data = await response.json();
  console.log("response info:", data);
  if (!response.ok) {
    throw new Error(data.error?.message || "OpenRouter API request failed");
  }
  return data.choices[0].message.content;
};

const resultThree = await summarizeOutline(resultTwo);
console.log("result three", resultThree);

const askQuestion = async (question, context) => {
  const response = await fetch(process.env.OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3.5-lightning:free",
      messages: [
        {
          role: "system",
          content:
            "You are a context-aware AI assistant. Answer the user's question using the provided context.",
        },
        {
          role: "user",
          content: ` Here is the previous context: ${context}Now answer this question: ${question} `,
        },
      ],
      max_tokens: 300,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenRouter API request failed");
  }

  return data.choices[0].message.content;
};

const question =
  "Is Python required to build the actual LLM model, or is it mainly used to build applications around LLMs?";

const followUpAnswer = await askQuestion(question, resultTwo);

console.log("\n--- Question ---");
console.log(question);

console.log("\n--- Answer ---");
console.log(followUpAnswer);

const askQuestions = async (question, context, mode = "factual") => {
  const temperature = mode === "creative" ? 0.8 : 0.2;

  const response = await fetch(process.env.OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3.5-lightning:free",
      temperature,
      messages: [
        {
          role: "system",
          content:
            mode === "creative"
              ? "You are a creative AI assistant. Give engaging and imaginative answers."
              : "You are a factual AI assistant. Give accurate, clear, and direct answers.",
        },
        {
          role: "user",
          content: `Previous context:${context}Question:${question}`,
        },
      ],
      max_tokens: 300,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenRouter API request failed");
  }

  return data.choices[0].message.content;
};

const fatctualAnswer = await askQuestions(
  "Why is Python commonly used for AI?",
  resultTwo,
  "factual",
);
console.log(fatctualAnswer);
const creativeAnswer = await askQuestions(
  "Explain why Python is popular for AI using a simple real-world analogy.",
  resultTwo,
  "creative",
);
console.log(creativeAnswer);
