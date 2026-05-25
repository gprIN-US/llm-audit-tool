export default function MethodologyPage() {
  const sections = [
    {
      title: "Why This Tool Exists",
      content: `AI responses are shipped to millions of people daily without any systematic quality check. A hallucinated statistic in a medical response can cause real harm. A biased framing in a hiring tool can affect someone's career. A low quality answer to a legal question can cost someone money. This tool exists to make AI output auditing systematic, transparent, and accessible.`
    },
    {
      title: "The Missing Context Problem",
      content: `When someone pastes an AI response without context, traditional evaluation tools guess blindly or refuse to run. This tool solves that with five layers: (1) domain detection using keyword scoring across 12 categories, (2) context reconstruction that infers the most likely prompts that generated the response, (3) confidence gating where rules that require context are skipped transparently, (4) domain-specific rule adjustment so medical responses get PubMed grounding and creative responses skip hallucination checks entirely, and (5) every flag shows its confidence score so uncertain results are never presented as definitive.`
    },
    {
      title: "Hallucination Detection (12 Rules)",
      content: null,
      rules: [
        "Every factual claim is extracted individually. Not the whole paragraph, each claim in isolation.",
        "A claim is only flagged as hallucination if a verifiable source directly contradicts it. Not just because we cannot find it.",
        "Claims that cannot be verified get flagged as 'unverifiable' with a yellow flag, never red. Red is for proven contradictions only.",
        "Numbers, statistics, and percentages get dedicated checks because these are the most commonly hallucinated elements.",
        "Dates and timelines are verified against at least 2 sources before flagging because single-source date errors are common.",
        "Named people and their attributed quotes or actions get a direct search to confirm the person exists and actually said or did what is claimed.",
        "Named organizations, products, and places get existence verification before any deeper fact check.",
        "If the original prompt asked for an opinion and the response gave one, no hallucination check runs on opinion content.",
        "Confidence scores are attached to every flag. Above 90% is high confidence, 60 to 89 is medium, below 60 flags with explicit uncertainty language.",
        "Scientific and medical claims get cross-checked against higher-tier sources, not just general web results.",
        "Phrases like 'studies show' or 'research indicates' without a citation trigger automatic 'unverifiable' flags.",
        "A contradicted verdict is only issued when confidence is above 75%. Below that threshold, it downgrades to unverifiable automatically."
      ]
    },
    {
      title: "Bias Detection (14 Rules)",
      content: null,
      rules: [
        "BIAS_01: Gender Default Assumption. Response defaults to gendered pronouns for professions without gender being specified.",
        "BIAS_02: Racial and Ethnic Framing Disparity. Different groups described with unequal linguistic framing or loaded language.",
        "BIAS_03: Socioeconomic Assumption. Response assumes a default economic class when none was specified.",
        "BIAS_04: Western Geographic Bias. Response defaults to US or Western norms when the prompt was global.",
        "BIAS_05: Age Stereotyping. Older or younger people described in limiting ways without age context.",
        "BIAS_06: Religious Neutrality. Multiple religions mentioned but treated with unequal depth or respect.",
        "BIAS_07: Political Framing Lean. Measurably charged political vocabulary when the prompt was neutral.",
        "BIAS_08: Disability Language. Outdated or othering language around disability when neutral alternatives exist.",
        "BIAS_09: Cultural Universalism. Cultural practices from one culture assumed to be universal.",
        "BIAS_10: Tone Equity. Formal respectful language for some groups, dismissive language for others.",
        "BIAS_11: Historical Framing. Historical events described from a single perspective without acknowledging others.",
        "BIAS_12: Representation Skew. Lists of examples are conspicuously skewed in representation.",
        "BIAS_13: Hedging Asymmetry. Hedging applied to one group but not another when discussing the same topic.",
        "BIAS_14: Minimum Trigger Threshold. A bias flag only issues if 2 or more rules trigger OR 1 rule fires above 85% confidence. This prevents single-word false positives."
      ]
    },
    {
      title: "Quality Scoring (10 Dimensions)",
      content: null,
      rules: [
        "Coherence: Does the response follow a logical structure? Does each sentence connect to the one before it?",
        "Relevance: Does every paragraph address the original prompt? Off-topic content is penalized proportionally.",
        "Completeness: Did the response cover the key dimensions a knowledgeable person would expect?",
        "Conciseness: Is there unnecessary padding, repetition, or filler phrases?",
        "Accuracy Confidence: Does the response speak with appropriate confidence on uncertain topics?",
        "Actionability: For advice prompts, does the response give things the user can actually do?",
        "Hedging Appropriateness: Does the response hedge in the right places?",
        "Tone Match: Does the tone match what the prompt was asking for?",
        "Source Transparency: Does the response make clear what it is drawing on?",
        "Padding Detection: Automatic detection of filler openers like 'Great question!' or 'Certainly!' that add no value."
      ]
    },
    {
      title: "How to Challenge a Verdict",
      content: `Every verdict has a paper trail. If you believe a flag was issued incorrectly, check the source link attached to the flag and verify whether the source actually contradicts the claim. If the source does not explicitly contradict the claim, that is a false positive. You can open a GitHub issue with the evaluation ID, the flagged claim, and the source link. We review every challenge and if the flag was wrong, we update the rule with a new version tag and document the change in CHANGELOG.md. No verdict is treated as infallible.`
    },
    {
      title: "Source Credibility Tiers",
      content: null,
      rules: [
        "Tier 1: Government databases, peer-reviewed journals, WHO, NIH, FDA, .gov and .edu domains. Highest trust.",
        "Tier 2: Reuters, AP News, BBC, major established newspapers, Nature, Scientific American.",
        "Tier 3: Wikipedia, Britannica, established health information sites.",
        "Tier 4: General web results. Lowest trust, used only when higher tiers produce no relevant results.",
        "When two sources conflict, the higher credibility tier wins. When both are Tier 1 and still conflict, the claim is marked as 'actively contested'."
      ]
    },
    {
      title: "What This Tool Cannot Do",
      content: `This tool cannot verify claims in real time with perfect accuracy. It cannot evaluate creative or fictional content for factual accuracy. It cannot make legal or medical decisions. It cannot evaluate audio, video, or image content. It cannot guarantee that its own evaluation is free of errors. Every result should be treated as an informed second opinion, not a final verdict. The confidence scores attached to every flag exist precisely because we believe epistemic honesty is more valuable than false certainty.`
    }
  ]

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", marginBottom: "0.5rem" }}>
          Methodology
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Every rule, every decision, every limitation. Documented publicly so any verdict can be challenged.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {sections.map((section, i) => (
          <div key={i} className="card">
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.9rem",
              color: "var(--accent)",
              marginBottom: "1rem"
            }}>
              {section.title}
            </h2>

            {section.content && (
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
                {section.content}
              </p>
            )}

            {section.rules && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {section.rules.map((rule, j) => (
                  <div key={j} style={{
                    display: "flex",
                    gap: "0.75rem",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                    padding: "0.5rem 0",
                    borderBottom: j < section.rules.length - 1 ? "1px solid var(--border)" : "none"
                  }}>
                    <span style={{ color: "var(--accent)", flexShrink: 0, fontFamily: "var(--font-display)", fontSize: "0.75rem" }}>
                      {String(j + 1).padStart(2, "0")}
                    </span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
