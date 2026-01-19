export function scoreByLogic(text) {
  const rules = ["เปิดการสนทนา", "อธิบายชัด", "สรุป"];
  const matched = rules.filter((r) => text.includes(r));

  return {
    score: matched.length * 30,
    matchedRules: matched,
    explanation: "ประเมินจาก keyword ที่พบในข้อความ"
  };
}
