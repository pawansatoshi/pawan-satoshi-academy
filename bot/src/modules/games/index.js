const games = new Map();

const TERMS = [
  { prompt: "Which protocol translates domain names to network addresses?", answer: "dns", choices: ["dns", "http", "git", "ssh"] },
  { prompt: "Which authentication method is generally resistant to phishing?", answer: "passkey", choices: ["password reuse", "passkey", "shared otp", "security question"] },
  { prompt: "Which Git object records a project snapshot?", answer: "commit", choices: ["commit", "cookie", "socket", "packet"] },
  { prompt: "What does HTTPS add to HTTP?", answer: "tls", choices: ["tls", "dns", "git", "smtp"] },
  { prompt: "What does a wallet private key primarily control?", answer: "signing", choices: ["signing", "internet speed", "dns", "email"] }
];

export function createGame(memberId) {
  const term = TERMS[Math.floor(Math.random() * TERMS.length)];
  const id = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  games.set(id, { memberId, term, createdAt: Date.now() });
  return { id, ...term };
}

export function answerGame(id, memberId, choice) {
  const game = games.get(id);
  if (!game || game.memberId !== memberId) return { valid: false, message: "This game has expired." };
  games.delete(id);
  const correct = choice === game.term.answer;
  return { valid: true, correct, answer: game.term.answer };
}
