import { TestimonyCardProps } from "@/types/testimony";

export const mockTestimonies: TestimonyCardProps[] = [
  {
    id: 1,
    testimony: {
      photo: "/images/user1.jpg",
      username: "Sarah Johnson",
      opinion:
        "This product completely transformed my workflow. Couldn't be happier!",
    },
  },
  {
    id: 2,
    testimony: {
      photo: "/images/user2.jpg",
      username: "Michael Chen",
      opinion:
        "Best decision I made for my business this year. The interface is so intuitive.",
    },
  },
  {
    id: 3,
    testimony: {
      photo: "/images/user3.jpg",
      username: "Emma Davies",
      opinion:
        "The customer support team is amazing. They helped me set everything up in minutes.",
    },
  },
  {
    id: 4,
    testimony: {
      photo: "/images/user4.jpg",
      username: "James Wilson",
      opinion:
        "I've tried many similar products, but this one stands out. Highly recommended!",
    },
  },
  {
    id: 5,
    testimony: {
      photo: "/images/user5.jpg",
      username: "Maria Garcia",
      opinion:
        "The features are exactly what I needed. It's like they read my mind!",
    },
  },
];
