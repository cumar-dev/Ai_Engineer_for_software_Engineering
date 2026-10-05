import dotenv from "dotenv";
import { writeFile } from "node:fs/promises";
dotenv.config();

const generateTTs = async (text) => {
  const response = await fetch(process.env.OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "fish-audio/s2.1-pro-free:free",
      input: text,
      response_format: "mp3",
    }),
  });
  if (!response.ok) {
    throw new Error(`TTS failed ${response.status}, ${await response.text()}`);
  }
  const audioBuffer = Buffer.from(await response.arrayBuffer());
  await writeFile("output.mp3", audioBuffer);
  const generationId = response.headers.get("X-Generation-Id");
  console.log(`Generation ID: ${generationId}`);
};

await generateTTs(
  "`[Happy and excited]Hi, today is a monday so i am testing text to speech using fish model",
);
