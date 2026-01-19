import { useState } from "react";
import { scoreByLogic } from "./logicScorer";
import { supabase } from "./supabaseClient";

export default function App() {
  const [login, setLogin] = useState({
    employeeId: "",
    name: "",
    department: ""
  });
  const [loggedIn, setLoggedIn] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [logicScore, setLogicScore] = useState(null);
  const [aiScore, setAiScore] = useState(null);
  const [aiError, setAiError] = useState("");

  const handleLogin = () => {
    if (
      !login.employeeId ||
      !login.name ||
      !login.department ||
      isNaN(login.employeeId)
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setLoggedIn(true);
  };

  const runEvaluation = async () => {
    const logic = scoreByLogic(transcript);
    setLogicScore(logic);

    try {
      const { data, error } = await supabase.functions.invoke("ai-evaluate", {
        body: { transcript }
      });

      if (error || data?.error) {
        throw new Error("AI_UNAVAILABLE");
      }
      setAiScore(data);
    } catch {
      setAiError("⚠ ระบบ AI ยังไม่พร้อมใช้งาน");
    }
  };

  if (!loggedIn) {
    return (
      <div className="container">
        <h2>เข้าสู่ระบบ</h2>
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="รหัสพนักงาน"
          value={login.employeeId}
          onChange={(e) =>
            setLogin({ ...login, employeeId: e.target.value })
          }
          required
        />
        <input
          placeholder="ชื่อ"
          value={login.name}
          onChange={(e) => setLogin({ ...login, name: e.target.value })}
          required
        />
        <input
          placeholder="ฝ่าย / เขต"
          value={login.department}
          onChange={(e) =>
            setLogin({ ...login, department: e.target.value })
          }
          required
        />
        <button onClick={handleLogin}>เข้าใช้งาน</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>AI Evaluation</h2>

      <textarea
        placeholder="วางข้อความที่แปลงจากเสียงที่นี่"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
      />

      <button onClick={runEvaluation}>ประเมินผล</button>

      {logicScore && (
        <div className="panel">
          <h3>Logic Score</h3>
          <p>คะแนน: {logicScore.score}</p>
          <p>{logicScore.explanation}</p>
          <ul>
            {logicScore.matchedRules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {aiScore && (
        <div className="panel">
          <h3>AI Score</h3>
          <p>คะแนน: {aiScore.score}</p>
          <strong>จุดแข็ง</strong>
          <ul>{aiScore.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
          <strong>ควรปรับปรุง</strong>
          <ul>{aiScore.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
          <p>{aiScore.recommendation}</p>
        </div>
      )}

      {aiError && <p>{aiError}</p>}
    </div>
  );
}
