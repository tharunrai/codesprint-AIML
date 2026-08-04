import { NextRequest, NextResponse } from "next/server";

type AiAction = "resume-analyze" | "company-research" | "prep-coach";

interface AiRequest {
  action: AiAction;
  resumeText?: string;
  targetRole?: string;
  companyName?: string;
  role?: string;
  roundType?: string;
  company?: string;
}

function generateResumeAnalysis(resumeText: string, targetRole: string) {
  const wordCount = resumeText.split(/\s+/).length;
  const hasQuantifiableResults = /\d+%|\d+ /.test(resumeText);
  const hasActionVerbs = /built|developed|designed|implemented|led|created|managed|optimized|increased|reduced/i.test(resumeText);
  const hasSkillsSection = /skills|technologies|tech stack/i.test(resumeText);
  const hasEducation = /education|university|college|degree|b\.tech|m\.tech/i.test(resumeText);
  const hasProjects = /project|portfolio/i.test(resumeText);

  let score = 45;
  if (wordCount > 150) score += 10;
  if (wordCount > 300) score += 5;
  if (hasQuantifiableResults) score += 12;
  if (hasActionVerbs) score += 10;
  if (hasSkillsSection) score += 8;
  if (hasEducation) score += 5;
  if (hasProjects) score += 5;
  score = Math.min(score, 98);

  return {
    score,
    summary: `Your resume has been analyzed for the **${targetRole}** role. Here's a detailed breakdown of strengths and areas for improvement.`,
    sections: [
      {
        title: "📊 ATS Compatibility",
        score: Math.min(score + 5, 100),
        feedback: hasSkillsSection
          ? "Good — your resume contains a clearly labeled skills section that ATS systems can parse."
          : "⚠️ Missing a dedicated **Skills** or **Technologies** section. ATS systems rely heavily on this for keyword matching.",
        suggestions: [
          "Use standard section headings (Experience, Education, Skills, Projects)",
          "Avoid tables, columns, or graphics that ATS parsers struggle with",
          "Include keywords from the job description verbatim",
        ],
      },
      {
        title: "💪 Impact & Metrics",
        score: hasQuantifiableResults ? 82 : 40,
        feedback: hasQuantifiableResults
          ? "You include some quantifiable results — great! Recruiters love numbers."
          : "⚠️ Your bullet points lack measurable outcomes. Quantify your impact wherever possible.",
        suggestions: [
          'Replace "Improved performance" → "Improved API response time by 40%"',
          'Replace "Worked on a team project" → "Led a 4-person team to deliver a feature used by 10,000+ users"',
          "Add metrics: users impacted, time saved, revenue generated, error rates reduced",
        ],
      },
      {
        title: "✍️ Action Verbs & Writing",
        score: hasActionVerbs ? 78 : 35,
        feedback: hasActionVerbs
          ? "Good use of strong action verbs. Keep each bullet concise and results-oriented."
          : "⚠️ Use powerful action verbs to start each bullet point instead of passive voice.",
        suggestions: [
          "Start bullets with: Built, Designed, Implemented, Optimized, Automated",
          "Avoid: Responsible for, Helped with, Worked on, Assisted in",
          "Keep bullet points to 1-2 lines maximum",
        ],
      },
      {
        title: "🎯 Role Alignment",
        score: score - 5,
        feedback: `Based on the **${targetRole}** role, here are the key skills typically expected.`,
        suggestions: [
          `Highlight proficiency in frameworks commonly used for ${targetRole} roles`,
          "Add relevant project experience demonstrating problem-solving",
          "Include certifications or coursework directly related to this role",
          "Tailor your summary/objective to mention this specific role",
        ],
      },
    ],
    topStrengths: [
      hasEducation ? "Educational background is clearly documented" : "Resume structure is readable",
      hasProjects ? "Project experience demonstrates hands-on skills" : "Content shows relevant experience",
      wordCount > 200 ? "Good level of detail in descriptions" : "Concise and focused content",
    ],
    criticalFixes: [
      !hasSkillsSection ? "Add a dedicated Technical Skills section" : null,
      !hasQuantifiableResults ? "Add numbers and metrics to at least 3 bullet points" : null,
      !hasActionVerbs ? "Replace weak verbs with strong action verbs" : null,
      wordCount < 100 ? "Resume is too short — aim for 400-600 words" : null,
    ].filter(Boolean),
  };
}

function generateCompanyResearch(companyName: string, role: string) {
  const companyData: Record<string, { overview: string; techStack: string[]; culture: string; interviewProcess: string; recentNews: string[]; salaryRange: string; tips: string[] }> = {
    google: {
      overview: "Google (Alphabet Inc.) is a multinational technology company specializing in search, cloud computing, advertising, and AI/ML. Founded in 1998, it's one of the world's most valuable companies.",
      techStack: ["Python", "Go", "Java", "C++", "TensorFlow", "Kubernetes", "GCP", "Protocol Buffers"],
      culture: "Engineering-driven culture with emphasis on innovation, data-driven decisions, and 20% time for personal projects. Flat organizational structure with rigorous hiring bar.",
      interviewProcess: "5-6 rounds: Phone Screen → Online Assessment → 4-5 Onsite Technical Interviews (Coding + System Design + Behavioral).",
      recentNews: ["Launched Gemini AI model family", "Expanded Google Cloud AI services", "Investing in quantum computing research"],
      salaryRange: "₹12-45 LPA for entry-level SDE roles in India",
      tips: ["Practice LeetCode medium/hard problems", "Study system design", "Prepare STAR format behavioral answers", "Understand Google's leadership principles"],
    },
    microsoft: {
      overview: "Microsoft is a global technology leader in cloud computing (Azure), productivity software (Office 365), gaming (Xbox), and AI.",
      techStack: ["C#", ".NET", "TypeScript", "Azure", "Python", "React", "SQL Server", "Cosmos DB"],
      culture: "Growth mindset culture championed by CEO Satya Nadella. Strong work-life balance and inclusive environment.",
      interviewProcess: "4-5 rounds: OA → Phone Screen → 3-4 Onsite (Coding + Design + Behavioral + Hiring Manager).",
      recentNews: ["Major investment in OpenAI partnership", "Azure revenue growing 30%+ YoY", "Copilot AI integration across products"],
      salaryRange: "₹15-42 LPA for SDE roles in India",
      tips: ["Focus on clean, production-quality code", "Understand Azure cloud basics", "Show growth mindset in behavioral rounds"],
    },
    razorpay: {
      overview: "Razorpay is India's leading full-stack financial solutions company, powering businesses with payments, banking, lending and insurance.",
      techStack: ["Go", "Ruby on Rails", "React", "PostgreSQL", "Redis", "Kubernetes", "AWS"],
      culture: "Fast-paced fintech culture, strong engineering team. Known for solving complex payment infrastructure challenges at scale.",
      interviewProcess: "3-4 rounds: OA → 2 Technical Rounds (DSA + System Design) → HR/Culture Fit.",
      recentNews: ["Expanded RazorpayX business banking platform", "Processed record transactions", "Growing merchant base rapidly"],
      salaryRange: "₹18-35 LPA for SDE roles",
      tips: ["Understand payment systems basics", "Practice medium-difficulty DSA", "Know about distributed systems"],
    },
    deloitte: {
      overview: "Deloitte is one of the Big Four professional services firms, offering consulting, audit, tax, and technology services globally.",
      techStack: ["Java", "Spring Boot", "Angular", "AWS", "Salesforce", "SAP", "Python", "Power BI"],
      culture: "Professional consulting culture with structured career paths. Strong emphasis on client service, teamwork, and continuous learning.",
      interviewProcess: "3-4 rounds: Aptitude Test → Group Discussion → Technical Interview → HR Interview.",
      recentNews: ["Expanding AI consulting practice", "Major digital transformation projects", "Growing cloud advisory services"],
      salaryRange: "₹6-15 LPA for entry-level consultant roles",
      tips: ["Prepare for case study questions", "Practice group discussion skills", "Know about current technology trends"],
    },
  };

  const normalizedName = companyName.toLowerCase().trim();
  const data = companyData[normalizedName];

  if (data) {
    return { companyName, role: role || "Software Engineer", ...data };
  }

  return {
    companyName,
    role: role || "Software Engineer",
    overview: `${companyName} is a technology company that participates in campus recruitment. Research their website and Glassdoor for more details.`,
    techStack: ["JavaScript/TypeScript", "Python", "Java", "React", "Node.js", "Cloud Services"],
    culture: `Research ${companyName}'s values on their careers page and check Glassdoor reviews for employee perspectives.`,
    interviewProcess: "Typical campus hiring: OA → Technical Interview(s) → HR Round. Check GeeksforGeeks for company-specific patterns.",
    recentNews: [`Visit ${companyName}'s blog for recent developments`, "Check LinkedIn for latest updates"],
    salaryRange: "Varies — check Glassdoor and AmbitionBox",
    tips: ["Research core products", "Prepare questions about the team", "Practice coding problems tagged with this company", "Connect with alumni"],
  };
}

function generatePrepCoach(roundType: string, company: string) {
  const roundData: Record<string, { title: string; description: string; topics: { name: string; priority: string; description: string }[]; questionTypes: string[]; resources: { name: string; url: string; description: string }[]; proTips: string[] }> = {
    oa: {
      title: "Online Assessment (OA)",
      description: "Tests coding skills, logical reasoning, and aptitude. Usually 60-90 minutes for 2-3 coding problems.",
      topics: [
        { name: "Arrays & Strings", priority: "High", description: "Two pointers, sliding window, prefix sums" },
        { name: "Dynamic Programming", priority: "High", description: "1D/2D DP, knapsack variants, LCS, LIS" },
        { name: "Graphs & Trees", priority: "Medium", description: "BFS, DFS, shortest path, tree traversals" },
        { name: "Sorting & Searching", priority: "Medium", description: "Binary search variants, merge sort applications" },
        { name: "Stack & Queue", priority: "Medium", description: "Monotonic stack, next greater element" },
      ],
      questionTypes: ["Implementation-heavy problems", "Optimization (brute force → optimal)", "Pattern recognition", "Edge case handling"],
      resources: [
        { name: "LeetCode", url: "https://leetcode.com", description: "Practice medium/hard problems by company tag" },
        { name: "NeetCode 150", url: "https://neetcode.io", description: "Curated must-do problems with video explanations" },
        { name: "Codeforces", url: "https://codeforces.com", description: "Competitive programming for speed improvement" },
      ],
      proTips: [
        "Read ALL problems before starting — solve the easiest first",
        "Always handle edge cases: empty arrays, single elements, large inputs",
        "Test mentally with given examples before submitting",
        "If stuck for >10 minutes, move on and come back",
        company ? `Check LeetCode's ${company} tag for common problems` : "Practice company-tagged problems on LeetCode",
      ],
    },
    technical: {
      title: "Technical Interview",
      description: "1-on-1 or panel (45-60 min) solving coding problems live with approach explanation and complexity discussion.",
      topics: [
        { name: "Data Structures", priority: "High", description: "Hash maps, trees, heaps, graphs, tries" },
        { name: "Algorithms", priority: "High", description: "Sorting, searching, graph algorithms, greedy" },
        { name: "System Design Basics", priority: "Medium", description: "API design, database schema, caching" },
        { name: "OOP Concepts", priority: "Medium", description: "SOLID principles, design patterns" },
        { name: "OS & Networking", priority: "Low", description: "Process vs thread, TCP/UDP, HTTP methods" },
      ],
      questionTypes: ["Live coding with explanation", "Whiteboard problem solving", "Code review and optimization", "Complexity analysis"],
      resources: [
        { name: "Cracking the Coding Interview", url: "#", description: "Gold standard interview prep book" },
        { name: "Educative.io", url: "https://educative.io", description: "Grokking the Coding Interview" },
        { name: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", description: "Free system design guide" },
      ],
      proTips: [
        "Think out loud — interviewers want to see your thought process",
        "Start with brute force, then optimize",
        "Ask clarifying questions before coding",
        "Discuss time/space complexity proactively",
        "Write clean, modular code with meaningful variable names",
      ],
    },
    hr: {
      title: "HR / Behavioral Interview",
      description: "30-45 minute interview focused on personality, communication, cultural fit, and career goals.",
      topics: [
        { name: "STAR Method", priority: "High", description: "Situation, Task, Action, Result — structure every answer" },
        { name: "Leadership Examples", priority: "High", description: "Times you led, resolved conflict, took initiative" },
        { name: "Failure & Learning", priority: "Medium", description: "Discuss setbacks honestly and lessons learned" },
        { name: "Company Knowledge", priority: "Medium", description: "Why this company? What do you know about them?" },
      ],
      questionTypes: [
        '"Tell me about yourself"',
        '"Describe a challenging project"',
        '"Why do you want to work here?"',
        '"What are your strengths and weaknesses?"',
        '"Do you have questions for us?"',
      ],
      resources: [
        { name: "Glassdoor Reviews", url: "https://glassdoor.com", description: "Company-specific interview questions" },
        { name: "Amazon LP Guide", url: "#", description: "Framework for behavioral answers" },
      ],
      proTips: [
        "Prepare 5-6 STAR stories that adapt to different questions",
        "Research the company's mission, values, and recent news",
        "Be genuine — HR detects rehearsed answers",
        "Have 2-3 thoughtful questions for the interviewer",
        company ? `Research ${company}'s specific values and culture` : "Align answers with the company's values",
      ],
    },
    "system-design": {
      title: "System Design Interview",
      description: "45-60 minute interview designing a large-scale system. Focus on architecture, trade-offs, scalability.",
      topics: [
        { name: "Scalability", priority: "High", description: "Horizontal vs vertical scaling, sharding, replication, CDN" },
        { name: "Database Design", priority: "High", description: "SQL vs NoSQL, indexing, partitioning, CAP theorem" },
        { name: "API Design", priority: "Medium", description: "REST vs GraphQL, rate limiting, authentication" },
        { name: "Caching", priority: "Medium", description: "Redis, Memcached, cache invalidation strategies" },
        { name: "Message Queues", priority: "Low", description: "Kafka, RabbitMQ, event-driven architecture" },
      ],
      questionTypes: ["Design URL shortener", "Design Twitter feed", "Design a chat application", "Design notification system"],
      resources: [
        { name: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", description: "Comprehensive free resource" },
        { name: "ByteByteGo", url: "https://bytebytego.com", description: "Visual system design explanations" },
      ],
      proTips: [
        "Start with requirements clarification (functional + non-functional)",
        "Do back-of-the-envelope calculations for scale",
        "Draw high-level architecture first, then deep dive",
        "Discuss trade-offs explicitly — no single right answer",
        "Cover: API → Data model → High-level design → Deep dive → Bottlenecks",
      ],
    },
  };

  const normalizedRound = roundType.toLowerCase().replace(/\s+/g, "-");
  const data = roundData[normalizedRound] || roundData["technical"];

  return { company: company || "General", ...data };
}

export async function POST(request: NextRequest) {
  try {
    const body: AiRequest = await request.json();

    // Simulate AI processing delay
    await new Promise((r) => setTimeout(r, 800));

    switch (body.action) {
      case "resume-analyze": {
        if (!body.resumeText) {
          return NextResponse.json({ error: "Resume text is required" }, { status: 400 });
        }
        return NextResponse.json(generateResumeAnalysis(body.resumeText, body.targetRole || "Software Engineer"));
      }
      case "company-research": {
        if (!body.companyName) {
          return NextResponse.json({ error: "Company name is required" }, { status: 400 });
        }
        return NextResponse.json(generateCompanyResearch(body.companyName, body.role || "Software Engineer"));
      }
      case "prep-coach": {
        if (!body.roundType) {
          return NextResponse.json({ error: "Round type is required" }, { status: 400 });
        }
        return NextResponse.json(generatePrepCoach(body.roundType, body.company || ""));
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
