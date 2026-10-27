
"use client";

import { useEffect, useRef, useState } from "react";
import rules from "./rules.json";

type Rule = {
  question: string;
  answer: string;
};

type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
};

const chatbotRules: Rule[] = rules;

const greeting =
  "Hello! 👋 Welcome to DineDesk Restaurant. I'm your virtual assistant. Ask me about our menu, prices, opening hours, delivery, reservations, or payment methods.";

const fallback =
  "Sorry, I couldn't find an answer to that question. 😊 Try asking about our menu, burger prices, opening hours, delivery, reservations, or payment options.";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const aliases: Record<string, string[]> = {
  "What are your opening hours?": [
    "opening hours",
    "opening time",
    "closing time",
    "when do you open",
    "when do you close",
    "what time do you close",
    "restaurant timing",
    "restaurant hours",
    "are you open",
  ],

  "Where is your restaurant located?": [
    "location",
    "address",
    "where are you located",
    "where is dinedesk",
    "restaurant location",
    "where is the restaurant",
  ],

  "What food do you serve?": [
    "menu",
    "view menu",
    "show menu",
    "food menu",
    "what food do you have",
    "what do you serve",
    "what can i eat",
    "food items",
  ],

  "How much does a chicken burger cost?": [
    "chicken burger",
    "chicken burger price",
    "price of chicken burger",
    "cost of chicken burger",
  ],

  "How much does a beef burger cost?": [
    "beef burger",
    "beef burger price",
    "price of beef burger",
    "burger price",
    "cost of beef burger",
  ],

  "Do you have vegetarian food?": [
    "vegetarian",
    "vegetarian food",
    "veg food",
    "vegetarian options",
    "vegetable dishes",
  ],

  "Do you offer home delivery?": [
    "delivery",
    "home delivery",
    "do you deliver",
    "delivery available",
    "can you deliver",
    "delivery service",
  ],

  "How long does delivery take?": [
    "delivery time",
    "how long does delivery take",
    "how long for delivery",
    "when will my food arrive",
    "delivery duration",
    "delivery estimate",
  ],

  "Can I reserve a table?": [
    "reservation",
    "reserve a table",
    "reserve table",
    "book a table",
    "table booking",
    "booking",
  ],

  "What payment methods do you accept?": [
    "payment",
    "payment methods",
    "cash",
    "credit card",
    "debit card",
    "pay by card",
    "payment options",
  ],

  "Do you offer any discounts?": [
    "discount",
    "discounts",
    "offers",
    "special offer",
    "promotion",
    "any deals",
  ],

  "Do you offer takeaway?": [
    "takeaway",
    "takeout",
    "pickup",
    "pick up",
    "collect food",
  ],

  "How can I contact the restaurant?": [
    "contact",
    "phone",
    "phone number",
    "email",
    "contact details",
    "call you",
  ],

  "Do you have a kids' menu?": [
    "kids menu",
    "kids food",
    "children menu",
    "childrens menu",
    "food for kids",
    "mini burger",
  ],

  "Do you provide catering for events?": [
    "catering",
    "catering service",
    "event catering",
    "birthday party",
    "party catering",
    "catering for events",
  ],
};


function findAnswer(message: string): string {
  const input = normalize(message);

  if (!input) return fallback;

  // 1. Check exact questions from rules.json.
  const exactMatch = chatbotRules.find(
    (rule) => normalize(rule.question) === input
  );

  if (exactMatch) return exactMatch.answer;

  // 2. Identify the user's intention using related phrases.
  const has = (...phrases: string[]) =>
    phrases.some((phrase) => {
      const cleanPhrase = normalize(phrase);
      return (` ${input} `).includes(` ${cleanPhrase} `);
    });

  const getAnswer = (question: string) =>
    chatbotRules.find(
      (rule) => rule.question === question
    )?.answer ?? fallback;

  // OPENING HOURS
  if (
    has(
      "opening hours",
      "opening time",
      "restaurant hours",
      "timings",
      "when do you open",
      "what time do you open",
      "when do you close",
      "what time do you close",
      "are you open",
      "is dinedesk open",
      "open on sunday",
      "open on saturday",
      "open on weekends",
      "open on monday",
      "open on friday",
      "kitchen close",
      "kitchen closing",
      "closing time"
    )
  ) {
    if (has("kitchen")) {
      return "Our kitchen accepts orders until 10:30 PM every day.";
    }

    if (has("sunday", "saturday", "weekend")) {
      return "Yes! DineDesk is open on Saturdays and Sundays from 11:00 AM to 11:00 PM. Our kitchen accepts orders until 10:30 PM.";
    }

    if (has("when do you open", "what time do you open")) {
      return "DineDesk opens at 11:00 AM every day, including weekends.";
    }

    if (has("when do you close", "what time do you close")) {
      return "DineDesk closes at 11:00 PM every day. The kitchen accepts orders until 10:30 PM.";
    }

    return getAnswer("What are your opening hours?");
  }

  // LOCATION
  if (
    has(
      "location",
      "address",
      "where are you",
      "where is dinedesk",
      "where is the restaurant",
      "located"
    )
  ) {
    return getAnswer("Where is your restaurant located?");
  }

  // DELIVERY TIME — check before general delivery
  if (
    has(
      "delivery time",
      "how long does delivery",
      "how long for delivery",
      "when will my food arrive",
      "delivery duration",
      "delivery estimate",
      "time to deliver"
    )
  ) {
    return getAnswer("How long does delivery take?");
  }

  // DELIVERY AVAILABILITY
  if (
    has(
      "delivery",
      "deliver",
      "home delivery",
      "send food to my home"
    )
  ) {
    return getAnswer("Do you offer home delivery?");
  }

  // CHICKEN BURGER
  if (has("chicken burger")) {
    return getAnswer("How much does a chicken burger cost?");
  }

  // BEEF BURGER
  if (has("beef burger", "burger price")) {
    return getAnswer("How much does a beef burger cost?");
  }

  // VEGETARIAN FOOD
  if (
    has(
      "vegetarian",
      "veg food",
      "vegetable dishes",
      "meat free",
      "without meat"
    )
  ) {
    return getAnswer("Do you have vegetarian food?");
  }

  // KIDS MENU — before general menu
  if (
    has(
      "kids menu",
      "kids food",
      "children menu",
      "childrens menu",
      "food for kids"
    )
  ) {
    return getAnswer("Do you have a kids' menu?");
  }

  // GENERAL MENU
  if (
    has(
      "menu",
      "food",
      "dishes",
      "what do you serve",
      "what can i eat",
      "view menu",
      "show menu"
    )
  ) {
    return getAnswer("What food do you serve?");
  }

  // RESERVATIONS
  if (
    has(
      "reservation",
      "reserve",
      "book a table",
      "table booking",
      "booking"
    )
  ) {
    return getAnswer("Can I reserve a table?");
  }

  // PAYMENT METHODS
  if (
    has(
      "payment",
      "pay",
      "cash",
      "card",
      "credit card",
      "debit card"
    )
  ) {
    return getAnswer("What payment methods do you accept?");
  }

  // DISCOUNTS
  if (
    has(
      "discount",
      "offer",
      "promotion",
      "special deal",
      "any deals"
    )
  ) {
    return getAnswer("Do you offer any discounts?");
  }

  // TAKEAWAY
  if (
    has(
      "takeaway",
      "takeout",
      "pickup",
      "pick up",
      "collect my order"
    )
  ) {
    return getAnswer("Do you offer takeaway?");
  }

  // CONTACT
  if (
    has(
      "contact",
      "phone",
      "email",
      "call you",
      "phone number"
    )
  ) {
    return getAnswer("How can I contact the restaurant?");
  }

  // CATERING
  if (
    has(
      "catering",
      "birthday party",
      "event catering",
      "cater for events"
    )
  ) {
    return getAnswer("Do you provide catering for events?");
  }

  // 3. Unknown questions should not receive invented answers.
  return fallback;
}


const menuItems = [
  {
    emoji: "🍔",
    name: "Classic Beef Burger",
    description:
      "Juicy beef, fresh lettuce, cheese and our signature sauce.",
    price: "PKR 800",
    category: "BESTSELLER",
  },
  {
    emoji: "🍕",
    name: "Cheese Lovers Pizza",
    description:
      "A golden crust topped with rich cheese and Italian herbs.",
    price: "PKR 1,200",
    category: "CUSTOMER FAVOURITE",
  },
  {
    emoji: "🍝",
    name: "Creamy Pasta",
    description:
      "Creamy pasta with herbs and a delicious homemade sauce.",
    price: "PKR 750",
    category: "CHEF'S PICK",
  },
  {
    emoji: "🍟",
    name: "Loaded French Fries",
    description:
      "Crispy golden fries served with our special dip.",
    price: "PKR 400",
    category: "MUST TRY",
  },
  {
    emoji: "🥗",
    name: "Garden Fresh Salad",
    description:
      "Fresh vegetables tossed with a light, refreshing dressing.",
    price: "PKR 500",
    category: "FRESH & LIGHT",
  },
  {
    emoji: "🥪",
    name: "Chicken Sandwich",
    description:
      "Tender chicken, crunchy vegetables and creamy dressing.",
    price: "PKR 600",
    category: "QUICK BITE",
  },
];

const features = [
  {
    emoji: "🥬",
    title: "Fresh Ingredients",
    description:
      "Freshness and flavour are at the heart of every dish on our sample menu.",
  },
  {
    emoji: "👨‍🍳",
    title: "Made With Care",
    description:
      "Every recipe is designed to bring comforting, satisfying flavours to your table.",
  },
  {
    emoji: "❤️",
    title: "Made For You",
    description:
      "From quick bites to full meals, there's something for every craving.",
  },
];

const quickQuestions = [
  "View menu",
  "Opening hours",
  "Delivery",
  "Burger price",
  "Book a table",
  "Payment methods",
];

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: greeting,
    },
  ]);

  const nextIdRef = useRef(2);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatOpen) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [messages, chatOpen]);

  function submitQuestion(question: string) {
    const cleanQuestion = question.trim();

    if (!cleanQuestion) return;

    const answer = findAnswer(cleanQuestion);
    const id = nextIdRef.current;

    nextIdRef.current += 2;

    setMessages((previous) => [
      ...previous,
      {
        id,
        sender: "user",
        text: cleanQuestion,
      },
      {
        id: id + 1,
        sender: "bot",
        text: answer,
      },
    ]);

    setInput("");
  }

  function sendMessage() {
    submitQuestion(input);
  }

  function resetChat() {
    nextIdRef.current = 2;
    setMessages([
      {
        id: 1,
        sender: "bot",
        text: greeting,
      },
    ]);
    setInput("");
  }

  function openChat() {
    setChatOpen(true);
  }

  function closeChat() {
    setChatOpen(false);
  }

  return (
    <main className="min-h-screen bg-[#fffaf4] text-[#29251f]">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-orange-100 bg-[#fffaf4]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#home" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#a13d20] text-2xl">
              🍽️
            </span>

            <span>
              <span className="block text-xl font-black tracking-tight">
                DineDesk
                <span className="text-[#a13d20]">.</span>
              </span>

              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                Food · Family · Flavour
              </span>
            </span>
          </a>

          <div className="hidden items-center gap-8 text-sm font-medium text-stone-600 md:flex">
            <a href="#home" className="transition hover:text-[#a13d20]">
              Home
            </a>
            <a href="#menu" className="transition hover:text-[#a13d20]">
              Our Menu
            </a>
            <a href="#about" className="transition hover:text-[#a13d20]">
              About Us
            </a>
            <a href="#contact" className="transition hover:text-[#a13d20]">
              Contact
            </a>
          </div>

          <button
            type="button"
            onClick={openChat}
            className="rounded-full bg-[#a13d20] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#812e17]"
          >
            Ask us 💬
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section
        id="home"
        className="relative overflow-hidden bg-[#f5e8d8]"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:py-28">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#a13d20]">
              ✦ Good food, good mood
            </span>

            <h1 className="mt-7 max-w-xl text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              A little taste of{" "}
              <span className="font-serif italic text-[#a13d20]">
                happiness.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-stone-600 sm:text-lg">
              Great flavours, comforting classics, and something delicious
              for every craving. Pull up a chair and make yourself at home.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#menu"
                className="rounded-full bg-[#a13d20] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-900/10 transition hover:-translate-y-0.5 hover:bg-[#812e17]"
              >
                Explore Our Menu →
              </a>

              <button
                type="button"
                onClick={openChat}
                className="rounded-full border border-stone-300 bg-white/70 px-7 py-3.5 text-sm font-bold transition hover:border-[#a13d20] hover:text-[#a13d20]"
              >
                Chat With Us
              </button>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-stone-600">
              <span>✦ Fresh flavours</span>
              <span>✦ Comfort food</span>
              <span>✦ Made with care</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rounded-[3rem] bg-[#e7c8a6] opacity-50 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2.5rem] border-8 border-white/70 bg-[#f9dfbd] p-5 shadow-2xl sm:p-8">
              <div className="absolute right-6 top-6 text-4xl">✦</div>
              <div className="absolute bottom-8 left-5 text-3xl">✧</div>

              <div className="flex min-h-[330px] flex-col items-center justify-center text-center sm:min-h-[390px]">
                <div className="text-8xl sm:text-9xl">🍔</div>

                <div className="mt-5 rounded-full bg-white/80 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#a13d20]">
                  Your next favourite
                </div>

                <h2 className="mt-4 font-serif text-3xl font-bold sm:text-4xl">
                  Made to satisfy.
                </h2>

                <p className="mt-2 text-sm text-stone-600">
                  Discover a menu full of delicious possibilities.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white/80 p-4">
                <div>
                  <p className="text-sm font-bold">
                    Something delicious?
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    We&apos;re here to help.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openChat}
                  aria-label="Ask the restaurant chatbot"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#a13d20] text-xl text-white transition hover:scale-105"
                >
                  💬
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a13d20]">
            The DineDesk difference
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Simple ingredients. Happy moments.
          </h2>

          <p className="mt-4 leading-7 text-stone-500">
            We believe good food brings people together. Every detail on
            our sample restaurant site celebrates that idea.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-orange-100 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f8e9d9] text-3xl">
                {feature.emoji}
              </div>

              <h3 className="mt-5 text-lg font-bold">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-stone-500">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="bg-[#f5e8d8] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a13d20]">
                Straight from our kitchen
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Crowd favourites.
              </h2>

              <p className="mt-3 max-w-xl leading-7 text-stone-600">
                Explore our sample menu and find your next delicious pick.
              </p>
            </div>

            <button
              type="button"
              onClick={openChat}
              className="self-start rounded-full border border-[#d6b9a0] bg-white px-5 py-3 text-sm font-bold text-[#a13d20] transition hover:bg-[#a13d20] hover:text-white sm:self-auto"
            >
              Questions about the menu? 💬
            </button>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <article
                key={item.name}
                className="group overflow-hidden rounded-3xl border border-orange-100/80 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[#f9eee2] to-[#f1d6b9] transition group-hover:from-[#f5e0c9] group-hover:to-[#eac39b]">
                  <span className="text-8xl transition duration-300 group-hover:scale-110">
                    {item.emoji}
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-[10px] font-bold tracking-[0.18em] text-[#a13d20]">
                    {item.category}
                  </p>

                  <h3 className="mt-2 text-lg font-bold">
                    {item.name}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-stone-500">
                    {item.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
                    <span className="font-black text-[#a13d20]">
                      {item.price}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        openChat();

                        if (item.name === "Classic Beef Burger") {
                          submitQuestion("Beef burger price");
                        } else {
                          submitQuestion("View menu");
                        }
                      }}
                      className="rounded-full bg-[#fff1e3] px-4 py-2 text-xs font-bold text-[#a13d20] transition hover:bg-[#a13d20] hover:text-white"
                    >
                      Ask about it
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-6 text-center text-xs leading-6 text-stone-500">
            Sample menu and demonstration prices for a student project.
          </p>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
      >
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[2.5rem] bg-[#e8d0b7] p-8 text-center sm:min-h-[380px]">
            <span className="text-8xl">👨‍🍳</span>

            <p className="mt-5 font-serif text-3xl font-bold text-[#71351f]">
              Good food. Great company.
            </p>

            <p className="mt-3 max-w-sm text-sm leading-7 text-stone-700">
              A welcoming space for sharing meals, making memories, and
              enjoying the little things.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a13d20]">
              A little about us
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
              More than a meal. It&apos;s a moment.
            </h2>

            <p className="mt-5 leading-8 text-stone-600">
              DineDesk is a fictional restaurant concept built to
              demonstrate a modern restaurant website with an interactive
              rule-based customer support chatbot.
            </p>

            <p className="mt-4 leading-8 text-stone-600">
              Whether you want to explore the menu, ask about delivery,
              learn our sample opening hours, or find out about payment
              methods, our virtual assistant makes information easy to
              access.
            </p>

            <button
              type="button"
              onClick={openChat}
              className="mt-7 rounded-full bg-[#a13d20] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#812e17]"
            >
              Meet Your Virtual Assistant →
            </button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="bg-[#30251f] px-5 py-16 text-white sm:px-8 sm:py-20"
      >
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-300">
              Let&apos;s talk
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Got a question?
              <br />
              We&apos;re all ears.
            </h2>

            <p className="mt-4 max-w-lg leading-7 text-stone-300">
              Our chatbot can help you explore the sample menu, check
              demonstration prices, and learn about restaurant services.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl">
                💬
              </span>

              <div>
                <h3 className="font-bold">
                  DineDesk Virtual Assistant
                </h3>

                <p className="mt-1 text-sm text-stone-300">
                  Ask a question anytime on this demo site.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openChat}
              className="mt-6 w-full rounded-full bg-orange-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-orange-700"
            >
              Start a Conversation →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#241b17] px-5 py-6 text-center text-xs text-stone-400">
        <p>
          © 2026 DineDesk Restaurant. Student project demonstration.
        </p>

        <p className="mt-2">
          Sample menu, prices, and restaurant information are fictional.
        </p>
      </footer>

      {/* Floating Chat Button */}
      {!chatOpen && (
        <button
          type="button"
          onClick={openChat}
          aria-label="Open DineDesk chatbot"
          className="fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#a13d20] text-3xl text-white shadow-2xl shadow-orange-950/30 transition duration-300 hover:scale-110 hover:bg-[#812e17] sm:bottom-7 sm:right-7"
        >
          💬

          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-green-500 text-[10px]">
            ●
          </span>
        </button>
      )}

      {/* Chat Window */}
      {chatOpen && (
        <section
          aria-label="DineDesk customer support chat"
          className="fixed bottom-4 right-3 z-50 flex h-[min(590px,calc(100dvh-32px))] w-[calc(100vw-24px)] max-w-[390px] flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-2xl shadow-stone-900/20 sm:bottom-7 sm:right-7 sm:h-[590px]"
        >
          {/* Chat Header */}
          <header className="flex shrink-0 items-center gap-3 bg-[#a13d20] px-4 py-4 text-white">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-xl">
              🍽️

              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#a13d20] bg-green-400" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-bold">
                DineDesk Assistant
              </h2>

              <p className="mt-0.5 text-xs text-orange-100">
                Online · Here to help
              </p>
            </div>

            <button
              type="button"
              onClick={resetChat}
              title="Start new conversation"
              aria-label="Reset conversation"
              className="flex h-9 w-9 items-center justify-center rounded-full text-xl transition hover:bg-white/15"
            >
              ↻
            </button>

            <button
              type="button"
              onClick={closeChat}
              aria-label="Close chatbot"
              className="flex h-9 w-9 items-center justify-center rounded-full text-2xl transition hover:bg-white/15"
            >
              ×
            </button>
          </header>

          {/* Chat Messages */}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#fffaf5] p-4">
            <div className="text-center text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              Restaurant support
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.sender === "bot" && (
                  <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#a13d20] text-xs text-white">
                    🍴
                  </div>
                )}

                <div
                  className={`max-w-[84%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-3 text-[13px] leading-6 ${
                    message.sender === "user"
                      ? "rounded-br-sm bg-[#a13d20] text-white"
                      : "rounded-bl-sm border border-orange-100 bg-white text-stone-700 shadow-sm"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          {/* Suggested Questions */}
          <div className="shrink-0 border-t border-orange-100 bg-white px-3 py-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Quick questions
            </p>

            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => submitQuestion(question)}
                  className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-medium text-[#a13d20] transition hover:border-[#a13d20] hover:bg-[#a13d20] hover:text-white"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            className="flex shrink-0 items-center gap-2 border-t border-orange-100 bg-white p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your question..."
              aria-label="Chat message"
              className="min-w-0 flex-1 rounded-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-[#a13d20] focus:ring-2 focus:ring-orange-100"
            />

            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#a13d20] text-xl text-white transition hover:bg-[#812e17] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ↑
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
