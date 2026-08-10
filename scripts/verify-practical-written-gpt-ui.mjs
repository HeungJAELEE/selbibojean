import { chromium } from "playwright";

const baseUrl = process.env.PRACTICAL_WRITTEN_UI_BASE_URL;
if (!baseUrl) {
  throw new Error("PRACTICAL_WRITTEN_UI_BASE_URL is required.");
}

const route =
  "/practical/written/card/%ED%94%8C%EB%9E%9C%EC%A7%80-%EC%BB%A4%ED%94%8C%EB%A7%81-%EC%A0%84%EB%8B%AC%ED%86%A0%ED%81%AC";
const cardTestId = "practical-written-exam-card-PWEC-P-2025-1-Q01";
const expectedSections = [
  "개념과 기출을 이렇게 연결하세요",
  "정의에서 확인",
  "원리와 배경",
  "시험에서 묻는 방식",
];

const browser = await chromium.launch({ headless: true });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
    });
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });

    const card = page.getByTestId(cardTestId);
    if ((await card.count()) !== 1) {
      throw new Error(`GPT editorial card is missing at ${width}px.`);
    }

    const text = await card.innerText();
    for (const section of expectedSections) {
      if (!text.includes(section)) {
        throw new Error(`${section} is missing at ${width}px.`);
      }
    }
    if (text.includes("문제 조건에서 요구한")) {
      throw new Error(`Generic filler remains at ${width}px.`);
    }

    console.log(`PASS viewport=${width} cardLength=${text.length}`);
    await page.close();
  }
} finally {
  await browser.close();
}
