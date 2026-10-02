// Comprehensive 4-Skills CEFR & IELTS Placement Assessment Data
// Covering CEFR A1 -> C2 across Grammar/Reading, Listening, Writing, and Speaking

const CEFR_EXAM_DATA = {
  title: "Comprehensive English Language Placement Assessment",
  subtitle: "CEFR Multi-Skill Diagnostic System (A1 - C2) with CBM",
  defaultDurationMinutes: 65,
  totalSections: 4,

  // Section 1: Grammar & Vocabulary (Items 1 - 30)
  grammarQuestions: [
    // Level A1 (Items 1 - 5)
    {
      id: 1,
      section: "grammar",
      cefr: "A1",
      skill: "Present Simple - Verb To Be",
      text: "Hello, my name is David and I _______ from London.",
      options: { A: "am", B: "is", C: "are", D: "be" },
      correct: "A"
    },
    {
      id: 2,
      section: "grammar",
      cefr: "A1",
      skill: "Articles & Basic Nouns",
      text: "She has _______ apple and two oranges in her bag.",
      options: { A: "a", B: "an", C: "the", D: "any" },
      correct: "B"
    },
    {
      id: 3,
      section: "grammar",
      cefr: "A1",
      skill: "Possessive Adjectives",
      text: "This is my brother. _______ name is Marcus.",
      options: { A: "His", B: "Her", C: "Their", D: "Him" },
      correct: "A"
    },
    {
      id: 4,
      section: "grammar",
      cefr: "A1",
      skill: "Basic Plurals & Demonstratives",
      text: "Are _______ your keys on the table over there?",
      options: { A: "this", B: "that", C: "these", D: "those" },
      correct: "D"
    },
    {
      id: 5,
      section: "grammar",
      cefr: "A1",
      skill: "Basic Questions (Auxiliary Do)",
      text: "_______ you like drinking tea in the morning?",
      options: { A: "Do", B: "Are", C: "Does", D: "Is" },
      correct: "A"
    },

    // Level A2 (Items 6 - 10)
    {
      id: 6,
      section: "grammar",
      cefr: "A2",
      skill: "Past Simple (Irregular Verbs)",
      text: "Yesterday we _______ to the museum and saw the ancient artifacts.",
      options: { A: "go", B: "went", C: "gone", D: "going" },
      correct: "B"
    },
    {
      id: 7,
      section: "grammar",
      cefr: "A2",
      skill: "Comparatives & Superlatives",
      text: "Travelling by train is usually _______ than flying for short trips.",
      options: { A: "cheap", B: "cheaper", C: "cheapest", D: "more cheap" },
      correct: "B"
    },
    {
      id: 8,
      section: "grammar",
      cefr: "A2",
      skill: "Prepositions of Place & Time",
      text: "The library opens at 8:30 AM _______ Mondays.",
      options: { A: "at", B: "in", C: "on", D: "to" },
      correct: "C"
    },
    {
      id: 9,
      section: "grammar",
      cefr: "A2",
      skill: "Future Intentions (Going to)",
      text: "Look at those dark clouds! It _______ rain soon.",
      options: { A: "is going to", B: "will be", C: "shall", D: "goes to" },
      correct: "A"
    },
    {
      id: 10,
      section: "grammar",
      cefr: "A2",
      skill: "Modal Verbs (Can/Can't/Must)",
      text: "You _______ smoke inside the hospital building. It is strictly forbidden.",
      options: { A: "don't have to", B: "mustn't", C: "might not", D: "needn't" },
      correct: "B"
    },

    // Level B1 (Items 11 - 15)
    {
      id: 11,
      section: "grammar",
      cefr: "B1",
      skill: "Present Perfect vs Past Simple",
      text: "I haven't completed my assignment _______ because I was unwell.",
      options: { A: "already", B: "yet", C: "still", D: "just" },
      correct: "B"
    },
    {
      id: 12,
      section: "grammar",
      cefr: "B1",
      skill: "First & Second Conditionals",
      text: "If I _______ more money, I would travel around South America.",
      options: { A: "have", B: "had", C: "will have", D: "would have" },
      correct: "B"
    },
    {
      id: 13,
      section: "grammar",
      cefr: "B1",
      skill: "Relative Clauses (Defining)",
      text: "The architect _______ designed the new university campus won an award.",
      options: { A: "which", B: "whose", C: "who", D: "whom" },
      correct: "C"
    },
    {
      id: 14,
      section: "grammar",
      cefr: "B1",
      skill: "Passive Voice (Present & Past)",
      text: "Millions of smartphones _______ manufactured every year in Asia.",
      options: { A: "are", B: "were", C: "is", D: "have" },
      correct: "A"
    },
    {
      id: 15,
      section: "grammar",
      cefr: "B1",
      skill: "Gerunds vs Infinitives",
      text: "I really look forward to _______ you at the conference next week.",
      options: { A: "meet", B: "meeting", C: "met", D: "have met" },
      correct: "B"
    },

    // Level B2 (Items 16 - 20)
    {
      id: 16,
      section: "grammar",
      cefr: "B2",
      skill: "Third Conditional",
      text: "If we had checked the schedule earlier, we _______ missed the express train.",
      options: { A: "wouldn't have", B: "hadn't", C: "won't have", D: "wouldn't" },
      correct: "A"
    },
    {
      id: 17,
      section: "grammar",
      cefr: "B2",
      skill: "Past Perfect Continuous",
      text: "She was exhausted because she _______ non-stop for over six hours.",
      options: { A: "has worked", B: "had been working", C: "was worked", D: "works" },
      correct: "B"
    },
    {
      id: 18,
      section: "grammar",
      cefr: "B2",
      skill: "Modal Verbs of Deduction (Past)",
      text: "The streets are completely soaking wet. It _______ heavily last night.",
      options: { A: "must have rained", B: "should rain", C: "can rain", D: "must rain" },
      correct: "A"
    },
    {
      id: 19,
      section: "grammar",
      cefr: "B2",
      skill: "Complex Linking Words (Contrast)",
      text: "_______ the severe economic downturn, the tech startup expanded rapidly.",
      options: { A: "Although", B: "Despite", C: "However", D: "In spite" },
      correct: "B"
    },
    {
      id: 20,
      section: "grammar",
      cefr: "B2",
      skill: "Phrasal Verbs (Academic/Professional)",
      text: "The executive committee decided to _______ the meeting until next Friday.",
      options: { A: "put off", B: "call out", C: "turn down", D: "bring up" },
      correct: "A"
    },

    // Level C1 (Items 21 - 25)
    {
      id: 21,
      section: "grammar",
      cefr: "C1",
      skill: "Inversion with Negative Adverbials",
      text: "Seldom _______ such an eloquent and persuasive presentation in academia.",
      options: { A: "I have witnessed", B: "have I witnessed", C: "I witnessed", D: "did I witnessed" },
      correct: "B"
    },
    {
      id: 22,
      section: "grammar",
      cefr: "C1",
      skill: "Participle Clauses",
      text: "_______ all available clinical data, the researchers published their conclusive report.",
      options: { A: "Having analyzed", B: "Analyzing", C: "Analyzed", D: "To have analyzed" },
      correct: "A"
    },
    {
      id: 23,
      section: "grammar",
      cefr: "C1",
      skill: "Mixed Conditionals",
      text: "If he had taken the advice back then, he _______ in such a complicated position today.",
      options: { A: "would not be", B: "would not have been", C: "is not", D: "will not be" },
      correct: "A"
    },
    {
      id: 24,
      section: "grammar",
      cefr: "C1",
      skill: "Academic Collocations & Nuance",
      text: "The preliminary findings _______ a stark contrast to previously established hypotheses.",
      options: { A: "draw", B: "paint", C: "shed", D: "pose" },
      correct: "A"
    },
    {
      id: 25,
      section: "grammar",
      cefr: "C1",
      skill: "Subjunctive & Formal Modals",
      text: "The oversight committee recommended that the institution _______ its safety protocols immediately.",
      options: { A: "revises", B: "revise", C: "revised", D: "must revise" },
      correct: "B"
    },

    // Level C2 (Items 26 - 30)
    {
      id: 26,
      section: "grammar",
      cefr: "C2",
      skill: "Advanced Inverted Conditionals",
      text: "_______ any irregularities arise during the audit, the board will convene an emergency session.",
      options: { A: "Should", B: "Were", C: "Had", D: "Provided" },
      correct: "A"
    },
    {
      id: 27,
      section: "grammar",
      cefr: "C2",
      skill: "Rare Idiomatic & Prepositional Structures",
      text: "The author's philosophical premise is entirely predicated _______ empirical observation.",
      options: { A: "in", B: "upon", C: "with", D: "by" },
      correct: "B"
    },
    {
      id: 28,
      section: "grammar",
      cefr: "C2",
      skill: "Advanced Lexical Precision",
      text: "The government's heavy-handed intervention served only to _______ the prevailing crisis.",
      options: { A: "exacerbate", B: "ameliorate", C: "extrapolate", D: "obviate" },
      correct: "A"
    },
    {
      id: 29,
      section: "grammar",
      cefr: "C2",
      skill: "Complex Discourse Markers",
      text: "The treaty was ratified, _______ paving the way for multilateral economic integration.",
      options: { A: "thereby", B: "inasmuch", C: "whereas", D: "notwithstanding" },
      correct: "A"
    },
    {
      id: 30,
      section: "grammar",
      cefr: "C2",
      skill: "Sophisticated Semantic Constraints",
      text: "Her critical assessment of the proposed legislation was both incisive and _______.",
      options: { A: "scathing", B: "shallowing", C: "scrambling", D: "stifling" },
      correct: "A"
    }
  ],

  // Section 2: Listening Comprehension (Items 31 - 45)
  // 3 Audio Tracks with built-in Web Speech Synthesis reader or audio playback
  listeningTracks: [
    {
      id: 1,
      title: "Audio Track 1: Everyday Social Dialogue (CEFR A1 - A2)",
      level: "A1 - A2",
      description: "A conversation at a university student accommodation reception.",
      transcript: "Receptionist: Good morning! Welcome to Oakwood Student Hall. How can I help you today?\nStudent: Hello! My name is Emily Watson. I'm a new postgraduate student from Canada, and I've booked Room 402 in Block B.\nReceptionist: Welcome, Emily! Let me check the database... Yes, here is your file. Room 402 is on the fourth floor. The elevator is just behind the main lobby staircase.\nStudent: Great! Is breakfast included in the accommodation fee?\nReceptionist: Breakfast is served daily from 7:00 to 9:30 AM in the cafeteria, but it requires a dining card. You can pick up your dining pass tomorrow morning from the bursar's office in Block A.\nStudent: Understood. What about laundry facilities?\nReceptionist: The laundry room is in the basement of Block B. It is open twenty-four hours a day, and you use your room key card to enter.",
      questions: [
        {
          id: 31,
          section: "listening",
          cefr: "A1",
          skill: "Listening for specific detail (Name & Country)",
          text: "Where is Emily Watson originally from?",
          options: { A: "Australia", B: "Canada", C: "The United Kingdom", D: "The United States" },
          correct: "B"
        },
        {
          id: 32,
          section: "listening",
          cefr: "A1",
          skill: "Listening for numbers & locations",
          text: "Which room has Emily booked?",
          options: { A: "Room 204 in Block A", B: "Room 402 in Block B", C: "Room 420 in Block C", D: "Room 402 in Block A" },
          correct: "B"
        },
        {
          id: 33,
          section: "listening",
          cefr: "A2",
          skill: "Listening for daily routines & time",
          text: "What time does breakfast conclude in the cafeteria?",
          options: { A: "8:30 AM", B: "9:00 AM", C: "9:30 AM", D: "10:00 AM" },
          correct: "C"
        },
        {
          id: 34,
          section: "listening",
          cefr: "A2",
          skill: "Listening for administrative instructions",
          text: "Where can Emily collect her dining card?",
          options: { A: "From the bursar's office in Block A", B: "Directly from the cafeteria kitchen", C: "At the main security gate", D: "In the basement laundry" },
          correct: "A"
        },
        {
          id: 35,
          section: "listening",
          cefr: "A2",
          skill: "Listening for facility regulations",
          text: "How do students access the basement laundry facilities?",
          options: { A: "By purchasing coins", B: "With their room key card", C: "By registering with security daily", D: "Only with the receptionist's key" },
          correct: "B"
        }
      ]
    },
    {
      id: 2,
      title: "Audio Track 2: Academic Project Discussion (CEFR B1 - B2)",
      level: "B1 - B2",
      description: "A meeting between a professor and a master's student discussing research design.",
      transcript: "Professor: Come in, Julian. Let's take a look at your master's thesis proposal on renewable energy storage in urban centers.\nJulian: Thank you, Professor Evans. I wanted to focus primarily on lithium-ion batteries versus hydrogen fuel cells for municipal bus transit.\nProfessor: That is an intriguing angle, Julian, but you must be careful not to make the scope too vast. Analyzing both technologies across three distinct European metropolitan areas will require far more primary empirical data than a six-month timeline allows.\nJulian: I see. Would you recommend narrowing the investigation to just one metropolitan transit system?\nProfessor: Precisely. If you restrict your primary case study to Stockholm's public transit network, you will have access to verified telemetry data already compiled by their transport agency. That ensures statistical validity without overextending your resources.\nJulian: That makes complete sense. Should I also include a comparative life-cycle cost analysis?\nProfessor: Yes, that would significantly bolster your analytical depth, provided you incorporate maintenance overheads alongside initial capital investments.",
      questions: [
        {
          id: 36,
          section: "listening",
          cefr: "B1",
          skill: "Gist & Academic Topic Recognition",
          text: "What is the primary subject of Julian's proposed master's thesis?",
          options: { A: "Solar panel manufacturing costs", B: "Renewable energy storage in municipal transport", C: "Traffic congestion in European cities", D: "Hydroelectric energy grid development" },
          correct: "B"
        },
        {
          id: 37,
          section: "listening",
          cefr: "B1",
          skill: "Identifying Academic Constraints & Advice",
          text: "Why does Professor Evans advise Julian to narrow down his research proposal?",
          options: { A: "The laboratory equipment is unavailable", B: "The six-month timeline is too short for a vast comparative scope", C: "The topic has already been exhaustively researched", D: "Funding for hydrogen vehicles has been withdrawn" },
          correct: "B"
        },
        {
          id: 38,
          section: "listening",
          cefr: "B2",
          skill: "Recognizing Specific Academic Solutions",
          text: "Which city does the professor recommend focusing on for verified telemetry data?",
          options: { A: "Stockholm", B: "Copenhagen", C: "Amsterdam", D: "Berlin" },
          correct: "A"
        },
        {
          id: 39,
          section: "listening",
          cefr: "B2",
          skill: "Inference & Academic Method",
          text: "What benefit does focusing on a single city's public transport offer Julian?",
          options: { A: "Cheaper travel fares for his team", B: "Access to verified telemetry data and statistical validity", C: "Automatic publication in an academic journal", D: "Exemption from the oral presentation" },
          correct: "B"
        },
        {
          id: 40,
          section: "listening",
          cefr: "B2",
          skill: "Understanding Conditions & Evaluative Criteria",
          text: "Under what condition does the professor endorse a life-cycle cost analysis?",
          options: { A: "If Julian compares three different decades", B: "If he incorporates maintenance overheads alongside capital costs", C: "If private automotive companies sponsor the project", D: "If it replaces the environmental section entirely" },
          correct: "B"
        }
      ]
    },
    {
      id: 3,
      title: "Audio Track 3: Expert Academic Lecture (CEFR C1 - C2)",
      level: "C1 - C2",
      description: "An extract from an environmental economics symposium on algorithmic resource allocation.",
      transcript: "Distinguished colleagues, when we scrutinize the intersection of predictive algorithms and ecological stewardship, we encounter a profound paradox. Proponents contend that machine-learning frameworks optimize water conservation and grid distribution with unparalleled precision. While empirical gains in infrastructural efficiency are irrefutable, such models frequently obscure underlying socio-economic disparities. Algorithmic governance inherently prioritizes quantifiable economic returns over marginalized community resilience. Consequently, vulnerable demographics are disproportionately subjected to algorithmic rationing during resource scarcity. We must therefore recalibrate our evaluation metrics: true algorithmic efficacy cannot merely be quantified by marginal efficiency gains; it must fundamentally incorporate equitable distribution and democratic oversight into its foundational architecture.",
      questions: [
        {
          id: 41,
          section: "listening",
          cefr: "C1",
          skill: "Synthesizing Abstract Academic Arguments",
          text: "What fundamental paradox does the lecturer identify regarding predictive algorithms in ecology?",
          options: { A: "They increase energy consumption while attempting to save power", B: "They optimize efficiency while potentially obscuring socio-economic disparities", C: "They are too expensive for developed nations to adopt", D: "They rely completely on obsolete meteorological records" },
          correct: "B"
        },
        {
          id: 42,
          section: "listening",
          cefr: "C1",
          skill: "Inferring Speaker Stance & Critique",
          text: "What does the speaker criticize about algorithmic governance frameworks?",
          options: { A: "Their computational speed is inadequate", B: "They prioritize quantifiable financial metrics over community resilience", C: "They refuse to incorporate renewable energy sources", D: "They are strictly controlled by municipal unions" },
          correct: "B"
        },
        {
          id: 43,
          section: "listening",
          cefr: "C2",
          skill: "Discerning Nuanced Consequences",
          text: "What occurs to vulnerable demographic groups during periods of resource scarcity under such models?",
          options: { A: "They receive government subsidies automatically", B: "They are disproportionately subjected to algorithmic rationing", C: "They are migrated to metropolitan centers", D: "Their water quality standards improve" },
          correct: "B"
        },
        {
          id: 44,
          section: "listening",
          cefr: "C2",
          skill: "Understanding Advanced Evaluative Propositions",
          text: "How does the speaker argue true algorithmic efficacy must be redefined?",
          options: { A: "By eliminating human oversight entirely", B: "By incorporating equitable distribution and democratic oversight into the architecture", C: "By maximizing corporate profitability across municipal grids", D: "By restricting algorithmic usage to laboratory simulations" },
          correct: "B"
        },
        {
          id: 45,
          section: "listening",
          cefr: "C2",
          skill: "Complex Tone & Rhetorical Analysis",
          text: "Which phrase best characterizes the lecturer's overarching tone and approach?",
          options: { A: "Critically analytical and reform-oriented", B: "Wholly dismissive of technological innovation", C: "Unconditionally optimistic about automated systems", D: "Indifferent toward societal equity" },
          correct: "A"
        }
      ]
    }
  ],

  // Section 3: Writing (Tasks 1 & 2)
  writingTasks: [
    {
      id: "W1",
      section: "writing",
      cefrTarget: "A2 - B1",
      title: "Writing Task 1: Semi-Formal Functional Communication",
      wordCountRange: "60 - 90 words",
      timeRecommended: "10 minutes",
      prompt: "You are planning to take an intensive academic English preparation course next term. Write an email to the Admissions Director at the Language Institute.\n\nIn your email:\n• Explain who you are and why you want to take the course.\n• Ask about course dates, schedule, and placement requirements.\n• Inquire about accommodation assistance for international students.",
      guidance: "Write between 60 and 90 words. Use appropriate semi-formal greetings, polite inquiry structures, and coherent paragraphing."
    },
    {
      id: "W2",
      section: "writing",
      cefrTarget: "B2 - C2",
      title: "Writing Task 2: Academic Discursive Essay",
      wordCountRange: "150 - 220 words",
      timeRecommended: "20 minutes",
      prompt: "Some education analysts argue that Artificial Intelligence (AI) and automated learning platforms will completely replace traditional classroom teachers in university education within the next two decades. Others contend that human mentorship and classroom interaction remain irreplaceable.\n\nDiscuss both views and give your own reasoned opinion, supporting your position with relevant examples.",
      guidance: "Write between 150 and 220 words. Structure your essay with an academic introduction, balanced analytical paragraphs, and a clear, well-supported conclusion."
    }
  ],

  // Section 4: Speaking (Prompts 1, 2, & 3)
  speakingPrompts: [
    {
      id: "S1",
      section: "speaking",
      cefrTarget: "A1 - A2",
      title: "Speaking Part 1: Personal Background & Daily Routine",
      prepTimeSeconds: 15,
      maxRecordingSeconds: 45,
      prompt: "Please introduce yourself briefly. Talk about where you live, what you do (your studies or work), and how you like to spend your free time on weekends."
    },
    {
      id: "S2",
      section: "speaking",
      cefrTarget: "B1 - B2",
      title: "Speaking Part 2: Narrative & Personal Experience",
      prepTimeSeconds: 30,
      maxRecordingSeconds: 90,
      prompt: "Describe an important challenge or difficult project you had to overcome in your academic life or career.\n\nYou should state:\n• What the challenge was\n• What steps you took to solve it\n• What skills you learned from this experience"
    },
    {
      id: "S3",
      section: "speaking",
      cefrTarget: "C1 - C2",
      title: "Speaking Part 3: Abstract Discourse & Critical Debate",
      prepTimeSeconds: 30,
      maxRecordingSeconds: 120,
      prompt: "To what extent does globalization threaten cultural diversity and indigenous languages, or does modern digital connectivity actually empower smaller cultures to preserve their heritage? Present a critical, balanced argument."
    }
  ]
};

// CBM Scoring Rules for objective questions
const CBM_SCORING_RULES = {
  correctSure: 2,
  correctNotSure: 1,
  incorrectNotSure: 0,
  incorrectSure: -2,
  unanswered: 0
};

// Map score to CEFR level & IELTS Band
function computeCefrAndIeltsPlacement(totalScore, maxScore) {
  const percentage = (totalScore / maxScore) * 100;

  if (percentage >= 88) {
    return { cefr: "C2", name: "Proficiency / Mastery", ieltsBand: "8.5 - 9.0", course: "C2 Mastery & Band 8.5+ Advanced Strategy" };
  } else if (percentage >= 74) {
    return { cefr: "C1", name: "Effective Operational Proficiency (Advanced)", ieltsBand: "7.0 - 8.0", course: "IELTS Intensive Academic Prep (Targeting Band 7.5 - 8.0)" };
  } else if (percentage >= 58) {
    return { cefr: "B2", name: "Vantage (Upper Intermediate)", ieltsBand: "5.5 - 6.5", course: "IELTS Comprehensive Preparation & Academic Skills (B2+)" };
  } else if (percentage >= 42) {
    return { cefr: "B1", name: "Threshold (Intermediate)", ieltsBand: "4.5 - 5.0", course: "Bridge to IELTS & Intermediate Fluency Development" };
  } else if (percentage >= 25) {
    return { cefr: "A2", name: "Waystage (Elementary)", ieltsBand: "3.5 - 4.0", course: "General English Foundation (A2 Pre-Intermediate)" };
  } else {
    return { cefr: "A1", name: "Breakthrough (Beginner)", ieltsBand: "Under 3.5", course: "Basic English Starter & Core Grammar Foundation" };
  }
}
