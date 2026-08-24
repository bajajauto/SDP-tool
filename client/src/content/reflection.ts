export interface ResponseGuideExample {
  weak: string;
  whyWeak: string;
  better: string;
  strong: string;
}

export interface ResponseGuide {
  label: string;
  question: string;
  bestTip?: string;
  examples: ResponseGuideExample[];
}

export const q1WordChips: string[] = [
  'Curious', 'Imaginative', 'Adventurous', 'Conventional', 'Practical', 'Routine-oriented',
  'Organised', 'Disciplined', 'Reliable', 'Spontaneous', 'Easy-going', 'Impulsive',
  'Outgoing', 'Energetic', 'Assertive', 'Reserved', 'Private', 'Self-contained',
  'Warm', 'Empathetic', 'Trusting', 'Blunt', 'Guarded', 'Calm', 'Resilient', 'Grounded',
  'Anxious', 'Hard on self',
];

export const primingPrompts: Record<number, string[]> = {
  2: [
    'What are the qualities you want to be consistent about, no matter the pressure or situation?',
    'What do you want people to say about you when you are not in the room?',
    'Think of someone you respect at work. What are some of their values you would want to emulate?',
    'When faced with difficult choices, what principles do you want to guide your decisions?',
  ],
  3: [
    'Think about the work where time flew and you felt fully engaged. What were you doing?',
    'What kind of work do you look forward to when you see it on your calendar?',
    'What is the kind of task you finish and still want to do more of?',
    'What kind of work would you do even if it was not in your job description?',
  ],
  4: [
    'Where did you feel most confident, effective, or at your best this year? What was it about those situations that allowed you to thrive?',
    'Think about times when you created value, solved a problem, supported someone, or influenced an outcome. What strengths were you drawing on in those moments?',
    'Think about the moments when others relied on you most. What did they see in you that made them turn to you?',
    'When were you able to contribute more than was expected of you, and what strengths or qualities made that possible?',
  ],
  5: [
    'Looking back on the past year, what situations make you feel you could have contributed more, taken greater ownership, spoken up, or handled things differently, and what do those experiences reveal about where you still have room to grow?',
    'Where did you wish you had more confidence, capability, or experience?',
    'Were there opportunities that came up where you felt you were not quite ready?',
    'Was there a new challenge or responsibility that came your way and you felt underprepared for it?',
  ],
};

export const q6Prompts: string[] = [
  'What are you doing differently?',
  'What are people relying on you for?',
  "What challenges are you taking on that you don't today?",
  'What have you learned, changed, or let go of along the way?',
];

export const responseGuides: Record<number, ResponseGuide> = {
  2: {
    label: 'Question 2',
    question: 'The qualities I want to be known for at work are...',
    bestTip: 'Best tip: Focus on the capability behind the performance.',
    examples: [
      {
        weak: 'Reliable, results-oriented, team player.',
        whyWeak: 'These describe what the role expects, not what matters personally to you.',
        better: 'Think of people you admire at work. What do you respect about them beyond performance? What behaviours do you wish people would associate with you?',
        strong: 'I want to be known as someone who speaks honestly even when conversations are difficult, and someone who does what they commit to without needing reminders.',
      },
      {
        weak: 'Collaborative and hardworking.',
        whyWeak: 'Everyone wants to be seen this way. It does not reveal anything unique.',
        better: 'Reflect on situations where you felt proud of how you handled something, not what you achieved. What quality were you displaying?',
        strong: 'I want to be known for staying calm during uncertainty and helping others think clearly when situations become stressful.',
      },
    ],
  },
  3: {
    label: 'Question 3',
    question: 'The work I genuinely enjoy doing is...',
    examples: [
      {
        weak: 'Problem solving, strategic work, cross-functional projects.',
        whyWeak: 'These are broad labels that sound impressive but do not tell us what actually energises you.',
        better: 'Think about the last time you were fully absorbed in work and lost track of time. What exactly were you doing? Not the project, the activity.',
        strong: 'I enjoy taking an ambiguous problem and breaking it into a structure that helps others understand what needs to happen next.',
      },
      {
        weak: 'High-impact projects.',
        whyWeak: 'Nobody prefers low-impact work. Think slightly deeper.',
        better: 'Ask: if no promotion or recognition was attached, what work would I still volunteer to do?',
        strong: 'I enjoy helping people understand complex ideas and seeing the moment when something finally clicks for them.',
      },
    ],
  },
  4: {
    label: 'Question 4',
    question: 'Looking back on the past year, what moments best reflect who you are at your best?',
    examples: [
      {
        weak: 'Successfully delivered Project X because of my technical knowledge.',
        whyWeak: 'Focuses on the outcome rather than the capability that created it.',
        better: 'Think about a moment where you added value. Then ask: what did I do that someone else might not have done?',
        strong: 'During a supplier discussion, I was able to understand different viewpoints and find common ground. I have noticed I often help people align when there are conflicting priorities.',
      },
      {
        weak: 'Managed stakeholders effectively.',
        whyWeak: 'Too generic. Everyone interprets this differently.',
        better: 'What specific behaviour helped you? Listening? Influencing? Simplifying complexity?',
        strong: 'When discussions became confusing, I was usually able to simplify the issue and help the group move toward a decision.',
      },
    ],
  },
  5: {
    label: 'Question 5',
    question: 'Looking back on the past year, what moments best reflect where you still have room to grow?',
    bestTip: 'Best tip: This is the most important question in the SDP.',
    examples: [
      {
        weak: 'Need better time management.',
        whyWeak: 'Often a socially acceptable answer that avoids the real issue.',
        better: 'Ask "Why?" three times. What actually caused the delay?',
        strong: 'I delayed escalating a risk because I felt I should first have a solution ready. My discomfort with uncertainty created more delay than the problem itself.',
      },
      {
        weak: 'Need to be more proactive.',
        whyWeak: '"Proactive" usually describes the symptom, not the cause.',
        better: 'Think about a situation where you knew what should be done but did not do it. What stopped you?',
        strong: 'There were situations where I disagreed with a decision but stayed silent because I was not fully confident in my perspective.',
      },
      {
        weak: 'Need to improve communication.',
        whyWeak: 'Communication is rarely the root cause.',
        better: 'Was it confidence? Conflict avoidance? Fear of criticism? Lack of clarity?',
        strong: 'I avoided difficult conversations because I was worried about damaging relationships, even when the feedback would have helped the other person.',
      },
    ],
  },
  6: {
    label: 'Question 6',
    question: 'Describe the version of yourself that you want to become in the next 3 years.',
    examples: [
      {
        weak: 'Senior manager with greater responsibilities.',
        whyWeak: 'Describes a position, not a person.',
        better: 'Forget titles. What capabilities, behaviours or mindsets will future you have that current you does not?',
        strong: 'I want to become someone who can confidently navigate ambiguity, make decisions with incomplete information, and help others stay focused during uncertainty.',
      },
      {
        weak: 'Subject matter expert in my field.',
        whyWeak: 'Focuses on status rather than development.',
        better: 'What would being an expert allow you to do differently?',
        strong: 'I want to become someone whom others trust for judgment, not just technical expertise.',
      },
      {
        weak: 'Leader managing a larger team.',
        whyWeak: 'Tells us nothing about how you want to lead.',
        better: 'Think about the kind of leader you want people to remember.',
        strong: 'I want to be someone who develops people around me and helps them grow more capable and confident through our interactions.',
      },
    ],
  },
};

export const lcfw = {
  pillars: [
    {
      key: 'will',
      name: 'Will',
      subtitle: 'Conviction, Integrity, Commitment',
      subs: [
        { name: 'Conviction', desc: 'Knowing what you stand for and holding it, even when the room disagrees.' },
        { name: 'Integrity', desc: 'The consistency of who you say you are and how you actually show up.' },
        { name: 'Commitment', desc: 'Caring enough to stay with something when it gets hard. Owning it, not just doing it.' },
      ],
    },
    {
      key: 'energy',
      name: 'Energy',
      subtitle: 'Passion, Inspiration, Entrepreneurial',
      subs: [
        { name: 'Passion', desc: 'An unquenchable enthusiasm to excel and achieve what you believe in.' },
        { name: 'Inspirational', desc: 'The ability to motivate and energise the people around you.' },
        { name: 'Entrepreneurial', desc: 'Overcoming constraints through unconventional solutions and resourcefulness.' },
      ],
    },
    {
      key: 'understanding',
      name: 'Understanding',
      subtitle: 'Intellect, Meticulousness, Laterality',
      subs: [
        { name: 'Intellect', desc: 'Not just what happened, but why. Going to the root cause, not the surface answer.' },
        { name: 'Meticulousness', desc: 'Showing up with the same care and thoroughness whether or not anyone is watching.' },
        { name: 'Laterality', desc: 'Seeing beyond your function. Connecting dots across domains, thinking wider than your brief.' },
      ],
    },
    {
      key: 'capability',
      name: 'Capability',
      subtitle: 'Capacity, Agility, Tenacity',
      subs: [
        { name: 'Capacity', desc: 'Growing into greater complexity and responsibility over time.' },
        { name: 'Agility', desc: 'Learning fast and adapting when things change around you.' },
        { name: 'Tenacity', desc: 'Staying with something when it gets hard. Persistence in the face of difficulty.' },
      ],
    },
  ],
};

export interface SampleGoal {
  domain: 'FUNCTIONAL' | 'BEHAVIOURAL' | 'LEADERSHIP';
  whatBuild: string;
  whyMatters: string;
  grownWhen: string;
  actionDo: string;
  actionLearn: string;
  actionConnect: string;
  support: string;
}

export const sampleGoals: Record<'FUNCTIONAL' | 'BEHAVIOURAL' | 'LEADERSHIP', SampleGoal> = {
  FUNCTIONAL: {
    domain: 'FUNCTIONAL',
    whatBuild: 'Get properly skilled at root-cause analysis (5-Why / fishbone) for quality deviations, instead of just fixing the symptom and moving on.',
    whyMatters: 'Right now when a deviation comes up, I patch it well enough to get the line running again, but the same issue resurfaces two or three weeks later because nobody actually traced it back to the real cause.',
    grownWhen: 'A deviation I investigate does not reappear in the next production cycle, and my corrective action notes hold up when QA reviews them.',
    actionDo: 'Apply 5-Why on every deviation I personally handle for the next quarter, even minor ones, and document it properly instead of just logging "resolved" in the handover sheet.',
    actionLearn: 'Sit with the quality engineer on one real investigation (not a training session) and watch how they push past the first answer to the actual root cause.',
    actionConnect: 'Ask the shift supervisor who has the best track record on closed-out deviations to walk me through two of their past investigation reports.',
    support: 'Relevant courses or certifications, and some time with a mentor who can help me with the same.',
  },
  BEHAVIOURAL: {
    domain: 'BEHAVIOURAL',
    whatBuild: 'Build confidence in speaking up early, especially when I see risks, gaps, or a different point of view.',
    whyMatters: 'There have been situations where I noticed a concern but waited too long to raise it because I wanted to be completely sure first. Silence can slow down decisions or prevent the team from seeing a risk in time.',
    grownWhen: 'In meetings or project discussions, I am able to respectfully raise concerns, ask clarifying questions, or offer a different perspective without overthinking whether my input is perfect.',
    actionDo: 'In key meetings, I will prepare one question, risk, or point of view in advance and make sure I contribute it during the discussion.',
    actionLearn: 'Read or complete short learning on difficult conversations, influencing without authority, and assertive communication.',
    actionConnect: 'Observe colleagues who challenge ideas constructively and ask them how they prepare for difficult conversations.',
    support: 'Opportunities to present updates or risks in team forums, even if the topic is small initially.',
  },
  LEADERSHIP: {
    domain: 'LEADERSHIP',
    whatBuild: 'Own the onboarding of new operators on my line end-to-end, instead of just answering their questions when they happen to ask.',
    whyMatters: 'New hires currently pick things up by trial and error and by bothering whoever is free, including me, but nobody actually owns getting them competent.',
    grownWhen: 'A new operator I have onboarded is running the line independently and correctly within two weeks, without needing to be walked through the same step twice.',
    actionDo: 'Build a simple one-page checklist of what a new operator needs to know in their first two weeks on this line, and personally walk the next new hire through it.',
    actionLearn: 'Look at how the changeover team structures their cross-training so new people get hands-on practice early instead of just shadowing.',
    actionConnect: 'Ask the trainer who runs new-hire induction what they have seen work and fail when operators try to onboard people informally on the floor.',
    support: 'Time with tenured employees and supervisors, and alignment on expectations, responsibilities, and how progress should be tracked.',
  },
};
