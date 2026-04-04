interface StrengthMeterProps {
  password: string;
}

interface StrengthInfo {
  label: string;
  score: number; // 0-4
  color: string;
  bgColor: string;
  textColor: string;
}

function calcStrength(password: string): StrengthInfo {
  if (!password) {
    return { label: "", score: 0, color: "bg-gray-200", bgColor: "bg-gray-100", textColor: "text-gray-400" };
  }

  let score = 0;

  // Length scoring
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Character variety
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const variety = [hasUpper, hasLower, hasDigit, hasSymbol].filter(Boolean).length;
  if (variety >= 2) score++;
  if (variety >= 3) score++;
  if (variety === 4) score++;

  // Entropy bonus for very long passwords
  if (password.length >= 20 && variety >= 3) score++;

  // Clamp to 0-4
  const clamped = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;

  const map: Record<number, StrengthInfo> = {
    0: { label: "Very Weak", score: 0, color: "bg-red-500", bgColor: "bg-red-50", textColor: "text-red-600" },
    1: { label: "Weak", score: 1, color: "bg-orange-500", bgColor: "bg-orange-50", textColor: "text-orange-600" },
    2: { label: "Fair", score: 2, color: "bg-yellow-500", bgColor: "bg-yellow-50", textColor: "text-yellow-600" },
    3: { label: "Strong", score: 3, color: "bg-blue-500", bgColor: "bg-blue-50", textColor: "text-blue-600" },
    4: { label: "Very Strong", score: 4, color: "bg-green-500", bgColor: "bg-green-50", textColor: "text-green-600" },
  };

  return map[clamped];
}

export default function StrengthMeter({ password }: StrengthMeterProps) {
  const info = calcStrength(password);

  if (!password) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500">Strength</span>
        <span className={`text-xs font-semibold ${info.textColor}`}>{info.label}</span>
      </div>
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= info.score - 1 ? info.color : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
