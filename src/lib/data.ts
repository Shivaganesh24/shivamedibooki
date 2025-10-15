export const healthTips = [
  {
    question: "How much water should I drink daily?",
    answer: "The common recommendation is to drink eight 8-ounce glasses, which equals about 2 liters, or half a gallon. This is called the 8×8 rule and is easy to remember. However, needs can vary based on activity level, climate, and overall health."
  },
  {
    question: "What are the benefits of regular exercise?",
    answer: "Regular physical activity can improve your muscle strength and boost your endurance. Exercise delivers oxygen and nutrients to your tissues and helps your cardiovascular system work more efficiently. And when your heart and lung health improve, you have more energy to tackle daily chores."
  },
  {
    question: "How much sleep do I need?",
    answer: "Most adults need 7 to 9 hours of sleep per night. Children and teens need more. The right amount of sleep helps you feel rested and ready for the day. It's crucial for mental and physical health, quality of life, and safety."
  },
  {
    question: "Is it important to eat breakfast?",
    answer: "Breakfast is often called 'the most important meal of the day', and for good reason. As the name suggests, breakfast breaks the overnight fasting period. It replenishes your supply of glucose to boost your energy levels and alertness, while also providing other essential nutrients required for good health."
  },
  {
    question: "What is a balanced diet?",
    answer: "A balanced diet is a diet that contains differing kinds of foods in certain quantities and proportions so that the requirement for calories, proteins, minerals, vitamins and alternative nutrients is adequate and a small provision is reserved for additional nutrients to endure the short length of leanness."
  }
];

export const quizQuestions = [
  {
    question: "Which of the following is a primary source of Vitamin D?",
    options: ["Sunlight", "Oranges", "Spinach", "Chicken"],
    correctAnswer: "Sunlight",
    explanation: "The body produces Vitamin D when skin is directly exposed to the sun. That's why it's often called the 'sunshine vitamin'."
  },
  {
    question: "How many minutes of moderate aerobic activity is recommended per week for adults?",
    options: ["30 minutes", "90 minutes", "150 minutes", "240 minutes"],
    correctAnswer: "150 minutes",
    explanation: "For substantial health benefits, adults should do at least 150 minutes (2 hours and 30 minutes) a week of moderate-intensity aerobic activity."
  },
  {
    question: "Which food is the best source of omega-3 fatty acids?",
    options: ["Beef", "Apples", "Salmon", "Bread"],
    correctAnswer: "Salmon",
    explanation: "Fatty fish like salmon, mackerel, and herring are excellent sources of omega-3 fatty acids, which are crucial for brain health."
  },
  {
    question: "What does 'REM' stand for in the context of sleep?",
    options: ["Rapid Energy Movement", "Restful Easy Moments", "Rapid Eye Movement", "Rest, Energize, Motivate"],
    correctAnswer: "Rapid Eye Movement",
    explanation: "REM sleep is a stage of sleep characterized by the rapid and random movement of the eyes. It is the stage where most dreaming occurs."
  },
  {
    question: "Dehydration occurs when your body loses more ______ than it takes in.",
    options: ["Salt", "Fluid", "Sugar", "Calories"],
    correctAnswer: "Fluid",
    explanation: "Dehydration happens when your body doesn't have as much water as it needs. Without enough, your body can't function properly."
  }
];

export const doctors = [
    { id: "1", name: "Dr. Emily Carter", specialty: "Cardiologist", imageId: "doctor-1" },
    { id: "2", name: "Dr. Ben Adams", specialty: "Dermatologist", imageId: "doctor-2" },
    { id: "3", name: "Dr. Chloe Davis", specialty: "Neurologist", imageId: "doctor-3" },
    { id: "4", name: "Dr. Olivia White", specialty: "General Practitioner", imageId: "doctor-4" },
];

export const userActivity = [
  {
    id: "ACT-001",
    user: "John Doe",
    action: "Smart Triage",
    status: "Completed",
    date: "2023-10-26"
  },
  {
    id: "ACT-002",
    user: "Jane Smith",
    action: "Book Appointment",
    status: "Completed",
    date: "2023-10-25"
  },
  {
    id: "ACT-003",
    user: "Peter Jones",
    action: "Report Reader",
    status: "In Progress",
    date: "2023-10-25"
  },
  {
    id: "ACT-004",
    user: "Mary Williams",
    action: "Health Quiz",
    status: "Completed",
    date: "2023-10-24"
  },
  {
    id: "ACT-005",
    user: "John Doe",
    action: "Report Reader",
    status: "Failed",
    date: "2023-10-23"
  },
  {
    id: "ACT-006",
    user: "David Brown",
    action: "Smart Triage",
    status: "Completed",
    date: "2023-10-22"
  },
    {
    id: "ACT-007",
    user: "Jane Smith",
    action: "Health Quiz",
    status: "Completed",
    date: "2023-10-21"
  }
];

export const triageDoctorMapping: { [key: string]: string[] } = {
  "Dermatology": ["Dermatologist"],
  "Cardiology": ["Cardiologist"],
  "Neurology": ["Neurologist"],
  "Gastroenterology": ["Gastroenterologist"],
  "Orthopedics": ["Orthopedist"],
  "Endocrinology": ["Endocrinologist"],
  "Pulmonology": ["Pulmonologist"],
  "General": ["General Practitioner"],
};
